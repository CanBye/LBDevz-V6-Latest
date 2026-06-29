"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { aboutContent } from "@/lib/site-content";
import { MagnifiedBento } from "@/components/ui/magnified-bento";

// Creative technical SVG illustrations for each service to replace generic images or flat icons
function ClientLauncherBlueprint() {
  return (
    <svg className="w-full h-full text-white/5 opacity-40 group-hover:text-white/[0.08] transition-colors duration-500" viewBox="0 0 200 120" fill="none" stroke="currentColor">
      {/* Grid lines */}
      <line x1="10" y1="0" x2="10" y2="120" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
      <line x1="190" y1="0" x2="190" y2="120" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
      <line x1="0" y1="60" x2="200" y2="60" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
      
      {/* Main screen */}
      <rect x="35" y="15" width="130" height="80" rx="6" stroke="currentColor" strokeWidth="1" />
      <rect x="42" y="22" width="116" height="52" rx="2" stroke="currentColor" strokeWidth="0.75" />
      
      {/* Launcher UI Elements */}
      <rect x="50" y="30" width="30" height="8" rx="1" stroke="currentColor" strokeWidth="0.75" />
      <circle cx="140" cy="34" r="3" stroke="currentColor" strokeWidth="0.75" />
      
      {/* Play button bar */}
      <rect x="75" y="81" width="50" height="10" rx="3" className="stroke-white/10 group-hover:stroke-white/30 fill-white/[0.02] transition-colors" strokeWidth="0.75" />
      <path d="M96 86l10-3-10-3v6z" className="fill-white/20 group-hover:fill-white/60 transition-colors" />

      {/* Screen base */}
      <path d="M85 95h30l5 12H80l5-12z" stroke="currentColor" strokeWidth="1" />
      <line x1="70" y1="107" x2="130" y2="107" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function PluginPaketBlueprint() {
  return (
    <svg className="w-full h-full text-white/5 opacity-40 group-hover:text-white/[0.08] transition-colors duration-500" viewBox="0 0 200 120" fill="none" stroke="currentColor">
      <line x1="100" y1="0" x2="100" y2="120" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
      <circle cx="100" cy="60" r="45" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
      
      {/* Isometric Modular cube blocks */}
      <g transform="translate(100, 60)">
        {/* Central main block */}
        <path d="M0 -24 L30 -10 L0 4 L-30 -10 Z" stroke="currentColor" strokeWidth="1.25" className="fill-white/[0.01]" />
        <path d="M-30 -10 L0 4 L0 28 L-30 14 Z" stroke="currentColor" strokeWidth="1.25" />
        <path d="M30 -10 L0 4 L0 28 L30 14 Z" stroke="currentColor" strokeWidth="1.25" />
        
        {/* Floating modular components */}
        <motion.path 
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          d="M-15 -35 L0 -29 L15 -35 L0 -41 Z" 
          stroke="currentColor" 
          strokeWidth="0.75" 
          className="fill-white/[0.05]"
        />
        <motion.path 
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          d="M-45 10 L-35 15 L-35 25 L-45 20 Z" 
          stroke="currentColor" 
          strokeWidth="0.75" 
        />
      </g>
    </svg>
  );
}

function WebScriptBlueprint() {
  return (
    <svg className="w-full h-full text-white/5 opacity-40 group-hover:text-white/[0.08] transition-colors duration-500" viewBox="0 0 200 120" fill="none" stroke="currentColor">
      <line x1="0" y1="30" x2="200" y2="30" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
      <line x1="0" y1="90" x2="200" y2="90" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
      
      {/* Browser mockup window */}
      <rect x="30" y="20" width="140" height="80" rx="4" stroke="currentColor" strokeWidth="1" className="fill-white/[0.01]" />
      
      {/* Address Bar */}
      <circle cx="40" cy="30" r="1.5" fill="currentColor" />
      <circle cx="48" cy="30" r="1.5" fill="currentColor" />
      <circle cx="56" cy="30" r="1.5" fill="currentColor" />
      <rect x="70" y="26" width="90" height="8" rx="2" stroke="currentColor" strokeWidth="0.75" />
      
      {/* Dashboard chart */}
      <path d="M45 80 L70 65 L95 72 L120 48 L145 55 L155 42" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <circle cx="120" cy="48" r="2.5" className="fill-white/20 group-hover:fill-white/80 transition-colors" />
      <circle cx="155" cy="42" r="2.5" className="fill-white/20 group-hover:fill-white/80 transition-colors" />
    </svg>
  );
}

function OzelProjeBlueprint() {
  return (
    <svg className="w-full h-full text-white/5 opacity-40 group-hover:text-white/[0.08] transition-colors duration-500" viewBox="0 0 200 120" fill="none" stroke="currentColor">
      <rect x="15" y="15" width="170" height="90" rx="8" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
      
      {/* Constellation / Tech Nodes connection graph */}
      <g transform="translate(15, 15)">
        <circle cx="40" cy="30" r="3" stroke="currentColor" strokeWidth="1" className="fill-white/[0.05]" />
        <circle cx="100" cy="20" r="4" stroke="currentColor" strokeWidth="1" className="fill-white/[0.05]" />
        <circle cx="140" cy="50" r="3.5" stroke="currentColor" strokeWidth="1" className="fill-white/[0.05]" />
        <circle cx="80" cy="70" r="3" stroke="currentColor" strokeWidth="1" className="fill-white/[0.05]" />
        <circle cx="30" cy="65" r="4" stroke="currentColor" strokeWidth="1" className="fill-white/[0.05]" />
        
        {/* Connections */}
        <line x1="40" y1="30" x2="100" y2="20" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" />
        <line x1="100" y1="20" x2="140" y2="50" stroke="currentColor" strokeWidth="0.75" />
        <line x1="140" y1="50" x2="80" y2="70" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" />
        <line x1="80" y1="70" x2="30" y2="65" stroke="currentColor" strokeWidth="0.75" />
        <line x1="30" y1="65" x2="40" y2="30" stroke="currentColor" strokeWidth="0.75" />
        <line x1="100" y1="20" x2="80" y2="70" stroke="currentColor" strokeWidth="0.75" />
      </g>
    </svg>
  );
}

function DiscordBotBlueprint() {
  return (
    <svg className="w-full h-full text-white/5 opacity-40 group-hover:text-white/[0.08] transition-colors duration-500" viewBox="0 0 200 120" fill="none" stroke="currentColor">
      <line x1="40" y1="0" x2="40" y2="120" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
      <line x1="160" y1="0" x2="160" y2="120" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
      
      {/* Bot Interface Circle */}
      <circle cx="100" cy="60" r="32" stroke="currentColor" strokeWidth="1" className="fill-white/[0.01]" />
      <circle cx="100" cy="60" r="38" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
      
      {/* Inner face representation */}
      <path d="M85 58h10M115 58h-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M92 68c4 3 12 3 16 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      
      {/* Left and right signal lines */}
      <path d="M50 60h18M150 60h-18" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" />
      <circle cx="48" cy="60" r="2.5" fill="currentColor" />
      <circle cx="152" cy="60" r="2.5" fill="currentColor" />
    </svg>
  );
}

interface ServicesShowcaseProps {
  className?: string;
}

export function ServicesShowcase({ className }: ServicesShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const services = aboutContent.services;

  const blueprints = [
    ClientLauncherBlueprint,
    PluginPaketBlueprint,
    WebScriptBlueprint,
    OzelProjeBlueprint,
    DiscordBotBlueprint
  ];

  return (
    <div className={cn("relative", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="flex flex-col items-center text-center"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">
          YETENEKLERİMİZ
        </span>
        <h3 className="mt-4 text-3xl font-light tracking-tight text-white sm:text-4xl md:text-5xl">
          {aboutContent.servicesTitle}
        </h3>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/45 sm:text-base">
          {aboutContent.servicesDescription}
        </p>
      </motion.div>

      {/* Grid: Sleek split screen. 
          Left: Highly technical interactive service selector.
          Right: Dynamic blueprint simulation viewer showing corresponding custom graphics. */}
      <div className="mt-16 grid gap-8 lg:grid-cols-[1fr_380px] items-start">
        
        {/* Interactive Service list */}
        <div className="space-y-3 flex flex-col justify-center">
          {services.map((service, index) => {
            const isActive = activeIndex === index;
            return (
              <button
                key={service.id}
                onClick={() => setActiveIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "w-full text-left relative p-6 rounded-xl border transition-all duration-300 flex items-start gap-5 group",
                  isActive 
                    ? "border-white/[0.08] bg-white/[0.02] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.4)]" 
                    : "border-transparent bg-transparent hover:bg-white/[0.01]"
                )}
              >
                {/* Accent indicator line */}
                <div 
                  className={cn(
                    "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-white origin-top transition-transform duration-300",
                    isActive ? "scale-y-100" : "scale-y-0"
                  )} 
                />

                <span className="text-sm font-mono text-white/15 group-hover:text-white/30 transition-colors pt-0.5">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h4 className={cn(
                      "text-base font-medium tracking-tight transition-colors duration-300",
                      isActive ? "text-white" : "text-white/60 group-hover:text-white/80"
                    )}>
                      {service.title}
                    </h4>
                    <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[8.5px] font-medium tracking-wider uppercase text-white/35">
                      {service.tag}
                    </span>
                  </div>
                  <p className={cn(
                    "text-xs leading-relaxed transition-colors duration-300",
                    isActive ? "text-white/50" : "text-white/30 group-hover:text-white/45"
                  )}>
                    {service.description}
                  </p>
                </div>

                <div className={cn(
                  "size-8 rounded-full border border-white/[0.06] flex items-center justify-center text-white/20 transition-all duration-300 shrink-0",
                  isActive ? "border-white/12 bg-white/[0.04] text-white/70" : "group-hover:text-white/40"
                )}>
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>

        {/* MagnifiedBento */}
        <MagnifiedBento className="self-stretch" />

      </div>
    </div>
  );
}
