package com.lbdevz.obf.transforms;

import org.objectweb.asm.*;

import java.security.SecureRandom;
import java.util.*;

/**
 * ASM transform: replaces plaintext String LDC instructions with XOR-encoded
 * int-array decode calls, so no string ever sits in the constant pool.
 *
 * Before: ldc "localhost:3000"
 * After:  ldc_w { encoded ints... }, invokestatic _lbd_d([I)Ljava/lang/String;
 *
 * The decode helper _lbd_d([I) is injected into every class that needs it.
 * It operates on int[] and char[], never referencing a String literal internally,
 * so Paper's bytecode remapper (which only renames class/method/field references)
 * cannot corrupt it.
 */
public class ConstantObfTransform {

    static final String DECODE_METHOD = "_lbd_d";
    static final String DECODE_DESC   = "([I)Ljava/lang/String;";

    private static final SecureRandom RNG = new SecureRandom();

    // ─── Public API ───────────────────────────────────────────────────────────

    /** Transform a single class's bytecode. */
    public static byte[] transform(byte[] classBytes) {
        ClassReader  cr = new ClassReader(classBytes);
        ClassWriter  cw = new ClassWriter(ClassWriter.COMPUTE_FRAMES) {
            @Override
            protected String getCommonSuperClass(String a, String b) {
                try { return super.getCommonSuperClass(a, b); }
                catch (Throwable t) { return "java/lang/Object"; }
            }
        };
        ConstantObfVisitor cv = new ConstantObfVisitor(cw);
        cr.accept(cv, ClassReader.EXPAND_FRAMES);
        return cw.toByteArray();
    }

    /** Transform a whole map of class-name → bytes. */
    public static Map<String, byte[]> transformAll(Map<String, byte[]> classes) {
        Map<String, byte[]> out = new LinkedHashMap<>();
        for (Map.Entry<String, byte[]> e : classes.entrySet()) {
            byte[] data = e.getValue();
            try {
                data = transform(data);
            } catch (Throwable t) {
                System.out.println("[ConstantObf] skip " + e.getKey() + ": " + t.getMessage());
            }
            out.put(e.getKey(), data);
        }
        return out;
    }

    // ─── Class Visitor ────────────────────────────────────────────────────────

    static class ConstantObfVisitor extends ClassVisitor {
        private String  className;
        private boolean hasDecodeMethod = false;
        private boolean needsDecodeMethod = false;

        ConstantObfVisitor(ClassVisitor cv) {
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
            if (name.equals(DECODE_METHOD) && descriptor.equals(DECODE_DESC)) {
                hasDecodeMethod = true;
            }
            MethodVisitor mv = super.visitMethod(access, name, descriptor, signature, exceptions);
            return new ConstantObfMethodVisitor(mv, className, this);
        }

        @Override
        public void visitEnd() {
            if (needsDecodeMethod && !hasDecodeMethod) {
                injectDecodeMethod(cv, className);
            }
            super.visitEnd();
        }

        void markNeedsDecodeMethod() {
            needsDecodeMethod = true;
        }
    }

    // ─── Method Visitor ───────────────────────────────────────────────────────

    static class ConstantObfMethodVisitor extends MethodVisitor {
        private final String             className;
        private final ConstantObfVisitor owner;

        ConstantObfMethodVisitor(MethodVisitor mv, String className,
                                  ConstantObfVisitor owner) {
            super(Opcodes.ASM9, mv);
            this.className = className;
            this.owner     = owner;
        }

        @Override
        public void visitLdcInsn(Object value) {
            if (value instanceof String) {
                String s = (String) value;
                // Skip very short strings, Java descriptor patterns,
                // and LBDEVZ_LIC_ slots (patched at download-time, must stay as plain constants)
                if (s.length() >= 3 && !s.startsWith("(") && !s.startsWith("LBDEVZ_LIC_")) {
                    emitEncodedArray(s);
                    mv.visitMethodInsn(Opcodes.INVOKESTATIC,
                        className, DECODE_METHOD, DECODE_DESC, false);
                    owner.markNeedsDecodeMethod();
                    return;
                }
            }
            super.visitLdcInsn(value);
        }

        /**
         * Emit bytecode that pushes a new int[] onto the stack.
         * Layout: { (c0^K), (c1^K), ..., (cn-1^K), K }
         * The last element is the XOR key, so the decoder can recover the key
         * without any separate constant.
         */
        private void emitEncodedArray(String s) {
            int key    = RNG.nextInt(256);     // per-string random key
            int len    = s.length();
            int arrLen = len + 1;              // +1 for the key appended at end

            // newarray int[arrLen]
            pushInt(arrLen);
            mv.visitIntInsn(Opcodes.NEWARRAY, Opcodes.T_INT);

            for (int i = 0; i < len; i++) {
                mv.visitInsn(Opcodes.DUP);
                pushInt(i);
                pushInt(s.charAt(i) ^ key);
                mv.visitInsn(Opcodes.IASTORE);
            }
            // Append key at index len
            mv.visitInsn(Opcodes.DUP);
            pushInt(len);
            pushInt(key);
            mv.visitInsn(Opcodes.IASTORE);
        }

