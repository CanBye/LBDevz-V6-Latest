"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Marquee } from "@/components/ui/marquee"
import { customerReviews } from "@/lib/site-content"
import { useLanguage } from "@/lib/language-context"

interface Review { id: string; name: string; role: string; quote: string; rating: number }

function ReviewCard({ name, role, quote, rating }: Omit<Review, "id">) {
  return (
    <div className="group relative w-[280px] shrink-0 rounded-2xl border border-white/[0.07] bg-[#080808] p-6 transition-all duration-300 hover:border-white/[0.14] hover:bg-[#0c0c0c] sm:w-[320px]">
      <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="flex gap-0.5">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="size-3 fill-white/50 text-white/50" strokeWidth={0} />
        ))}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-white/55">&ldquo;{quote}&rdquo;</p>
      <div className="mt-5 flex items-center gap-3 border-t border-white/[0.06] pt-4">
        <div className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[11px] font-bold text-white/70">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-xs font-semibold text-white">{name}</p>
          <p className="text-[10px] text-white/35">{role}</p>
        </div>
      </div>
    </div>
  )
}

const fallback = customerReviews as unknown as Review[]

export function ReviewsSection({ className }: { className?: string }) {
  const { t } = useLanguage()
  const [data, setData] = useState<Review[]>(fallback)

  useEffect(() => {
    fetch("/api/site/reviews")
      .then(r => r.json())
      .then((d: Review[]) => { if (Array.isArray(d) && d.length > 0) setData(d) })
      .catch(() => {})
  }, [])

  const reviews1 = [...data, ...data]
  const reviews2 = [...data].reverse().concat([...data].reverse())

  return (
    <section id="yorumlar" className={cn("relative border-t border-white/[0.06] bg-black overflow-hidden", className)}>
      <div className="mx-auto max-w-6xl px-6 py-24 sm:px-8 sm:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.4fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/35">{t("reviewsEyebrow")}</p>
              <h2 className="text-3xl font-light tracking-tight text-white sm:text-4xl md:text-5xl leading-[1.1]">
                {t("reviewsHeadline")}
              </h2>
              <p className="max-w-sm text-sm leading-relaxed text-white/45">
                {t("reviewsDesc")}
              </p>
            </div>
            <div className="space-y-3">
              {["100+ tamamlanan proje", "Teslim sonrası destek garantisi", "%100 özgün geliştirme"].map(item => (
                <div key={item} className="flex items-center gap-3 text-sm text-white/50">
                  <span className="size-1.5 shrink-0 rounded-full bg-white/30" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <div className="relative flex flex-col gap-5 overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black to-transparent z-10" />
            <Marquee pauseOnHover repeat={2}>
              {reviews1.map((r, i) => <ReviewCard key={`r1-${i}`} name={r.name} role={r.role} quote={r.quote} rating={r.rating} />)}
            </Marquee>
            <Marquee pauseOnHover reverse repeat={2}>
              {reviews2.map((r, i) => <ReviewCard key={`r2-${i}`} name={r.name} role={r.role} quote={r.quote} rating={r.rating} />)}
            </Marquee>
          </div>
        </div>
      </div>
    </section>
  )
}