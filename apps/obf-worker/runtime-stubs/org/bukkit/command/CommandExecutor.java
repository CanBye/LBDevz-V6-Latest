package org.bukkit.command;
/** Minimal compile-time stub. */
public interface CommandExecutor {
    boolean onCommand(CommandSender sender, Command command, String label, String[] args);
}