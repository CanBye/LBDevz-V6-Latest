package org.bukkit;

import org.bukkit.plugin.PluginManager;

/** Minimal compile-time stub. */
public interface Server {
    PluginManager getPluginManager();
    org.bukkit.command.CommandMap getCommandMap();
}