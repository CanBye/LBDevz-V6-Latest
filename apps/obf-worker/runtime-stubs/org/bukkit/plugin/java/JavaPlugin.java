package org.bukkit.plugin.java;

import org.bukkit.Server;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.plugin.PluginDescriptionFile;
import org.bukkit.plugin.PluginManager;
import java.util.logging.Logger;

/**
 * Minimal compile-time stub — real implementation provided by Bukkit/Paper at runtime.
 */
public abstract class JavaPlugin implements org.bukkit.plugin.Plugin {
    public Logger getLogger() { return Logger.getLogger(getClass().getSimpleName()); }
    public Server getServer() { return null; }
    public FileConfiguration getConfig() { return null; }
    public PluginDescriptionFile getDescription() { return new PluginDescriptionFile(); }
    public void saveDefaultConfig() {}
    public void onEnable() {}
    public void onDisable() {}
    public void onLoad() {}
}