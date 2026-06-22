package com.lbdevz.obf.pack;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.*;
import java.nio.file.*;
import java.security.SecureRandom;
import java.util.*;
import java.util.zip.*;

/**
 * Katman-2 packaging engine.
 *
 * Takes an input JAR, separates bootstrap vs. protected classes,
 * AES-256-GCM encrypts the protected bundle, generates split-key,
 * patches LoaderPlugin stub with runtime constants, builds output JAR.
 *
 * protected.dat layout: [12-byte IV][GCM-ciphertext+16-byte tag]
 * inner ZIP: all protected .class files
 */
public class Packager {

    private static final int GCM_IV_LEN  = 12;
    private static final int AES_KEY_LEN = 32; // 256 bit

    private final Path   inputJar;
    private final Path   outputJar;
    private final Path   loaderClassDir; // compiled loader .class files
    private final String realMainClass;  // e.g. com.example.MyPlugin
    private final String apiHost;
    private final int    apiPort;
    private final String licEnvVar;
    private final String productId;      // for DB key storage
    private final String apiScheme;      // "http" or "https" — baked into endpoint
    private final String ed25519PubB64;  // SPKI/DER base64 pubkey for anti-MITM (may be empty)

    // Result filled after pack()
    public byte[] kServer;               // 32 bytes — store in DB
    public byte[] kBaked;                // 32 bytes — baked into loader
    public String checksum;              // SHA-256 hex of output JAR
    public String mappingKey;            // random UUID for admin UI

    public Packager(Path inputJar, Path outputJar, Path loaderClassDir,
                    String realMainClass, String apiHost, int apiPort,
                    String licEnvVar, String productId) {
        this(inputJar, outputJar, loaderClassDir, realMainClass, apiHost,
             apiPort, licEnvVar, productId, "http", "");
    }

    public Packager(Path inputJar, Path outputJar, Path loaderClassDir,
                    String realMainClass, String apiHost, int apiPort,
                    String licEnvVar, String productId,
                    String apiScheme, String ed25519PubB64) {
        this.inputJar       = inputJar;
        this.outputJar      = outputJar;
        this.loaderClassDir = loaderClassDir;
        this.realMainClass  = realMainClass;
        this.apiHost        = apiHost;
        this.apiPort        = apiPort;
        this.licEnvVar      = licEnvVar;
        this.productId      = productId;
        this.apiScheme      = (apiScheme == null || apiScheme.isBlank()) ? "http" : apiScheme;
        this.ed25519PubB64  = ed25519PubB64 == null ? "" : ed25519PubB64;
    }

    // ─── Main entry ──────────────────────────────────────────────────────────

    public void pack() throws Exception {
        System.out.println("[Packager] Reading input JAR: " + inputJar);

        // 1. Read all entries from input JAR
        Map<String, byte[]> classes   = new LinkedHashMap<>(); // name -> bytes
        Map<String, byte[]> resources = new LinkedHashMap<>(); // plugin.yml etc.

        try (ZipInputStream zis = new ZipInputStream(
                new FileInputStream(inputJar.toFile()))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                byte[] data = zis.readAllBytes();
                if (entry.getName().endsWith(".class")) {
                    classes.put(entry.getName(), data);
                } else {
                    resources.put(entry.getName(), data);
                }
                zis.closeEntry();
            }
        }
        System.out.println("[Packager] Found " + classes.size() +
            " classes, " + resources.size() + " resources.");

        // 2. Patch plugin.yml — change main class to loader
        String loaderMain = "com.lbdevz.loader.LoaderPlugin";
        if (resources.containsKey("plugin.yml")) {
            String yml = new String(resources.get("plugin.yml"), "UTF-8");
            yml = patchPluginYml(yml, loaderMain);
            resources.put("plugin.yml", yml.getBytes("UTF-8"));
            System.out.println("[Packager] plugin.yml main -> " + loaderMain);
        }

