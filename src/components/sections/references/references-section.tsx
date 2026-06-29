"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Marquee } from "@/components/ui/marquee";

interface ReferenceServer {
  name: string;
  href: string;
  logo?: string;
}

const SERVERS: ReferenceServer[] = [
  { name: "HanedanMC",    href: "https://hanedanmc.com" },
  { name: "KralMC",       href: "#" },
  { name: "VortexMC",     href: "#" },
  { name: "EmpireMC",     href: "#" },
  { name: "NebulaRP",     href: "#" },
  { name: "StarCraft TR", href: "#" },
];

function ReferenceCard({ name, href, logo }: ReferenceServer) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={name}
      className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.08] transition-all duration-300 select-none mx-3"
    >
      {logo ? (
        <img src={logo} alt={name} className="size-7 rounded-full object-cover" />
      ) : (
        <span className="text-sm font-bold text-white/40">{name.charAt(0)}</span>
      )}
    </a>
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

        {/* Marquee — max-w-6xl ile hizalı, fade kenarlar */}
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black to-transparent z-10" />
          <Marquee pauseOnHover repeat={4}>
            {SERVERS.map(s => <ReferenceCard key={s.name} {...s} />)}
          </Marquee>
        </div>
      </div>
    </section>
  );
}