        /** Push an int constant using the most compact available opcode. */
        private void pushInt(int v) {
            if (v >= -1 && v <= 5) {
                mv.visitInsn(Opcodes.ICONST_0 + v);  // ICONST_M1..ICONST_5
            } else if (v >= Byte.MIN_VALUE && v <= Byte.MAX_VALUE) {
                mv.visitIntInsn(Opcodes.BIPUSH, v);
            } else if (v >= Short.MIN_VALUE && v <= Short.MAX_VALUE) {
                mv.visitIntInsn(Opcodes.SIPUSH, v);
            } else {
                mv.visitLdcInsn(v);
            }
        }
    }

    // ─── Injected decode method ───────────────────────────────────────────────

    /**
     * Injects the following method into the target class (in bytecode only —
     * no source-visible declaration):
     *
     *   private static String _lbd_d(int[] v) {
     *       int k = v[v.length - 1];
     *       char[] c = new char[v.length - 1];
     *       for (int i = 0; i < c.length; i++) c[i] = (char)(v[i] ^ k);
     *       return new String(c);
     *   }
     *
     * This method contains ZERO String literals, so Paper's remapper and any
     * string-strip decompiler cannot extract anything meaningful from it.
     */
    static void injectDecodeMethod(ClassVisitor cv, String className) {
        MethodVisitor mv = cv.visitMethod(
            Opcodes.ACC_PRIVATE | Opcodes.ACC_STATIC,
            DECODE_METHOD, DECODE_DESC, null, null);
        mv.visitCode();

        // Locals:
        //   0: int[] v  (parameter)
        //   1: int k    (key = v[v.length - 1])
        //   2: char[] c
        //   3: int i    (loop counter)

        // int k = v[v.length - 1]
        mv.visitVarInsn(Opcodes.ALOAD, 0);
        mv.visitVarInsn(Opcodes.ALOAD, 0);
        mv.visitInsn(Opcodes.ARRAYLENGTH);
        mv.visitInsn(Opcodes.ICONST_1);
        mv.visitInsn(Opcodes.ISUB);
        mv.visitInsn(Opcodes.IALOAD);
        mv.visitVarInsn(Opcodes.ISTORE, 1);  // k

        // char[] c = new char[v.length - 1]
        mv.visitVarInsn(Opcodes.ALOAD, 0);
        mv.visitInsn(Opcodes.ARRAYLENGTH);
        mv.visitInsn(Opcodes.ICONST_1);
        mv.visitInsn(Opcodes.ISUB);
        mv.visitIntInsn(Opcodes.NEWARRAY, Opcodes.T_CHAR);
        mv.visitVarInsn(Opcodes.ASTORE, 2);  // c

        // int i = 0
        mv.visitInsn(Opcodes.ICONST_0);
        mv.visitVarInsn(Opcodes.ISTORE, 3);

        // loop while i < c.length
        Label loopStart = new Label();
        Label loopEnd   = new Label();

        mv.visitLabel(loopStart);
        mv.visitVarInsn(Opcodes.ILOAD, 3);
        mv.visitVarInsn(Opcodes.ALOAD, 2);
        mv.visitInsn(Opcodes.ARRAYLENGTH);
        mv.visitJumpInsn(Opcodes.IF_ICMPGE, loopEnd);

        // c[i] = (char)(v[i] ^ k)
        mv.visitVarInsn(Opcodes.ALOAD, 2);
        mv.visitVarInsn(Opcodes.ILOAD, 3);
        mv.visitVarInsn(Opcodes.ALOAD, 0);
        mv.visitVarInsn(Opcodes.ILOAD, 3);
        mv.visitInsn(Opcodes.IALOAD);
        mv.visitVarInsn(Opcodes.ILOAD, 1);
        mv.visitInsn(Opcodes.IXOR);
        mv.visitInsn(Opcodes.I2C);
        mv.visitInsn(Opcodes.CASTORE);

        // i++
        mv.visitIincInsn(3, 1);
        mv.visitJumpInsn(Opcodes.GOTO, loopStart);

        mv.visitLabel(loopEnd);

        // return new String(c)
        mv.visitTypeInsn(Opcodes.NEW, "java/lang/String");
        mv.visitInsn(Opcodes.DUP);
        mv.visitVarInsn(Opcodes.ALOAD, 2);
        mv.visitMethodInsn(Opcodes.INVOKESPECIAL, "java/lang/String",
            "<init>", "([C)V", false);
        mv.visitInsn(Opcodes.ARETURN);

        mv.visitMaxs(5, 4);
        mv.visitEnd();
    }
}