package com.lbdevz.loader;

import org.bukkit.plugin.java.JavaPlugin;
import java.io.*;
import java.lang.reflect.*;
import java.security.*;
import java.util.*;
import java.util.logging.Logger;

/**
 * LBDevz Protected Plugin Loader — extends JavaPlugin for Bukkit compatibility.
 * Only this loader is visible to decompilers. Real plugin code lives encrypted
 * in protected.dat inside the JAR.
 */
public class LoaderPlugin extends JavaPlugin {

    // ── Non-final: javac emits ldc (not ConstantValue attr) ──
    // KBAKED_HEX placeholder is exactly 64 chars (= 32-byte AES key in hex)
    // so the constant pool entry size never changes when Packager patches it.
    private static String KBAKED_HEX  = "LBDEVZ_KBAKED_HEX_PLACEHOLDER_0000000000000000000000000000000000";
    private static String MAIN_CLASS   = "LBDEVZ_MAIN_CLASS";
    private static String API_ENDPOINT = "LBDEVZ_API_ENDPOINT";
    private static String LIC_ENV      = "LBDEVZ_LICENSE_KEY_ENV";
    private static String ED25519_PUB  = "LBDEVZ_ED25519_PUBKEY";
    // Baked at download-time per-user (48-char fixed slot, NOT obfuscated by ConstantObfTransform)
    private static String LBDEVZ_LIC_BAKED_KEY = "LBDEVZ_LIC_KEY_SLOT_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

    private Object realPlugin;
    private EncryptedClassLoader ecl;

    // ─── Bukkit Lifecycle ────────────────────────────────────────────────────

    @Override
    public void onEnable() {
        Logger log = getLogger();

        // Anti-debug
        if (isInstrumented()) {
            log.severe("[LBDevz] Debugging detected. Disabling.");
            getServer().getPluginManager().disablePlugin(this);
            return;
        }

        log.info("[LBDevz] Verifying license...");

        String licenseKey = getLicenseKey();
        if (licenseKey == null || licenseKey.isBlank()) {
            log.severe("[LBDevz] LICENSE_KEY not set. Set the " + LIC_ENV + " env variable.");
            getServer().getPluginManager().disablePlugin(this);
            return;
        }

        // Parse endpoint  [scheme://]host:port
        String scheme = "http";
        String endpoint = API_ENDPOINT;
        int schemeIdx = endpoint.indexOf("://");
        if (schemeIdx > 0) {
            scheme   = endpoint.substring(0, schemeIdx);
            endpoint = endpoint.substring(schemeIdx + 3);
        }
        String host = "localhost";
        int    port = "https".equals(scheme) ? 443 : 3000;
        int    col  = endpoint.lastIndexOf(':');
        if (col > 0) {
            host = endpoint.substring(0, col);
            try { port = Integer.parseInt(endpoint.substring(col + 1)); }
            catch (NumberFormatException ignored) {}
        } else if (!endpoint.isBlank()) {
            host = endpoint;
        }

        // Fresh per-request nonce binds the response (signature) to this call,
        // defeating replay of a previously captured valid response.
        String nonce = newNonce();

        // 1. Validate license → Kserver
        LicenseValidator validator = new LicenseValidator(scheme, host, port, licenseKey, nonce);
        LicenseValidator.ValidateResult result = validator.validate();
        if (!result.valid) {
            log.severe("[LBDevz] License invalid: " + result.error);
            getServer().getPluginManager().disablePlugin(this);
            return;
        }

        // 1b. Nonce echo check — response must correspond to our request.
        if (result.nonce != null && !nonce.equals(result.nonce)) {
            log.severe("[LBDevz] Nonce mismatch — possible replay/MITM.");
            getServer().getPluginManager().disablePlugin(this);
            return;
        }

        // 2. Ed25519 signature (anti-MITM). Active only when a real pubkey was
        //    baked in. Payload = licenseKey:hex(keyHalf):nonce (matches server).
        if (!ED25519_PUB.startsWith("LBDEVZ_")) {
            if (result.signature == null) {
                log.severe("[LBDevz] Missing signature — refusing to start.");
                getServer().getPluginManager().disablePlugin(this);
                return;
            }
            try {
                verifySignature(licenseKey + ":" + toHex(result.keyHalf) + ":" + nonce,
                    result.signature, ED25519_PUB);
            } catch (Exception e) {
                log.severe("[LBDevz] " + e.getMessage());
                getServer().getPluginManager().disablePlugin(this);
                return;
            }
        }

        // ── License banner ──────────────────────────────────────────────────
        String owner   = result.ownerName     != null ? result.ownerName     : "?";
        String product = result.product       != null ? result.product       : getDescription().getName();
        String latest  = result.latestVersion != null ? result.latestVersion : null;
        String current = getDescription().getVersion();

        // Censor license key: show first segment + mask the rest  e.g. LBD-XXXXXX-********
        String censoredKey = licenseKey;
        String[] parts = licenseKey.split("-");
        if (parts.length >= 3) {
            StringBuilder masked = new StringBuilder(parts[0]).append("-").append(parts[1]);
            for (int pi = 2; pi < parts.length; pi++) {
                masked.append("-").append("*".repeat(parts[pi].length()));
            }
            censoredKey = masked.toString();
        }

        log.info("==============================================");
        log.info("  Urun       : " + product);
        log.info("  Versiyon   : " + current);
        log.info("  Lisans     : " + censoredKey);
        log.info("  Sahip      : " + owner);
        if (latest != null && !latest.equals(current)) {
            log.warning("  [!] GUNCELLEME MEVCUT: v" + latest + " yayinda!");
            log.warning("      Lisanslarim sayfasindan indirebilirsiniz.");
        }
        log.info("==============================================");
        log.info("[LBDevz] Sifrelenmiyor...");

        try {
            // 3. K = Kserver XOR Kbaked  (split-key: neither half alone decrypts)
            byte[] kBaked = fromHex(KBAKED_HEX);
            byte[] kFull  = xorKeys(result.keyHalf, kBaked);
            Arrays.fill(kBaked, (byte) 0);

            // 5. Load protected.dat from JAR
            InputStream pdat = getClass().getClassLoader()
                .getResourceAsStream("protected.dat");
            if (pdat == null) {
                throw new FileNotFoundException("protected.dat not found in JAR");
            }
            byte[] protectedDat = pdat.readAllBytes();
            pdat.close();

            // 6. Decrypt + load classes
            ecl = new EncryptedClassLoader(protectedDat, kFull,
                getClass().getClassLoader());
            Arrays.fill(kFull, (byte) 0);

            log.info("[LBDevz] Loaded " + ecl.getClassNames().size() + " classes.");

            // 7. Instantiate real plugin bypassing constructor (which checks classloader),
            //    then inject JavaPlugin context so getServer() etc. work correctly.
            Class<?> mainClass = ecl.loadClass(MAIN_CLASS);
            realPlugin = unsafeAllocate(mainClass);
            injectPluginContext(realPlugin);

            // Re-point all registered commands from LoaderPlugin → realPlugin.
            // Paper checks command.getPlugin() == this in getCommand(), so the
            // owner must match the real plugin instance, not LoaderPlugin.
            reownCommands(realPlugin);

            invokeIfPresent(realPlugin, "onEnable");
            log.info("[LBDevz] Plugin started successfully.");

        } catch (Exception e) {
            log.severe("[LBDevz] Failed to start: " + e.getMessage());
            e.printStackTrace();
            getServer().getPluginManager().disablePlugin(this);
        }
    }

