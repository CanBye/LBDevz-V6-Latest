"use client";

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface ReferenceServer {
  name: string;
  href: string;
  logo?: string;
  players: number;
}

const SERVERS: ReferenceServer[] = [
  { name: "HanedanMC",   href: "https://hanedanmc.com",   players: 480 },
  { name: "KralMC",      href: "#",                        players: 312 },
  { name: "VortexMC",    href: "#",                        players: 275 },
  { name: "EmpireMC",    href: "#",                        players: 198 },
  { name: "NebulaRP",    href: "#",                        players: 143 },
  { name: "StarCraft TR",href: "#",                        players: 89  },
];

interface ReferenceCardProps extends ReferenceServer {
  index: number;
}

function ReferenceCard({ name, href, logo, players, index }: ReferenceCardProps) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className={cn(
        "group flex items-center gap-2.5 rounded-full px-1 py-1 pr-2",
        "border border-white/[0.1]",
        "bg-gradient-to-b from-white/[0.06] to-[#350136]/30",
        "hover:border-white/20 hover:from-white/[0.09] hover:to-[#350136]/50",
        "transition-all duration-300 select-none",
      )}
    >
      {/* Server logo */}
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#111] border border-white/[0.08] overflow-hidden">
        {logo ? (
          <img src={logo} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-[11px] font-bold text-white/40">
            {name.charAt(0)}
          </span>
        )}
      </div>

      {/* Server name */}
      <span className="text-sm font-medium text-white/75 group-hover:text-white transition-colors">
        {name}
      </span>

      {/* Player count pill */}
      <div className="ml-auto flex items-center gap-1 rounded-full bg-white/[0.05] px-2 py-0.5 border border-white/[0.06]">
        <span className="text-xs text-white/45">{players.toLocaleString("tr-TR")}</span>
        <Icon icon="solar:users-group-two-rounded-bold" className="text-white/35" style={{ fontSize: 16 }} />
      </div>
    </motion.a>
  );
}

export function ReferencesSection() {
  return (
    <section className="relative bg-black border-t border-white/[0.06]">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 space-y-2"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/30">
            REFERANSLAR
          </p>
          <h2 className="text-2xl font-semibold text-white/80 sm:text-3xl">
            Güvendikleri sunucular
          </h2>
          <p className="text-sm text-white/35 max-w-md">
            Yüzlerce aktif sunucu LBDevz altyapısıyla çalışıyor.
          </p>
        </motion.div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SERVERS.map((s, i) => (
            <ReferenceCard key={s.name} {...s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}