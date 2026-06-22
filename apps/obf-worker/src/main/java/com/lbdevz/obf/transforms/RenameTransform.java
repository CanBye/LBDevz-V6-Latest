package com.lbdevz.obf.transforms;

import org.objectweb.asm.*;
import java.util.*;

/**
 * ASM transform: renames methods and fields to meaningless hex names.
 * Class renaming is skipped (complex cross-reference — handled by Packager).
 * Bukkit lifecycle methods are preserved.
 */
public class RenameTransform {

    private static final Set<String> PRESERVED = new HashSet<>(Arrays.asList(
        "onEnable", "onDisable", "onLoad", "onCommand", "onTabComplete",
        "main", "<init>", "<clinit>", "hashCode", "equals", "toString",
        "getDescription", "getConfig", "saveDefaultConfig", "run", "call"
    ));

    private int counter = 0;
    private final Map<String, String> methodRename = new LinkedHashMap<>();

    // ─── Phase 1: Collect method names to rename ─────────────────────────────

    public void analyze(byte[] classBytes) {
        ClassReader cr = new ClassReader(classBytes);
        cr.accept(new ClassVisitor(Opcodes.ASM9) {
            @Override
            public MethodVisitor visitMethod(int access, String name,
                    String descriptor, String signature, String[] exceptions) {
                // Only rename truly private methods.
                // Public/protected methods may override external API (Bukkit, PAPI, etc.)
                // and renaming them breaks the override contract.
                boolean isPrivate = (access & Opcodes.ACC_PRIVATE) != 0;
                if (isPrivate && !PRESERVED.contains(name) && !name.startsWith("_lbd_")
                        && !methodRename.containsKey(name)) {
                    methodRename.put(name, "_m" + String.format("%04x", counter++));
                }
                return null;
            }
            @Override
            public FieldVisitor visitField(int access, String name,
                    String descriptor, String signature, Object value) {
                return null;
            }
        }, ClassReader.SKIP_CODE);
    }

    // ─── Phase 2: Apply rename ────────────────────────────────────────────────

    public byte[] transform(byte[] classBytes) {
        ClassReader cr = new ClassReader(classBytes);
        ClassWriter cw = new ClassWriter(cr, 0);
        cr.accept(new ClassVisitor(Opcodes.ASM9, cw) {
            @Override
            public MethodVisitor visitMethod(int access, String name,
                    String descriptor, String signature, String[] exceptions) {
                String newName = methodRename.getOrDefault(name, name);
                MethodVisitor mv = super.visitMethod(access, newName,
                    descriptor, signature, exceptions);
                return new MethodRenameVisitor(mv);
            }
        }, 0);
        return cw.toByteArray();
    }

    /** Rewrites method invocations to use new names. */
    class MethodRenameVisitor extends MethodVisitor {
        MethodRenameVisitor(MethodVisitor mv) { super(Opcodes.ASM9, mv); }

        @Override
        public void visitMethodInsn(int opcode, String owner, String name,
                                     String descriptor, boolean isInterface) {
            String newName = methodRename.getOrDefault(name, name);
            super.visitMethodInsn(opcode, owner, newName, descriptor, isInterface);
        }
    }
}