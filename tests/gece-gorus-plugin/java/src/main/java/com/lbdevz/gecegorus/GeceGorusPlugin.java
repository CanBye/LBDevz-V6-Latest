package com.lbdevz.gecegorus;

import java.net.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

// ─────────────────────────────────────────────────────────────────────────────
// Bukkit API Stubs (gercek sunucuda yerini spigot-api.jar alir)
// ─────────────────────────────────────────────────────────────────────────────

class PotionEffectType {
    static final PotionEffectType NIGHT_VISION = new PotionEffectType("NIGHT_VISION");
    private final String name;
    PotionEffectType(String n) { this.name = n; }
    String getName() { return name; }
}

class PotionEffect {
    private final PotionEffectType type;
    private final int duration, amplifier;
    PotionEffect(PotionEffectType t, int d, int a) { type = t; duration = d; amplifier = a; }
    PotionEffectType getType() { return type; }
    int getDuration()   { return duration; }
    int getAmplifier()  { return amplifier; }
}

class BukkitPlayer {
    private final String name;
    private final Map<String, PotionEffect> effects = new HashMap<>();
    BukkitPlayer(String n) { this.name = n; }
    String getName() { return name; }
    boolean hasPermission(String p) { return name.equals("Admin") || p.equals("gecegorus.use"); }
    void sendMessage(String msg) { System.out.println("  [MSG -> " + name + "] " + msg); }
    void addPotionEffect(PotionEffect e) {
        effects.put(e.getType().getName(), e);
        System.out.printf("  [Effect] %s -> %s (sure: %ds, guc: %d)%n",
            name, e.getType().getName(), e.getDuration() / 20, e.getAmplifier());
    }
    void removePotionEffect(PotionEffectType t) { effects.remove(t.getName()); }
    boolean hasPotionEffect(PotionEffectType t) { return effects.containsKey(t.getName()); }
}

class BukkitServer {
    private final List<BukkitPlayer> players = new ArrayList<>();
    private final Map<String, BukkitCommandExecutor> commands = new HashMap<>();
    void addPlayer(BukkitPlayer p) { players.add(p); }
    void registerCommand(String name, BukkitCommandExecutor exec) {
        commands.put(name.toLowerCase(), exec);
        System.out.println("  [Server] Komut kayit: /" + name);
    }
    BukkitPlayer getPlayer(String name) {
        return players.stream().filter(p -> p.getName().equalsIgnoreCase(name)).findFirst().orElse(null);
    }
    List<BukkitPlayer> getOnlinePlayers() { return players; }
    void broadcastMessage(String msg) { System.out.println("  [Broadcast] " + msg); }
    void dispatch(String playerName, String cmd) {
        String[] parts = cmd.trim().split("\\s+");
        String name = parts[0].replaceFirst("^/", "").toLowerCase();
        String[] args = Arrays.copyOfRange(parts, 1, parts.length);
        BukkitPlayer p = getPlayer(playerName);
        if (p == null) { System.out.println("  [Server] Oyuncu yok: " + playerName); return; }
        BukkitCommandExecutor exec = commands.get(name);
        if (exec != null) exec.onCommand(p, args);
        else System.out.println("  [Server] Bilinmeyen komut: /" + name);
    }
}

interface BukkitCommandExecutor {
    void onCommand(BukkitPlayer sender, String[] args);
}

// ─────────────────────────────────────────────────────────────────────────────
// GeceGorus Plugin
// ─────────────────────────────────────────────────────────────────────────────
public class GeceGorusPlugin {

    private static final String PLUGIN_NAME = "GeceGorus";
    private static final String VERSION     = "1.0.0";
    private static final int    NV_DURATION = 6000;   // ticks
    private static final int    NV_AMP      = 1;

    private final Set<String>   activeNV = new HashSet<>();
    private BukkitServer        server;
    private String              licenseKey;

    // ─── Lifecycle ───────────────────────────────────────────────────────────

    public void onEnable(BukkitServer srv) {
        this.server = srv;
        licenseKey  = Optional.ofNullable(System.getenv("LICENSE_KEY")).orElse("LBD-TEST0000-TEST0000");

        System.out.println("\n╔════════════════════════════════════════════╗");
        System.out.println("║     GeceGorus Plugin  --  LBDevz           ║");
        System.out.println("╚════════════════════════════════════════════╝\n");
        System.out.println("Lisans dogrulanıyor...");

        try { validateLicense(licenseKey); }
        catch (Exception e) { System.err.println("HATA: " + e.getMessage()); System.exit(1); }

        server.registerCommand("gecegorus", (sender, args) -> handleCommand(sender, args));
        server.broadcastMessage("[" + PLUGIN_NAME + "] v" + VERSION + " yuklendi! (/gecegorus)");
        System.out.println("\n  [" + PLUGIN_NAME + "] Hazir.\n");
    }

    public void onDisable() {
        activeNV.clear();
        System.out.println("  [" + PLUGIN_NAME + "] Devre disi birakildi.");
    }

