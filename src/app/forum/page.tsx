"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Icon } from "@iconify/react"
import { MiniNavbar } from "@/components/layout/mini-navbar"
import { Footer } from "@/components/layout/footer"
import { useLanguage } from "@/lib/language-context"

interface Category { id: string; name: string; slug: string; description: string | null; icon: string; color: string; topic_count: number; rules: string | null }

export default function ForumPage() {
  const { t } = useLanguage()
  const [cats, setCats] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/forum").then(r => r.json()).then(d => { setCats(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative h-24 border-b border-white/[0.05]"><MiniNavbar /></div>

      <div className="mx-auto max-w-4xl px-6 sm:px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/30 mb-4">{t("forumEyebrow")}</p>
          <h1 className="text-4xl font-light tracking-tight text-white sm:text-5xl leading-[1.1]">
            {t("forumTitle")}
          </h1>
        </motion.div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-white/[0.03] animate-pulse" />)}</div>
        ) : cats.length === 0 ? (
          <div className="py-20 text-center">
            <Icon icon="carbon:forum" className="mx-auto text-white/10 mb-4" width={40} />
            <p className="text-sm text-white/30">{t("forumNoCategories")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cats.map((cat, i) => (
              <motion.div key={cat.id}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                <Link href={`/forum/${cat.slug}`}
                  className="group flex items-center gap-5 rounded-2xl border border-white/[0.07] bg-[#070707] px-6 py-5 transition-all hover:border-white/[0.14] hover:bg-[#0a0a0a]">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.07]" style={{ background: cat.color + "18" }}>
                    <Icon icon={cat.icon ?? "carbon:forum"} style={{ color: cat.color }} width={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">{cat.name}</p>
                    {cat.description && <p className="text-xs text-white/35 mt-0.5 truncate">{cat.description}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-white/50">{cat.topic_count}</p>
                    <p className="text-[10px] text-white/25">{t("forumTopicsSuffix")}</p>
                  </div>
                  <Icon icon="carbon:chevron-right" className="text-white/20 group-hover:text-white/50 transition-colors shrink-0" width={16} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}