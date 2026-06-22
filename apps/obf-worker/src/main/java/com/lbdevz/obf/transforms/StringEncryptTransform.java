package com.lbdevz.obf.transforms;

import org.objectweb.asm.*;
import java.util.*;

/**
 * ASM transform: encrypts all String constants with XOR and injects a runtime decrypt method.
 *
 * Before: ldc "Hello World"
 * After:  ldc "\x48\x2e..." (xor'd bytes as unicode) -> invokestatic decrypt(String)
 *
 * The decrypt method is injected into each class. Even if decompiled,
 * the strings appear as garbled bytes and the decrypt call.
 */
public class StringEncryptTransform {

    private static final String DECRYPT_METHOD = "_lbd_d";
    private static final int    XOR_KEY        = 0x4C; // 'L' from LBDevz

    public static byte[] transform(byte[] classBytes) {
        ClassReader  cr = new ClassReader(classBytes);
        // IMPORTANT: do NOT pass `cr` to ClassWriter — that copies the original
        // constant pool verbatim, leaving orphaned PLAINTEXT string entries.
        // Building a fresh pool drops the original (now-encrypted) strings.
        ClassWriter  cw = new ClassWriter(ClassWriter.COMPUTE_FRAMES) {
            @Override
            protected String getCommonSuperClass(String a, String b) {
                try {
                    return super.getCommonSuperClass(a, b);
                } catch (Throwable t) {
                    return "java/lang/Object";
                }
            }
        };
        StringEncryptVisitor cv = new StringEncryptVisitor(cw);
        cr.accept(cv, ClassReader.EXPAND_FRAMES);
        return cw.toByteArray();
    }

    // ─── Class Visitor ────────────────────────────────────────────────────────

    static class StringEncryptVisitor extends ClassVisitor {
        private String className;
        private boolean hasDecryptMethod = false;
        private final List<String> encryptedStrings = new ArrayList<>();

        StringEncryptVisitor(ClassVisitor cv) {
            super(Opcodes.ASM9, cv);
        }

        @Override
        public void visit(int version, int access, String name, String signature,
                          String superName, String[] interfaces) {
            this.className = name;
            super.visit(version, access, name, signature, superName, interfaces);
        }

        @Override
        public MethodVisitor visitMethod(int access, String name, String descriptor,
                                         String signature, String[] exceptions) {
            if (name.equals(DECRYPT_METHOD)) hasDecryptMethod = true;
            MethodVisitor mv = super.visitMethod(access, name, descriptor, signature, exceptions);
            return new StringEncryptMethodVisitor(mv, className);
        }

        @Override
        public void visitEnd() {
            // Inject decrypt method if not already there
            if (!hasDecryptMethod) {
                injectDecryptMethod(cv, className);
            }
            super.visitEnd();
        }
    }

    // ─── Method Visitor ───────────────────────────────────────────────────────

    static class StringEncryptMethodVisitor extends MethodVisitor {
        private final String className;

        StringEncryptMethodVisitor(MethodVisitor mv, String className) {
            super(Opcodes.ASM9, mv);
            this.className = className;
        }

        @Override
        public void visitLdcInsn(Object value) {
            if (value instanceof String) {
                String original = (String) value;
                // Encrypt any non-trivial string (XOR round-trip is lossless,
                // so even "/"-containing strings like URLs/descriptors are safe).
                // Skip method descriptors (start with "(") and tiny strings.
                if (original.length() >= 3 && !original.startsWith("(")) {
                    String encrypted = xorEncrypt(original);
                    // Push encrypted string, then call decrypt
                    super.visitLdcInsn(encrypted);
                    super.visitMethodInsn(Opcodes.INVOKESTATIC,
                        className, DECRYPT_METHOD,
                        "(Ljava/lang/String;)Ljava/lang/String;", false);
                    return;
                }
            }
            super.visitLdcInsn(value);
        }
    }

    // ─── Inject decrypt static method ─────────────────────────────────────────

    static void injectDecryptMethod(ClassVisitor cv, String className) {
        // private static String _lbd_d(String s)
        MethodVisitor mv = cv.visitMethod(
            Opcodes.ACC_PRIVATE | Opcodes.ACC_STATIC,
            DECRYPT_METHOD, "(Ljava/lang/String;)Ljava/lang/String;",
            null, null);
        mv.visitCode();

        /*
         * Generated code:
         *   char[] chars = s.toCharArray();
         *   for (int i = 0; i < chars.length; i++) chars[i] ^= XOR_KEY;
         *   return new String(chars);
         */
        Label loopStart = new Label();
        Label loopEnd   = new Label();

        // char[] chars = s.toCharArray()
        mv.visitVarInsn(Opcodes.ALOAD, 0);
        mv.visitMethodInsn(Opcodes.INVOKEVIRTUAL, "java/lang/String",
            "toCharArray", "()[C", false);
        mv.visitVarInsn(Opcodes.ASTORE, 1);  // chars

        // int i = 0
        mv.visitInsn(Opcodes.ICONST_0);
        mv.visitVarInsn(Opcodes.ISTORE, 2);  // i

        // loop: i < chars.length
        mv.visitLabel(loopStart);
        mv.visitVarInsn(Opcodes.ALOAD, 1);
        mv.visitInsn(Opcodes.ARRAYLENGTH);
        mv.visitVarInsn(Opcodes.ILOAD, 2);
        mv.visitJumpInsn(Opcodes.IF_ICMPLE, loopEnd);

        // chars[i] ^= XOR_KEY
        mv.visitVarInsn(Opcodes.ALOAD, 1);
        mv.visitVarInsn(Opcodes.ILOAD, 2);
        mv.visitVarInsn(Opcodes.ALOAD, 1);
        mv.visitVarInsn(Opcodes.ILOAD, 2);
        mv.visitInsn(Opcodes.CALOAD);
        mv.visitIntInsn(Opcodes.BIPUSH, XOR_KEY);
        mv.visitInsn(Opcodes.IXOR);
        mv.visitInsn(Opcodes.I2C);
        mv.visitInsn(Opcodes.CASTORE);

        // i++
        mv.visitIincInsn(2, 1);
        mv.visitJumpInsn(Opcodes.GOTO, loopStart);

        mv.visitLabel(loopEnd);

        // return new String(chars)
        mv.visitTypeInsn(Opcodes.NEW, "java/lang/String");
        mv.visitInsn(Opcodes.DUP);
        mv.visitVarInsn(Opcodes.ALOAD, 1);
        mv.visitMethodInsn(Opcodes.INVOKESPECIAL, "java/lang/String",
            "<init>", "([C)V", false);
        mv.visitInsn(Opcodes.ARETURN);

        mv.visitMaxs(4, 3);
        mv.visitEnd();
    }

    // ─── XOR encrypt string ───────────────────────────────────────────────────

    static String xorEncrypt(String s) {
        char[] chars = s.toCharArray();
        for (int i = 0; i < chars.length; i++) {
            chars[i] ^= XOR_KEY;
        }
        return new String(chars);
    }
}