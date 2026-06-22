"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlobePulse } from "@/components/ui/globe-pulse";
import { assets } from "@/lib/assets";

interface GlobalSectionProps {
  className?: string;
}

const MARKERS = [
  { id: "tr", location: [39.92, 32.85] as [number, number], delay: 0 },
  { id: "us", location: [40.71, -74.01] as [number, number], delay: 0.4 },
  { id: "gb", location: [51.51, -0.13] as [number, number], delay: 0.8 },
  { id: "ch", location: [46.95, 7.45] as [number, number], delay: 1.2 },
];

const COUNTRIES = [
  { flagImg: assets.icons.flagTR, name: "Türkiye", note: "Ana Destek Dili", badge: "TR" },
  { flagImg: assets.icons.flagUS, name: "Amerika", note: "Uluslararası Proje", badge: "EN" },
  { flagImg: assets.icons.flagGB, name: "İngiltere", note: "Uluslararası Proje", badge: "EN" },
  { flagImg: assets.icons.flagCH, name: "İsviçre", note: "Uluslararası Proje", badge: "EN" },
];


export function GlobalSection({ className }: GlobalSectionProps) {
  return (
    <section
      id="global"
      className={cn(
        "relative border-t border-white/[0.06] bg-black overflow-hidden",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl px-6 py-24 sm:px-8 sm:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">

          {/* Left: Metin + ülkeler */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10"
          >
            <div className="space-y-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/35">
                DÜNYA GENELİNDE
              </p>
              <h2 className="text-3xl font-light tracking-tight text-white sm:text-4xl md:text-5xl leading-[1.1]">
                Nerede olursan ol,<br />
                <span className="font-semibold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  biz de oradayız.
                </span>
              </h2>
              <p className="max-w-sm text-sm leading-relaxed text-white/45 sm:text-base">
                Türkiye merkezli ekibimizle, dünya genelinde müşterilere
                hizmet veriyoruz. Dil engeli yok, saat farkı engel değil.
              </p>
            </div>

            {/* Ülkeler */}
            <div className="space-y-3">
              {COUNTRIES.map((c, i) => (
                <motion.div
                  key={c.name}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.1 + i * 0.06 }}
                  className="group flex items-center gap-4 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 transition-colors duration-300 hover:border-white/[0.1] hover:bg-white/[0.04]"
                >
                  <img src={c.flagImg} alt={c.name} className="size-7 rounded-sm object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{c.name}</p>
                    <p className="text-[11px] text-white/40">{c.note}</p>
                  </div>
                  <span className="rounded border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-white/40">
                    {c.badge}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Globe + Floating Flag Pins */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-[420px]">
              {/* Subtle radial glow */}
              <div className="pointer-events-none absolute inset-[-10%] rounded-full bg-[radial-gradient(circle,rgba(51,204,221,0.04)_0%,transparent_65%)]" />

              <GlobePulse markers={MARKERS} speed={0.0035} />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