    // ─── Lisans Dogrulama ─────────────────────────────────────────────────────

    private void validateLicense(String key) throws Exception {
        String host = Optional.ofNullable(System.getenv("API_HOST")).orElse("localhost");
        int    port = Integer.parseInt(Optional.ofNullable(System.getenv("API_PORT")).orElse("3000"));
        String body = "{\"licenseKey\":\"" + key.replace("\"", "\\\"") + "\"}";

        URL url = new URI("http", null, host, port, "/api/v1/license/validate", null, null).toURL();
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);
        conn.setConnectTimeout(8000);
        conn.setReadTimeout(8000);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(body.getBytes(StandardCharsets.UTF_8));
        }

        int status = conn.getResponseCode();
        InputStream is = (status < 400) ? conn.getInputStream() : conn.getErrorStream();
        String resp = new String(is.readAllBytes(), StandardCharsets.UTF_8);

        if (status != 200) {
            String err = jsonGet(resp, "error");
            throw new RuntimeException(err != null ? err : "HTTP " + status);
        }

        System.out.println("Lisans gecerli!");
        System.out.println("   Urun  : " + coalesce(jsonGet(resp, "product"), PLUGIN_NAME));
        System.out.println("   Durum : " + coalesce(jsonGet(resp, "status"), "active"));
        System.out.println("   Key   : " + coalesce(jsonGet(resp, "licenseKey"), key));
    }

    // ─── Komut ───────────────────────────────────────────────────────────────

    private void handleCommand(BukkitPlayer player, String[] args) {
        if (!player.hasPermission("gecegorus.use")) {
            player.sendMessage("Bu komutu kullanmak icin izniniz yok!"); return;
        }
        String sub = (args.length > 0) ? args[0].toLowerCase() : "toggle";

        if (sub.equals("ver") || sub.equals("give")) {
            if (args.length < 2) { player.sendMessage("Kullanim: /gecegorus ver <oyuncu>"); return; }
            BukkitPlayer target = server.getPlayer(args[1]);
            if (target == null) { player.sendMessage("Oyuncu bulunamadi: " + args[1]); return; }
            applyNV(target);
            player.sendMessage(target.getName() + " adli oyuncuya gece gorusu verildi.");
        } else if (sub.equals("kapat") || sub.equals("off")) {
            removeNV(player);
        } else {
            if (activeNV.contains(player.getName())) removeNV(player); else applyNV(player);
        }
    }

    private void applyNV(BukkitPlayer p) {
        p.addPotionEffect(new PotionEffect(PotionEffectType.NIGHT_VISION, NV_DURATION, NV_AMP));
        activeNV.add(p.getName());
        p.sendMessage("[GeceGorus] Gece gorusu AKTIF!");
    }

    private void removeNV(BukkitPlayer p) {
        p.removePotionEffect(PotionEffectType.NIGHT_VISION);
        activeNV.remove(p.getName());
        p.sendMessage("[GeceGorus] Gece gorusu KAPATILDI.");
    }

    // ─── Yardimcilar ─────────────────────────────────────────────────────────

    private static String jsonGet(String json, String field) {
        String key = "\"" + field + "\"";
        int i = json.indexOf(key); if (i < 0) return null;
        int c = json.indexOf(':', i + key.length()); if (c < 0) return null;
        int s = c + 1;
        while (s < json.length() && (json.charAt(s) == ' ' || json.charAt(s) == '\t')) s++;
        if (s >= json.length()) return null;
        if (json.charAt(s) == '"') {
            int e = json.indexOf('"', s + 1); return e < 0 ? null : json.substring(s + 1, e);
        }
        int e = s;
        while (e < json.length() && json.charAt(e) != ',' && json.charAt(e) != '}') e++;
        return json.substring(s, e).trim();
    }

    private static String coalesce(String a, String b) { return (a != null && !a.isEmpty()) ? a : b; }

    // ─── Main ────────────────────────────────────────────────────────────────

    public static void main(String[] passedArgs) throws Exception {
        BukkitServer server = new BukkitServer();
        server.addPlayer(new BukkitPlayer("Admin"));
        server.addPlayer(new BukkitPlayer("Oyuncu1"));
        server.addPlayer(new BukkitPlayer("Oyuncu2"));

        GeceGorusPlugin plugin = new GeceGorusPlugin();
        plugin.onEnable(server);

        System.out.println("--- Komut Demo ----------------------------------");
        server.dispatch("Admin",    "/gecegorus");
        server.dispatch("Oyuncu1",  "/gecegorus");
        server.dispatch("Admin",    "/gecegorus ver Oyuncu2");
        server.dispatch("Oyuncu1",  "/gecegorus kapat");
        server.dispatch("Admin",    "/gecegorus");

        System.out.println("\n--- Aktif Oyuncular ----------------------------");
        if (plugin.activeNV.isEmpty()) System.out.println("  (yok)");
        else plugin.activeNV.forEach(n -> System.out.println("  OK " + n));

        System.out.println("\nPlugin demo tamamlandi.");
        plugin.onDisable();
    }
}