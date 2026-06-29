"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedTextCycle } from "@/components/ui/animated-text-cycle";
import { LaserFlow } from "@/components/ui/laser-flow";
import { Icon } from "@iconify/react";
import { CosmicButton } from "@/components/ui/cosmic-button";
import { AnimatedCursor } from "@/components/ui/cursor";
import { MiniNavbar } from "@/components/layout/mini-navbar";
import { assets } from "@/lib/assets";
import { useLanguage } from "@/lib/language-context";

interface HeroRefServer { id: string; name: string; logoUrl: string | null; players: number; href: string | null }

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


interface HeroSectionProps {
  className?: string;
  heroReady?: boolean;
}

export function HeroSection({ className, heroReady = false }: HeroSectionProps) {
  const { t } = useLanguage()
  const [heroServers, setHeroServers] = useState<HeroRefServer[]>([])

  useEffect(() => {
    fetch("/api/site/references?type=hero")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d) && d.length > 0) setHeroServers(d) })
      .catch(() => {})
  }, [])

  return (
    <div className={cn("relative flex min-h-screen w-full flex-col", className)}
      style={{ background: "#000" }}
    >
      {/* Top radial gradient */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: "radial-gradient(125% 125% at 50% -50%, #35013640 40%, transparent 100%)" }}
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <LaserFlow
          color="#350136"
          wispDensity={1.8}
          flowSpeed={0.5}
          verticalSizing={2}
          horizontalSizing={0.9}
          fogIntensity={0.07}
          fogScale={0.25}
          wispSpeed={16}
          wispIntensity={7}
          flowStrength={0.5}
          decay={1.9}
          horizontalBeamOffset={0}
          verticalBeamOffset={-0.5}
          className="absolute inset-0"
        />
      </div>

      <MiniNavbar />


      <main className="relative z-10 flex min-h-0 flex-1 items-center justify-center overflow-x-hidden px-4">
        <div className="flex w-full max-w-3xl flex-col items-center text-center">
          <div className="relative w-full max-w-6xl overflow-visible">

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
            <CosmicButton href="#iletisim">
              {t("heroCta1")}
            </CosmicButton>
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
            <div className="flex flex-wrap justify-center gap-2">
              {heroServers.map(s => (
                <a
                  key={s.id}
                  href={s.href ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-1 py-1 pr-2.5 backdrop-blur-sm hover:border-white/20 hover:bg-white/[0.07] transition-all"
                >
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/[0.08] border border-white/[0.08] overflow-hidden">
                    {s.logoUrl
                      ? <img src={s.logoUrl} alt={s.name} className="h-full w-full object-cover" />
                      : <span className="text-[9px] font-bold text-white/50">{s.name.charAt(0)}</span>
                    }
                  </div>
                  <span className="text-xs font-medium text-white/60">{s.name}</span>
                  {s.players > 0 && (
                    <div className="ml-1 flex items-center gap-0.5 rounded-full bg-white/[0.06] px-1.5 py-0.5">
                      <span className="text-[10px] text-white/35">{s.players.toLocaleString("tr-TR")}</span>
                      <Icon icon="solar:users-group-two-rounded-bold" className="text-white/25" style={{ fontSize: 13 }} />
                    </div>
                  )}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