        // 3. Katman-1: Apply ASM bytecode transforms (graceful fallback if ASM absent)
        try {
            Class<?> pipelineClass = Class.forName("com.lbdevz.obf.transforms.AsmPipeline");
            java.lang.reflect.Method transformMethod = pipelineClass.getMethod("transform", Map.class);
            @SuppressWarnings("unchecked")
            Map<String, byte[]> obfClasses = (Map<String, byte[]>) transformMethod.invoke(null, classes);
            classes = obfClasses;
            System.out.println("[Packager] Katman-1 ASM obfuscation applied.");
        } catch (ClassNotFoundException e) {
            System.out.println("[Packager] ASM not available, skipping Katman-1 (Katman-2 only).");
        } catch (Exception e) {
            System.out.println("[Packager] ASM transform error (continuing with Katman-2): " + e.getMessage());
        }

        // 4. Build protected ZIP (all obfuscated plugin classes)
        byte[] protectedZip = buildZip(classes);
        System.out.println("[Packager] Protected ZIP: " +
            protectedZip.length + " bytes");

        // 4. Generate AES keys
        kServer = generateKey();
        kBaked  = generateKey();
        byte[] kFull = xorKeys(kServer, kBaked);
        System.out.println("[Packager] Keys generated.");

        // 5. Encrypt to protected.dat
        byte[] protectedDat = encryptGCM(protectedZip, kFull);
        System.out.println("[Packager] protected.dat: " +
            protectedDat.length + " bytes (AES-256-GCM)");

        // 6. Read & patch loader .class files
        Map<String, byte[]> loaderClasses = readLoaderClasses();
        // Endpoint baked as scheme://host:port so the loader knows http vs https.
        String endpoint = apiScheme + "://" + apiHost + ":" + apiPort;
        loaderClasses = patchLoaderConstants(loaderClasses, kBaked,
            realMainClass, endpoint, licEnvVar, ed25519PubB64);
        System.out.println("[Packager] Loader classes patched: " +
            loaderClasses.size() + " files.");

        // Apply int-array constant obfuscation to loader classes.
        // This replaces every String LDC in the loader with a call to _lbd_d([I),
        // which XOR-decodes a per-string int[] at runtime.  Unlike the old
        // XOR-string approach, Paper's remapper cannot corrupt raw int[] literals
        // or arithmetic opcodes, so this survives the Paper relocation pass.
        loaderClasses = constObfuscateLoader(loaderClasses);
        System.out.println("[Packager] Loader constant obfuscation applied.");

        // 7. Build output JAR
        try (ZipOutputStream zos = new ZipOutputStream(
                new FileOutputStream(outputJar.toFile()))) {

            // Loader classes — STORED (uncompressed) so download-time byte patching works
            for (Map.Entry<String, byte[]> e : loaderClasses.entrySet()) {
                addEntryStored(zos, e.getKey(), e.getValue());
            }

            // Resources (patched plugin.yml etc.)
            for (Map.Entry<String, byte[]> e : resources.entrySet()) {
                addEntry(zos, e.getKey(), e.getValue());
            }

            // Encrypted payload
            addEntry(zos, "protected.dat", protectedDat);
        }

        // 8. Compute checksum of output JAR
        byte[] jarBytes = Files.readAllBytes(outputJar);
        checksum   = sha256Hex(jarBytes);
        mappingKey = UUID.randomUUID().toString();

        System.out.println("[Packager] Output JAR: " + outputJar);
        System.out.println("[Packager] SHA-256: " + checksum);
        System.out.println("[Packager] kServer (DB): " + toHex(kServer));
        System.out.println("[Packager] Done.");
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private static byte[] generateKey() throws Exception {
        KeyGenerator kg = KeyGenerator.getInstance("AES");
        kg.init(AES_KEY_LEN * 8, new SecureRandom());
        SecretKey sk = kg.generateKey();
        return sk.getEncoded();
    }

    static byte[] encryptGCM(byte[] plaintext, byte[] key) throws Exception {
        byte[] iv = new byte[GCM_IV_LEN];
        new SecureRandom().nextBytes(iv);

        SecretKeySpec  keySpec = new SecretKeySpec(key, "AES");
        GCMParameterSpec gcmSpec = new GCMParameterSpec(128, iv);
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, gcmSpec);
        byte[] ct = cipher.doFinal(plaintext);

