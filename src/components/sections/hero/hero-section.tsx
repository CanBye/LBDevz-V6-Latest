"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedTextCycle } from "@/components/ui/animated-text-cycle";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import { MiniNavbar } from "@/components/layout/mini-navbar";
import { assets } from "@/lib/assets";
import { useLanguage } from "@/lib/language-context";

const CANVAS_COLORS: [number, number, number][] = [
  [255, 255, 255],
  [255, 255, 255],
];

const HERO_SERVICE_ITEMS = [
  { label: "Plugin", icon: assets.icons.plugin },
  { label: "Plugin Paketi", icon: assets.icons.pluginPaketi },
  { label: "Web Site", icon: assets.icons.webSite },
  { label: "Skript", icon: assets.icons.skript },
  { label: "Fivem Script", icon: assets.icons.fivemScript },
  { label: "Client", icon: assets.icons.client },
  { label: "Launcher", icon: assets.icons.launcher },
  { label: "Discord Bot", icon: assets.icons.discordBot },
];

// 6 süzülen logo — sol 3, sağ 3 simetrik dağılım
const FLING_LOGOS = [
  { id: "minecraft", icon: assets.icons.minecraftSymbol, x: -580, y: -155, size: 78, delay: 0 },
  { id: "codin", icon: assets.icons.codin, x: -760, y: 10, size: 74, delay: 0.1 },
  { id: "fivem", icon: assets.icons.fivemScript, x: -560, y: 168, size: 76, delay: 0.2 },
  { id: "discord", icon: assets.icons.discordBrand, x: 580, y: -155, size: 78, delay: 0.05 },
  { id: "github", icon: assets.icons.github, x: 760, y: 10, size: 74, delay: 0.15 },
  { id: "plugin", icon: assets.icons.plugin, x: 560, y: 168, size: 76, delay: 0.25 },
];

interface HeroSectionProps {
  className?: string;
  heroReady?: boolean;
}

export function HeroSection({ className, heroReady = false }: HeroSectionProps) {
  const { t } = useLanguage()
  return (
    <div className={cn("relative flex min-h-screen w-full flex-col bg-black", className)}>
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        {heroReady && (
          <CanvasRevealEffect
            animationSpeed={3}
            containerClassName="bg-black"
            colors={CANVAS_COLORS}
            dotSize={6}
            reverse={false}
          />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.75)_0%,_transparent_65%)]" />
        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black to-transparent" />
      </div>

      <MiniNavbar />

      <main className="relative z-10 flex min-h-0 flex-1 items-center justify-center overflow-x-hidden px-4">
        <div className="flex w-full max-w-3xl flex-col items-center text-center">
          <div className="relative w-full max-w-6xl overflow-visible">
            {heroReady &&
              FLING_LOGOS.map((slot, index) => (
                <motion.div
                  key={slot.id}
                  className="pointer-events-none absolute left-1/2 top-1/2 z-[15]"
                  style={{
                    width: slot.size,
                    height: slot.size,
                    marginLeft: -slot.size / 2,
                    marginTop: -slot.size / 2,
                  }}
                  initial={{ x: 0, y: 70, opacity: 0, scale: 0.15 }}
                  animate={{ x: slot.x, y: slot.y, opacity: 1, scale: 1 }}
                  transition={{
                    duration: 1.35,
                    delay: slot.delay,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <motion.div
                    className="size-full"
                    animate={{
                      y: [0, -12, 6, 0],
                      x: [0, index % 2 === 0 ? 6 : -6, 0],
                      rotate: [0, index % 2 === 0 ? 3 : -3, 0],
                    }}
                    transition={{
                      duration: 4.8 + index * 0.35,
                      delay: slot.delay + 1.3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <img
                      src={slot.icon}
                      alt=""
                      draggable={false}
                      className="size-full object-contain drop-shadow-[0_6px_24px_rgba(0,0,0,0.5)]"
                    />
                  </motion.div>
                </motion.div>
              ))}

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
              className="relative z-20 space-y-2"
            >
              <span className="block text-xl font-light text-white/70 sm:text-2xl">
                {t("heroLookingFor")}
              </span>
              <span className="flex min-h-[1.15em] items-center justify-center">
                <AnimatedTextCycle
                  items={HERO_SERVICE_ITEMS}
                  interval={3200}
                  className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
                />
              </span>
              <span className="block text-xl font-light text-white/70 sm:text-2xl">
                {t("heroLookingFor2")}
              </span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
            className="relative z-20 mt-5 max-w-lg text-sm leading-relaxed text-white/50 sm:text-base"
          >
            {t("heroDesc")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.45, delay: 0.22, ease: "easeOut" }}
            className="relative z-20 mt-7 flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
          >
            <Link
              href="#iletisim"
              className="group inline-flex h-11 items-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-black transition-colors hover:bg-white/90"
            >
              {t("heroCta1")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#neden-biz"
              className="inline-flex h-11 items-center rounded-full border border-white/15 px-7 text-sm font-medium text-white/75 transition-colors hover:border-white/30 hover:text-white"
            >
              {t("heroCta2")}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            className="relative z-20 mt-14 flex flex-col items-center gap-4 sm:mt-16"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-white/30">
              {t("heroReferenceServers")}
            </p>
            <img
              src={assets.logo.clastie}
              alt="Clastie"
              draggable={false}
              className="h-9 w-auto object-contain opacity-60 transition-opacity hover:opacity-90 sm:h-10"
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
