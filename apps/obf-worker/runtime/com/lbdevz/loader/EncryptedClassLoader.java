package com.lbdevz.loader;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.*;
import java.util.*;
import java.util.zip.*;

/**
 * Decrypts protected.dat (AES-256-GCM) and defines classes into JVM.
 *
 * protected.dat layout:
 *   [12 bytes IV][16 bytes GCM auth tag (appended by GCM)][ciphertext...]
 *   ciphertext decrypts to a ZIP of .class entries
 */
public class EncryptedClassLoader extends ClassLoader {

    private static final int GCM_IV_LEN  = 12;
    private static final int AES_KEY_LEN = 32;

    private final Map<String, byte[]> classBytes = new HashMap<>();

    /**
     * Decrypt protected.dat, parse classes into memory.
     *
     * @param protectedDat  raw bytes of protected.dat from JAR resources
     * @param aesKey        32-byte AES key (Kserver XOR Kbaked)
     * @param parent        parent ClassLoader (Bukkit plugin CL)
     */
    public EncryptedClassLoader(byte[] protectedDat, byte[] aesKey, ClassLoader parent)
            throws Exception {
        super(parent);
        if (aesKey.length != AES_KEY_LEN) {
            throw new IllegalArgumentException("AES key must be 32 bytes");
        }
        byte[] decrypted = decryptGCM(protectedDat, aesKey);
        loadClassesFromZip(decrypted);
    }

    // ─── Class loading ────────────────────────────────────────────────────────

    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        byte[] b = classBytes.get(name);
        if (b == null) throw new ClassNotFoundException(name);
        return defineClass(name, b, 0, b.length);
    }

    public Set<String> getClassNames() {
        return classBytes.keySet();
    }

    // ─── AES-256-GCM decrypt ─────────────────────────────────────────────────

    static byte[] decryptGCM(byte[] data, byte[] key) throws Exception {
        if (data.length < GCM_IV_LEN + 16) {
            throw new IllegalArgumentException("protected.dat too short");
        }
        byte[] iv   = Arrays.copyOfRange(data, 0, GCM_IV_LEN);
        byte[] body = Arrays.copyOfRange(data, GCM_IV_LEN, data.length);

        SecretKeySpec   keySpec = new SecretKeySpec(key, "AES");
        GCMParameterSpec gcmSpec = new GCMParameterSpec(128, iv);

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE, keySpec, gcmSpec);
        return cipher.doFinal(body);
    }

    // ─── Load .class files from ZIP bytes ────────────────────────────────────

    private void loadClassesFromZip(byte[] zipBytes) throws IOException {
        try (ZipInputStream zis = new ZipInputStream(
                new ByteArrayInputStream(zipBytes))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                String name = entry.getName();
                if (name.endsWith(".class")) {
                    String className = name
                        .replace('/', '.')
                        .replace('\\', '.')
                        .substring(0, name.length() - 6);
                    byte[] b = zis.readAllBytes();
                    classBytes.put(className, b);
                }
                zis.closeEntry();
            }
        }
    }
}