    @Override
    public void onDisable() {
        if (realPlugin != null) {
            invokeIfPresent(realPlugin, "onDisable");
        }
    }

    @Override
    public void onLoad() {
        if (realPlugin != null) {
            invokeIfPresent(realPlugin, "onLoad");
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private String getLicenseKey() {
        // 1. Baked at download-time into the JAR (highest priority)
        if (!LBDEVZ_LIC_BAKED_KEY.startsWith("LBDEVZ_LIC_")) {
            return LBDEVZ_LIC_BAKED_KEY.trim();
        }
        // 2. Environment variable (server admin override)
        String env = System.getenv(LIC_ENV);
        if (env != null && !env.isBlank()) return env;
        // 3. config.yml (license-key: XXX)
        try {
            saveDefaultConfig();
            String cfg = getConfig().getString("license-key");
            if (cfg != null && !cfg.isBlank()) return cfg;
        } catch (Throwable ignored) {}
        // 4. JVM system property
        return System.getProperty("lbdevz.licenseKey");
    }

    /**
     * Copy JavaPlugin's private context fields (server, loader, dataFolder, etc.)
     * from this LoaderPlugin into the decrypted real plugin instance.
     * Without this, the real plugin's getServer() / getDataFolder() return null.
     */
    private void injectPluginContext(Object plugin) {
        try {
            Class<?> jpClass = Class.forName("org.bukkit.plugin.java.JavaPlugin",
                false, getClass().getClassLoader());
            if (!jpClass.isAssignableFrom(plugin.getClass())) return;

            // Fields Bukkit sets via JavaPlugin.init() — copy them from ourselves.
            // "pluginMeta" is how Paper 1.19+ stores plugin.yml metadata.
            // "isEnabled" / "enabled" must be true so registerEvents() passes.
            String[] fieldNames = { "loader", "server", "description",
                "dataFolder", "classLoader", "naggable", "configFile",
                "newConfig", "fileConfiguration", "logger", "commands",
                "pluginMeta", "isEnabled", "enabled" };

            for (String fieldName : fieldNames) {
                try {
                    java.lang.reflect.Field f = findField(jpClass, fieldName);
                    if (f == null) continue;
                    f.setAccessible(true);
                    Object value = f.get(this);
                    if (value != null) f.set(plugin, value);
                } catch (Throwable ignored) {}
            }
            // Force enabled = true regardless of field name variant
            for (String enabledName : new String[]{"enabled", "isEnabled"}) {
                try {
                    java.lang.reflect.Field f = findField(jpClass, enabledName);
                    if (f != null && (f.getType() == boolean.class || f.getType() == Boolean.class)) {
                        f.setAccessible(true);
                        f.set(plugin, true);
                    }
                } catch (Throwable ignored) {}
            }
        } catch (Throwable e) {
            getLogger().warning("[LBDevz] Context inject warn: " + e.getMessage());
        }
    }

    /** Re-assign all PluginCommand owners from this LoaderPlugin to the real plugin
     *  so that realPlugin.getCommand("name") passes the ownership check. */
    private void reownCommands(Object realPlugin) {
        try {
            // Get all commands registered to this LoaderPlugin from the server
            java.util.Map<String, org.bukkit.command.Command> knownCmds =
                getServer().getCommandMap().getKnownCommands();
            for (org.bukkit.command.Command cmd : knownCmds.values()) {
                if (cmd instanceof org.bukkit.command.PluginCommand) {
                    org.bukkit.command.PluginCommand pc =
                        (org.bukkit.command.PluginCommand) cmd;
                    if (pc.getPlugin() == this) {
                        // setPlugin is package-private — use reflection
                        Field f = findField(pc.getClass(), "owningPlugin");
                        if (f == null) f = findField(pc.getClass(), "plugin");
                        if (f != null) {
                            f.setAccessible(true);
                            f.set(pc, realPlugin);
                        }
                    }
                }
            }
        } catch (Throwable e) {
            getLogger().warning("[LBDevz] reownCommands warn: " + e.getMessage());
        }
    }

    /** Allocate an instance WITHOUT calling any constructor — bypasses the
     *  JavaPlugin classloader check while still producing a valid object. */
    @SuppressWarnings("unchecked")
    private static <T> T unsafeAllocate(Class<T> cls) throws Exception {
        java.lang.reflect.Field f = sun.misc.Unsafe.class.getDeclaredField("theUnsafe");
        f.setAccessible(true);
        sun.misc.Unsafe unsafe = (sun.misc.Unsafe) f.get(null);
        return (T) unsafe.allocateInstance(cls);
    }

    private static java.lang.reflect.Field findField(Class<?> c, String name) {
        while (c != null) {
            try { return c.getDeclaredField(name); } catch (NoSuchFieldException e) {}
            c = c.getSuperclass();
        }
        return null;
    }

    private static void invokeIfPresent(Object obj, String methodName) {
        try {
            Method m = obj.getClass().getMethod(methodName);
            m.invoke(obj);
        } catch (NoSuchMethodException ignored) {
        } catch (java.lang.reflect.InvocationTargetException e) {
            Throwable cause = e.getCause() != null ? e.getCause() : e;
            Logger log = Logger.getLogger("LBDevzLoader");
            log.warning("[LBDevz] " + methodName + " error: " + cause);
            for (StackTraceElement el : cause.getStackTrace()) {
                log.warning("  at " + el);
            }
        } catch (Exception e) {
            Logger.getLogger("LBDevzLoader").warning("[LBDevz] " + methodName + " error: " + e);
        }
    }

    private static boolean isInstrumented() {
        try {
            java.lang.management.RuntimeMXBean rt =
                java.lang.management.ManagementFactory.getRuntimeMXBean();
            for (String arg : rt.getInputArguments()) {
                String a = arg.toLowerCase();
                if (a.contains("jdwp") || a.contains("-xdebug")
                    || a.contains("-agentlib") || a.contains("-agentpath")
                    || a.contains("-javaagent")) return true;
            }
        } catch (Throwable ignored) {}
        return false;
    }

    private static byte[] sha256(byte[] in) throws Exception {
        return MessageDigest.getInstance("SHA-256").digest(in);
    }

    private static byte[] xorKeys(byte[] a, byte[] b) {
        if (a == null || b == null) throw new IllegalStateException("null key");
        int len = Math.min(a.length, b.length);
        byte[] out = new byte[len];
        for (int i = 0; i < len; i++) out[i] = (byte)(a[i] ^ b[i]);
        return out;
    }

    private static byte[] fromHex(String hex) {
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2)
            data[i / 2] = (byte)((Character.digit(hex.charAt(i), 16) << 4)
                               + Character.digit(hex.charAt(i + 1), 16));
        return data;
    }

    private static String toHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) sb.append(String.format("%02x", b));
        return sb.toString();
    }

    /** 128-bit random hex nonce for replay/MITM protection. */
    private static String newNonce() {
        byte[] n = new byte[16];
        new SecureRandom().nextBytes(n);
        return toHex(n);
    }

    private static void verifySignature(String payload, String sigB64, String pubKeyB64)
            throws Exception {
        byte[] pub = Base64.getDecoder().decode(pubKeyB64);
        byte[] sig = Base64.getDecoder().decode(sigB64);
        byte[] msg = payload.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        KeyFactory kf = KeyFactory.getInstance("Ed25519");
        PublicKey pk = kf.generatePublic(new java.security.spec.X509EncodedKeySpec(pub));
        Signature s = Signature.getInstance("Ed25519");
        s.initVerify(pk);
        s.update(msg);
        if (!s.verify(sig)) throw new SecurityException("[LBDevz] Signature verification failed.");
    }
}