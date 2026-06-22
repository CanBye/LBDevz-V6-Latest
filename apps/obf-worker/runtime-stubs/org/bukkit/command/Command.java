package org.bukkit.command;
/** Minimal compile-time stub. */
public abstract class Command {
    protected String name;
    protected Command(String name) { this.name = name; }
    public abstract boolean execute(org.bukkit.command.CommandSender sender, String commandLabel, String[] args);
}