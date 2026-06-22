"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { MiniNavbar } from "@/components/layout/mini-navbar"
import { Footer } from "@/components/layout/footer"
import { useLanguage } from "@/lib/language-context"

interface Category { id: string; name: string; slug: string; description: string | null; icon: string; color: string; min_chars: number; require_title: boolean; rules: string | null }
interface Topic { id: string; title: string; content: string; author_name: string | null; author_image: string | null; reply_count: number; pinned: boolean; locked: boolean; created_at: string }

export default function ForumCategoryPage() {
  const { categorySlug } = useParams() as { categorySlug: string }
  const { status, data: session } = useSession()
  const router = useRouter()
  const { t } = useLanguage()

  const [cat, setCat] = useState<Category | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ title: "", content: "" })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  function load() {
    fetch(`/api/forum/${categorySlug}`)
      .then(r => r.json())
      .then(d => { if (d.error) router.push("/forum"); else { setCat(d.category as Category); setTopics(d.topics); setLoading(false) } })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [categorySlug])

  async function submit() {
    if (!cat) return
    setSubmitting(true); setFormError(null)
    const res = await fetch(`/api/forum/${categorySlug}/topics`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: form.title || undefined, content: form.content }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (!res.ok) { setFormError(data.error ?? "Hata"); return }
    setShowNew(false); setForm({ title: "", content: "" }); load()
  }

  const charsLeft = cat ? Math.max(0, cat.min_chars - form.content.trim().length) : 0

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative h-24 border-b border-white/[0.05]"><MiniNavbar /></div>

      <div className="mx-auto max-w-4xl px-6 sm:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[11px] text-white/30 mb-8">
          <Link href="/forum" className="hover:text-white/60 transition-colors">{t("forumBack")}</Link>
          <span>/</span>
          <span className="text-white/60">{cat?.name ?? "..."}</span>
        </div>

        {cat && (
          <div className="mb-10 flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.07]" style={{ background: cat.color + "18" }}>
                <Icon icon={cat.icon ?? "carbon:forum"} style={{ color: cat.color }} width={22} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{cat.name}</h1>
                {cat.description && <p className="text-sm text-white/40 mt-0.5">{cat.description}</p>}
              </div>
            </div>
            {status === "authenticated" && (
              <button onClick={() => setShowNew(s => !s)}
                className="flex items-center gap-2 rounded-xl bg-white text-black px-4 py-2 text-xs font-bold hover:bg-white/90 transition-all">
                <Icon icon="carbon:add" width={14} />
                {t("forumNewTopic")}
              </button>
            )}
            {status === "unauthenticated" && (
              <Link href="/giris" className="flex items-center gap-2 rounded-xl border border-white/[0.09] px-4 py-2 text-xs font-semibold text-white/40 hover:text-white hover:border-white/20 transition-all">
                {t("forumLoginToPost")}
              </Link>
            )}
          </div>
        )}

        {/* Rules */}
        {cat?.rules && (
          <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/70 mb-1">{t("forumRules")}</p>
            <p className="text-xs text-amber-400/80 whitespace-pre-line leading-relaxed">{cat.rules}</p>
          </div>
        )}

        {/* New topic form */}
        {showNew && (
          <div className="mb-6 rounded-2xl border border-white/[0.07] bg-[#0a0a0a] p-5 space-y-3">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">{t("forumNewTopic")}</p>
            {cat?.require_title && (
              <input className="w-full rounded-xl border border-white/[0.07] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all"
                placeholder={t("forumTopicTitlePlaceholder")} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            )}
            <div className="relative">
              <textarea
                className="w-full rounded-xl border border-white/[0.07] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all min-h-[140px] resize-y"
                placeholder={`${t("forumContentPlaceholder")} ${cat?.min_chars ?? 50} ${t("charsSuffix")})...`}
                value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              />
              {charsLeft > 0 && (
                <span className="absolute bottom-3 right-3 text-[10px] text-amber-400/60">{charsLeft} {t("forumCharsLeft")}</span>
              )}
            </div>
            {formError && <p className="text-xs text-red-400">{formError}</p>}
            <div className="flex gap-2">
              <button onClick={submit} disabled={submitting || charsLeft > 0 || (cat?.require_title && !form.title.trim())}
                className="rounded-xl bg-white text-black px-5 py-2 text-xs font-bold hover:bg-white/90 disabled:opacity-40 transition-all">
                {submitting ? t("forumSending") : t("forumSendBtn")}
              </button>
              <button onClick={() => setShowNew(false)} className="rounded-xl border border-white/[0.07] px-4 py-2 text-xs text-white/40 hover:text-white transition-all">{t("forumCancelBtn")}</button>
            </div>
          </div>
        )}

        {/* Topic list */}
        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-white/[0.03] animate-pulse" />)}</div>
        ) : topics.length === 0 ? (
          <div className="py-16 text-center">
            <Icon icon="carbon:chat" className="mx-auto text-white/10 mb-3" width={36} />
            <p className="text-sm text-white/30">{t("forumNoTopics")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {topics.map((topic, i) => (
              <motion.div key={topic.id}
                initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.03 }}
              >
                <Link href={`/forum/${categorySlug}/${topic.id}`}
                  className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-[#070707] px-5 py-4 hover:border-white/[0.12] hover:bg-[#0a0a0a] transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {topic.pinned && <Icon icon="carbon:pin" className="text-amber-400 shrink-0" width={12} />}
                      {topic.locked && <Icon icon="carbon:locked" className="text-white/30 shrink-0" width={12} />}
                      <p className="text-sm font-semibold text-white/85 group-hover:text-white transition-colors truncate">{topic.title}</p>
                    </div>
                    <p className="text-[10px] text-white/30 mt-0.5">{topic.author_name ?? t("forumAnonymous")} · {new Date(topic.created_at).toLocaleDateString("tr-TR")}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 text-[10px] text-white/30">
                    <Icon icon="carbon:chat" width={12} />
                    {topic.reply_count}
                  </div>
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