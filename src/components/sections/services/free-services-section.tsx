"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { freeServices, siteConfig } from "@/lib/site-content";
import { useEffect, useState } from "react";

interface FreeServicesSectionProps {
  className?: string;
}

// Override icons for specific slides
const ICON_OVERRIDES: Record<string, string> = {
  "Fiyat teklifi": "/assets/icons/money-mouth-face_1f911.png",
}

export function FreeServicesSection({ className }: FreeServicesSectionProps) {
  const [current, setCurrent] = useState(0)
  const [dir, setDir] = useState(1)

  useEffect(() => {
    const t = setInterval(() => {
      setDir(1)
      setCurrent(p => (p + 1) % freeServices.length)
    }, 3000)
    return () => clearInterval(t)
  }, [])

  function go(idx: number) {
    setDir(idx > current ? 1 : -1)
    setCurrent(idx)
  }

  function prev() {
    setDir(-1)
    setCurrent(p => (p - 1 + freeServices.length) % freeServices.length)
  }

  function next() {
    setDir(1)
    setCurrent(p => (p + 1) % freeServices.length)
  }

  const service = freeServices[current]
  const icon = ICON_OVERRIDES[service.title] ?? service.icon

  return (
    <section
      id="ucretsiz"
      className={cn("relative bg-black border-t border-white/[0.06]", className)}
    >
      <div className="mx-auto max-w-6xl px-6 py-24 sm:px-8 sm:py-32">

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/25">
            Ücretsiz Hizmetler
          </p>
        </motion.div>

        {/* Glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-[100px] bg-emerald-500/20 z-0" />

        {/* Floating white card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-white rounded-3xl overflow-hidden"
          style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.06)" }}
        >
          <div className="grid lg:grid-cols-2 min-h-[420px]">

            {/* Sol */}
            <div className="flex flex-col justify-between p-12 border-b border-black/[0.05] lg:border-b-0 lg:border-r">
              <div className="space-y-5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.07] bg-black/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-black/35">
                  No Cost
                </span>

                <div className="space-y-1">
                  <h2 className="text-[2rem] font-semibold tracking-tight text-black leading-[1.15]">
                    Her ihtiyaca yönelik
                  </h2>
                  <h2 className="text-[2rem] font-light tracking-tight text-black/35 leading-[1.15] flex items-center gap-2">
                    yazılım ve tasarım.
                    <img src="/assets/icons/star-struck_1f929.png" alt="" aria-hidden className="inline-block size-8 object-contain" />
                  </h2>
                </div>

                <p className="text-sm text-black/60 leading-relaxed max-w-[280px]">
                  Tam website projelerinden oyun scriptlerine, Discord botlarından
                  UI temalarına kadar kataloğumuzu hep yanında taşıyoruz.
                </p>
              </div>

              <div className="mt-8 space-y-5 pt-8 border-t border-black/[0.06]">
                <div className="flex items-center gap-8">
                  {[
                    { label: "Danışmanlık", value: "₺0" },
                    { label: "Kontrol", value: "₺0" },
                    { label: "Teklif", value: "₺0" },
                  ].map(item => (
                    <div key={item.label}>
                      <p className="font-mono text-lg font-bold text-black">{item.value}</p>
                      <p className="text-[9px] uppercase tracking-widest text-black/30 mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>

                <Link
                  href={siteConfig.discordInvite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 text-sm font-semibold text-black hover:text-black/60 transition-colors"
                >
                  Kataloğa git
                  <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            {/* Sağ — slider */}
            <div className="flex flex-col justify-center items-center p-12 gap-8">

              {/* Icon */}
              <div className="overflow-hidden relative w-full flex items-center justify-center">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={current + "-icon"}
                    initial={{ opacity: 0, x: dir * 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dir * -50 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="flex size-24 items-center justify-center rounded-3xl border border-black/[0.07] bg-black/[0.03] shadow-sm"
                  >
                    <img src={icon} alt="" aria-hidden className="size-12 object-contain" />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Text */}
              <div className="overflow-hidden relative w-full text-center">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={current + "-text"}
                    initial={{ opacity: 0, x: dir * 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dir * -50 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.04 }}
                    className="space-y-2"
                  >
                    <h3 className="text-xl font-semibold text-black/85">{service.title}</h3>
                    <p className="text-sm text-black/50 leading-relaxed max-w-[240px] mx-auto">{service.description}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Nav — dots + arrows */}
              <div className="flex items-center gap-4">
                <button onClick={prev} className="flex size-7 items-center justify-center rounded-full hover:bg-black/[0.05] transition-colors text-black/30 hover:text-black/60">
                  <ChevronLeft className="size-4" />
                </button>
                <div className="flex items-center gap-1.5">
                  {freeServices.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => go(i)}
                      className={cn(
                        "rounded-full transition-all duration-300",
                        i === current
                          ? "w-5 h-1.5 bg-black/50"
                          : "w-1.5 h-1.5 bg-black/15 hover:bg-black/30"
                      )}
                    />
                  ))}
                </div>
                <button onClick={next} className="flex size-7 items-center justify-center rounded-full hover:bg-black/[0.05] transition-colors text-black/30 hover:text-black/60">
                  <ChevronRight className="size-4" />
                </button>
              </div>

            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}