        // layout: [IV][ciphertext+tag]
        byte[] out = new byte[GCM_IV_LEN + ct.length];
        System.arraycopy(iv, 0, out, 0, GCM_IV_LEN);
        System.arraycopy(ct, 0, out, GCM_IV_LEN, ct.length);
        return out;
    }

    private static byte[] buildZip(Map<String, byte[]> entries) throws IOException {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(bos)) {
            for (Map.Entry<String, byte[]> e : entries.entrySet()) {
                addEntry(zos, e.getKey(), e.getValue());
            }
        }
        return bos.toByteArray();
    }

    private Map<String, byte[]> readLoaderClasses() throws IOException {
        Map<String, byte[]> result = new LinkedHashMap<>();
        if (!Files.exists(loaderClassDir)) {
            throw new FileNotFoundException("Loader class dir not found: " + loaderClassDir);
        }
        Files.walk(loaderClassDir)
            .filter(p -> p.toString().endsWith(".class"))
            .forEach(p -> {
                String rel = loaderClassDir.relativize(p).toString()
                    .replace('\\', '/');
                try {
                    result.put(rel, Files.readAllBytes(p));
                } catch (IOException e) {
                    throw new UncheckedIOException(e);
                }
            });
        return result;
    }

    /**
     * Patch loader .class bytecode: replace known string constants
     * (the LBDEVZ_* placeholders) with real values.
     * We do simple byte-level search-and-replace on the constant pool strings.
     */
    private static Map<String, byte[]> patchLoaderConstants(
            Map<String, byte[]> classes,
            byte[] kBaked, String mainClass, String endpoint,
            String licEnvVar, String ed25519PubB64) throws IOException {

        // Placeholder is exactly 64 chars = same length as a 32-byte hex string.
        // Same length means no constant pool size change and no remapper corruption.
        final String KBAKED_PLACEHOLDER = "LBDEVZ_KBAKED_HEX_PLACEHOLDER_0000000000000000000000000000000000";

        Map<String, byte[]> patched = new LinkedHashMap<>();
        for (Map.Entry<String, byte[]> e : classes.entrySet()) {
            byte[] data = e.getValue();
            if (e.getKey().contains("LoaderPlugin")) {
                data = replaceConstant(data, KBAKED_PLACEHOLDER, toHex(kBaked));
                data = replaceConstant(data, "LBDEVZ_MAIN_CLASS",      mainClass);
                data = replaceConstant(data, "LBDEVZ_API_ENDPOINT",    endpoint);
                data = replaceConstant(data, "LBDEVZ_LICENSE_KEY_ENV", licEnvVar);
                // Anti-MITM pubkey — only patched when configured; otherwise the
                // placeholder stays as "LBDEVZ_..." and the loader skips the check.
                if (ed25519PubB64 != null && !ed25519PubB64.isBlank()) {
                    data = replaceConstant(data, "LBDEVZ_ED25519_PUBKEY", ed25519PubB64);
                }
            }
            patched.put(e.getKey(), data);
        }
        return patched;
    }

    /** String-encrypt the loader classes via ASM (graceful fallback). */
    private static Map<String, byte[]> obfuscateLoader(Map<String, byte[]> loaderClasses) {
        try {
            Class<?> t = Class.forName("com.lbdevz.obf.transforms.StringEncryptTransform");
            java.lang.reflect.Method transform = t.getMethod("transform", byte[].class);
            Map<String, byte[]> out = new LinkedHashMap<>();
            for (Map.Entry<String, byte[]> e : loaderClasses.entrySet()) {
                byte[] data = e.getValue();
                try {
                    data = (byte[]) transform.invoke(null, (Object) data);
                } catch (Throwable ex) {
                    System.out.println("[Packager] loader obf skip " + e.getKey()
                        + ": " + ex.getMessage());
                }
                out.put(e.getKey(), data);
            }
            return out;
        } catch (ClassNotFoundException e) {
            System.out.println("[Packager] ASM absent — loader not string-encrypted.");
            return loaderClasses;
        } catch (Exception e) {
            System.out.println("[Packager] loader obf error: " + e.getMessage());
            return loaderClasses;
        }
    }

    /** Apply int-array constant obfuscation to loader classes (graceful fallback). */
    private static Map<String, byte[]> constObfuscateLoader(Map<String, byte[]> loaderClasses) {
        try {
            Class<?> t = Class.forName("com.lbdevz.obf.transforms.ConstantObfTransform");
            java.lang.reflect.Method transformAll =
                t.getMethod("transformAll", Map.class);
            @SuppressWarnings("unchecked")
            Map<String, byte[]> out = (Map<String, byte[]>) transformAll.invoke(null, loaderClasses);
            return out;
        } catch (ClassNotFoundException e) {
            System.out.println("[Packager] ASM absent — loader constant obfuscation skipped.");
            return loaderClasses;
        } catch (Exception e) {
            System.out.println("[Packager] constObf error: " + e.getMessage());
            return loaderClasses;
        }
    }

    static byte[] sha256Bytes(byte[] in) throws Exception {
        return java.security.MessageDigest.getInstance("SHA-256").digest(in);
    }

    /**
     * Replace a UTF-8 string constant in a .class file.
     * Java class files store strings as UTF-8 in constant pool (CONSTANT_Utf8).
     * Format: [0x01][2-byte length][bytes]
     * We do byte-level search-replace preserving the length field.
     */
    static byte[] replaceConstant(byte[] classBytes, String oldStr, String newStr)
            throws IOException {
        byte[] oldBytes = oldStr.getBytes("UTF-8");
        byte[] newBytes = newStr.getBytes("UTF-8");

        if (newBytes.length > oldBytes.length + 255) {
            throw new IOException("Replacement string too long for constant pool patch: " + newStr);
        }

        // Build search pattern: 0x01 + 2-byte big-endian length + string bytes
        byte[] pattern = new byte[3 + oldBytes.length];
        pattern[0] = 0x01;
        pattern[1] = (byte)((oldBytes.length >> 8) & 0xFF);
        pattern[2] = (byte)(oldBytes.length & 0xFF);
        System.arraycopy(oldBytes, 0, pattern, 3, oldBytes.length);

        int idx = indexOf(classBytes, pattern);
        if (idx < 0) {
            System.out.println("[Packager] Warning: constant not found in class: " + oldStr);
            return classBytes;
        }

        // Build replacement: same tag + new length + new bytes
        byte[] replacement = new byte[3 + newBytes.length];
        replacement[0] = 0x01;
        replacement[1] = (byte)((newBytes.length >> 8) & 0xFF);
        replacement[2] = (byte)(newBytes.length & 0xFF);
        System.arraycopy(newBytes, 0, replacement, 3, newBytes.length);

        // Build output
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        bos.write(classBytes, 0, idx);
        bos.write(replacement);
        bos.write(classBytes, idx + pattern.length,
            classBytes.length - idx - pattern.length);
        return bos.toByteArray();
    }

    private static int indexOf(byte[] haystack, byte[] needle) {
        outer:
        for (int i = 0; i <= haystack.length - needle.length; i++) {
            for (int j = 0; j < needle.length; j++) {
                if (haystack[i + j] != needle[j]) continue outer;
            }
            return i;
        }
        return -1;
    }

    private static String patchPluginYml(String yml, String newMain) {
        return yml.replaceAll("(?m)^main:\\s*.+$", "main: " + newMain);
    }

    private static void addEntry(ZipOutputStream zos, String name, byte[] data)
            throws IOException {
        ZipEntry entry = new ZipEntry(name);
        zos.putNextEntry(entry);
        zos.write(data);
        zos.closeEntry();
    }

    /** Add a STORED (uncompressed) entry — required for loader classes so download-time
     *  byte-level patching can find constant pool strings without decompressing. */
    private static void addEntryStored(ZipOutputStream zos, String name, byte[] data)
            throws IOException {
        ZipEntry entry = new ZipEntry(name);
        entry.setMethod(ZipEntry.STORED);
        entry.setSize(data.length);
        entry.setCompressedSize(data.length);
        java.util.zip.CRC32 crc = new java.util.zip.CRC32();
        crc.update(data);
        entry.setCrc(crc.getValue());
        zos.putNextEntry(entry);
        zos.write(data);
        zos.closeEntry();
    }

    static byte[] xorKeys(byte[] a, byte[] b) {
        byte[] out = new byte[Math.min(a.length, b.length)];
        for (int i = 0; i < out.length; i++) out[i] = (byte)(a[i] ^ b[i]);
        return out;
    }

    static String toHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) sb.append(String.format("%02x", b));
        return sb.toString();
    }

    static String sha256Hex(byte[] data) throws Exception {
        java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
        return toHex(md.digest(data));
    }
}