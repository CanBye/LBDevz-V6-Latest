package com.lbdevz.obf;

import com.lbdevz.obf.pack.Packager;
import java.io.*;
import java.nio.file.*;
import java.util.Base64;

/**
 * LBDevz Plugin Obfuscation Engine — Main Entry
 *
 * Usage:
 *   java -cp "obf-worker.jar" com.lbdevz.obf.ObfWorker \
 *     <input.jar> <output.jar> <productId> \
 *     [apiHost] [apiPort] [licEnvVar] [mainClass] [apiScheme] [ed25519PubB64]
 *
 * Output (stdout, last lines):
 *   KSERVER=<base64>
 *   CHECKSUM=<sha256hex>
 *   MAPPINGKEY=<uuid>
 *   STATUS=done
 */
public class ObfWorker {

    public static void main(String[] args) throws Exception {
        if (args.length < 3) {
            System.err.println("Usage: ObfWorker <input.jar> <output.jar> <productId> [apiHost] [apiPort] [licEnvVar] [mainClass]");
            System.exit(1);
        }

        Path   inputJar   = Paths.get(args[0]);
        Path   outputJar  = Paths.get(args[1]);
        String productId  = args[2];
        String apiHost    = args.length > 3 ? args[3] : "localhost";
        int    apiPort    = args.length > 4 ? Integer.parseInt(args[4]) : 3000;
        String licEnvVar  = args.length > 5 ? args[5] : "LICENSE_KEY";
        String mainClass  = args.length > 6 ? args[6] : null;
        String apiScheme  = args.length > 7 && !args[7].isBlank() ? args[7] : "http";
        String ed25519Pub = args.length > 8 ? args[8] : "";

        if (!Files.exists(inputJar)) {
            System.err.println("ERROR: Input JAR not found: " + inputJar);
            System.exit(2);
        }

        // Detect main class from plugin.yml if not provided
        if (mainClass == null || mainClass.isBlank()) {
            mainClass = detectMainClass(inputJar);
        }
        if (mainClass == null) {
            System.err.println("ERROR: Cannot detect main class from plugin.yml. Pass it as arg[6].");
            System.exit(3);
        }
        System.out.println("[ObfWorker] Main class: " + mainClass);

        // Loader classes dir — next to obf-worker.jar or in runtime/
        Path loaderDir = findLoaderDir();
        System.out.println("[ObfWorker] Loader dir: " + loaderDir);

        // Run packaging
        Packager packager = new Packager(
            inputJar, outputJar, loaderDir,
            mainClass, apiHost, apiPort, licEnvVar, productId,
            apiScheme, ed25519Pub
        );
        packager.pack();

        // Print structured output (parsed by Next.js caller)
        System.out.println();
        System.out.println("KSERVER=" + Base64.getEncoder().encodeToString(packager.kServer));
        System.out.println("CHECKSUM=" + packager.checksum);
        System.out.println("MAPPINGKEY=" + packager.mappingKey);
        System.out.println("STATUS=done");
    }

    // ─── Detect main class from plugin.yml inside JAR ────────────────────────

    static String detectMainClass(Path jarPath) throws IOException {
        try (java.util.zip.ZipInputStream zis = new java.util.zip.ZipInputStream(
                new FileInputStream(jarPath.toFile()))) {
            java.util.zip.ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if ("plugin.yml".equals(entry.getName())) {
                    String yml = new String(zis.readAllBytes(), "UTF-8");
                    for (String line : yml.split("\n")) {
                        line = line.trim();
                        if (line.startsWith("main:")) {
                            return line.substring(5).trim();
                        }
                    }
                }
                zis.closeEntry();
            }
        }
        return null;
    }

    // ─── Find compiled loader .class directory ────────────────────────────────

    static Path findLoaderDir() throws IOException {
        // Try: ./loader-classes  (where build.ps1 puts them)
        Path p1 = Paths.get("loader-classes");
        if (Files.exists(p1)) return p1;

        // Try: same dir as ObfWorker jar (handle Windows /C:/... URI path)
        try {
            java.net.URI jarUri = ObfWorker.class.getProtectionDomain()
                .getCodeSource().getLocation().toURI();
            Path p2 = Paths.get(jarUri).getParent().resolve("loader-classes");
            if (Files.exists(p2)) return p2;
        } catch (Exception ignored) {}

        // Try: apps/obf-worker/loader-classes
        Path p3 = Paths.get("apps", "obf-worker", "loader-classes");
        if (Files.exists(p3)) return p3;

        throw new FileNotFoundException(
            "loader-classes directory not found. Run build.ps1 first.");
    }
}