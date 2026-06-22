package com.lbdevz.obf.transforms;

import java.util.*;

/**
 * Runs all ASM transforms on a JAR's class files in sequence.
 * Order: Rename -> StringEncrypt -> JunkCode
 */
public class AsmPipeline {

    public static Map<String, byte[]> transform(Map<String, byte[]> classes) {
        System.out.println("[ASM] Starting Katman-1 bytecode transforms on " +
            classes.size() + " classes...");

        // Phase 1: Analyze all classes for rename candidates
        RenameTransform renamer = new RenameTransform();
        for (byte[] b : classes.values()) {
            try { renamer.analyze(b); } catch (Exception ignored) {}
        }

        Map<String, byte[]> result = new LinkedHashMap<>();
        int transformed = 0;

        for (Map.Entry<String, byte[]> e : classes.entrySet()) {
            String name       = e.getKey();
            byte[] classBytes = e.getValue();

            // Never touch loader classes
            if (name.contains("com/lbdevz/loader")) {
                result.put(name, classBytes);
                continue;
            }

            try {
                classBytes = renamer.transform(classBytes);
                classBytes = StringEncryptTransform.transform(classBytes);
                classBytes = JunkCodeTransform.transform(classBytes);
                transformed++;
            } catch (Exception ex) {
                System.out.println("[ASM] Warning: " + name + " -> " + ex.getMessage());
            }

            result.put(name, classBytes);
        }

        System.out.println("[ASM] Transformed " + transformed + "/" +
            classes.size() + " classes.");
        return result;
    }
}