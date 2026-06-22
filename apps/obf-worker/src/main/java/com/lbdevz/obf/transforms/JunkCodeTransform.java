package com.lbdevz.obf.transforms;

import org.objectweb.asm.*;
import java.util.Random;

/**
 * ASM transform: injects dead code blocks and opaque predicates into methods.
 * Makes decompiled output confusing and harder to follow.
 *
 * Technique: before each method body start, inject a dead branch
 * using an opaque predicate that is always false but JVM verifier allows.
 *
 * Example injected at method start:
 *   if (System.currentTimeMillis() < 0L) { throw new Error(); }  // never executes
 */
public class JunkCodeTransform {

    public static byte[] transform(byte[] classBytes) {
        ClassReader  cr = new ClassReader(classBytes);
        ClassWriter  cw = new ClassWriter(cr, ClassWriter.COMPUTE_FRAMES);
        cr.accept(new JunkClassVisitor(cw), ClassReader.EXPAND_FRAMES);
        return cw.toByteArray();
    }

    static class JunkClassVisitor extends ClassVisitor {
        JunkClassVisitor(ClassVisitor cv) { super(Opcodes.ASM9, cv); }

        @Override
        public MethodVisitor visitMethod(int access, String name, String descriptor,
                                         String signature, String[] exceptions) {
            MethodVisitor mv = super.visitMethod(access, name, descriptor,
                signature, exceptions);
            // Skip constructors, static initializers, and very short methods
            if (name.equals("<init>") || name.equals("<clinit>")) return mv;
            return new JunkMethodVisitor(mv);
        }
    }

    static class JunkMethodVisitor extends MethodVisitor {
        private static final Random RNG = new Random(0x4C424456L);
        private boolean injected = false;

        JunkMethodVisitor(MethodVisitor mv) { super(Opcodes.ASM9, mv); }

        @Override
        public void visitCode() {
            super.visitCode();
            if (!injected) {
                injectOpaqueJunk(mv);
                injected = true;
            }
        }
    }

    /**
     * Inject: if (System.currentTimeMillis() < 0L) { throw new RuntimeException(); }
     * This dead branch confuses decompilers and adds noise.
     */
    static void injectOpaqueJunk(MethodVisitor mv) {
        Label skip = new Label();

        // System.currentTimeMillis() — always > 0
        mv.visitMethodInsn(Opcodes.INVOKESTATIC, "java/lang/System",
            "currentTimeMillis", "()J", false);
        mv.visitInsn(Opcodes.LCONST_0);
        mv.visitInsn(Opcodes.LCMP);
        mv.visitJumpInsn(Opcodes.IFGE, skip); // always taken

        // Dead branch: meaningless operations
        mv.visitTypeInsn(Opcodes.NEW, "java/lang/RuntimeException");
        mv.visitInsn(Opcodes.DUP);
        mv.visitLdcInsn("lbdz");
        mv.visitMethodInsn(Opcodes.INVOKESPECIAL, "java/lang/RuntimeException",
            "<init>", "(Ljava/lang/String;)V", false);
        mv.visitInsn(Opcodes.ATHROW);

        mv.visitLabel(skip);
    }
}