package org.bukkit.command;
import org.bukkit.plugin.Plugin;
/** Minimal compile-time stub. */
public final class PluginCommand extends Command {
    private Plugin owningPlugin;
    public PluginCommand(String name, Plugin owner) {
        super(name);
        this.owningPlugin = owner;
    }
    public Plugin getPlugin() { return owningPlugin; }
    public void setExecutor(CommandExecutor executor) {}
    public boolean execute(CommandSender sender, String label, String[] args) { return false; }
}