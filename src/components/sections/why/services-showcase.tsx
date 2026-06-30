"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { aboutContent } from "@/lib/site-content";
import { MagnifiedBento } from "@/components/ui/magnified-bento";

/* ─── Animated counter ───────────────────────────── */
function Counter({ to, from = 0, duration = 2 }: { to: number; from?: number; duration?: number }) {
  const [val, setVal] = useState(from)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const start = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - start) / (duration * 1000), 1)
          const eased = 1 - Math.pow(1 - p, 3)
          setVal(Math.round(from + (to - from) * eased))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [to, from, duration])

  return <span ref={ref}>{val.toLocaleString("tr-TR")}</span>
}

/* ─── Bento Card ─────────────────────────────────── */
function BentoCard({ service, large, className }: {
  service: typeof aboutContent.services[number];
  large?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative flex flex-col rounded-2xl border border-white/[0.08] bg-[#080808] p-6 overflow-hidden transition-all duration-300 hover:border-white/[0.15] hover:bg-[#0c0c0c]",
        className
      )}
    >
      {/* top shine */}
      <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03]">
          <img src={service.icon} alt="" aria-hidden className="size-6 object-contain" />
        </div>
        <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/30">
          {service.tag}
        </span>
      </div>

      <div className="mt-4 flex-1">
        <h4 className={cn("font-semibold text-white/85 leading-snug", large ? "text-lg" : "text-base")}>
          {service.title}
        </h4>
        <p className="mt-1.5 text-xs leading-relaxed text-white/40 line-clamp-3">
          {service.description}
        </p>
      </div>

      {/* hover glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.015),transparent_60%)]" />
    </motion.div>
  )
}

/* ─── Main component ─────────────────────────────── */
interface ServicesShowcaseProps { className?: string }

export function ServicesShowcase({ className }: ServicesShowcaseProps) {
  const services = aboutContent.services
  const [stats, setStats] = useState({ products: 0, customers: 854 })

  useEffect(() => {
    fetch("/api/site/stats")
      .then(r => r.json())
      .then(d => { if (d?.products !== undefined) setStats(s => ({ ...s, products: d.products, customers: d.customers || s.customers })) })
      .catch(() => {})
  }, [])

  return (
    <div className={cn("relative", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="flex flex-col items-center text-center"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">YETENEKLERİMİZ</span>
        <h3 className="mt-4 text-3xl font-light tracking-tight text-white sm:text-4xl md:text-5xl">
          {aboutContent.servicesTitle}
        </h3>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/45 sm:text-base">
          {aboutContent.servicesDescription}
        </p>
      </motion.div>

      {/* Bento Grid */}
      <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Row 1: large + medium */}
        <BentoCard service={services[0]} large className="lg:col-span-2 lg:row-span-1" />
        <BentoCard service={services[1]} />

        {/* Row 2: small + small + magnified bento */}
        <BentoCard service={services[2]} />
        <BentoCard service={services[3]} />
        <BentoCard service={services[4]} />
      </div>

      {/* MagnifiedBento — full width below grid */}
      <div className="mt-3">
        <MagnifiedBento className="w-full max-w-none [&>div]:max-w-none" />
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-px border border-white/[0.06] rounded-2xl overflow-hidden"
      >
        {[
          { label: "Aktif Müşteri", value: stats.customers, suffix: "+", from: Math.max(0, stats.customers - 80) },
          { label: "Aktif Ürün",    value: stats.products,  suffix: "",  from: 0 },
          { label: "Tamamlanan Proje", value: 100, suffix: "+", from: 80 },
          { label: "Yıllık Deneyim",   value: 6,   suffix: "+", from: 0 },
        ].map((s, i) => (
          <div key={i} className="flex flex-col items-center justify-center gap-1 bg-[#080808] px-6 py-7 text-center">
            <p className="text-3xl font-bold text-white tabular-nums">
              <Counter to={s.value} from={s.from} duration={2.2} />{s.suffix}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">{s.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  )
}