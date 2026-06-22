"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { MiniNavbar } from "@/components/layout/mini-navbar"
import { Footer } from "@/components/layout/footer"
import { YetkiliAlimAgreementModal } from "@/components/yetkilialim/agreement-modal"
import { useLanguage } from "@/lib/language-context"

interface Field { id: string; label: string; placeholder: string | null; field_type: string; options: string | null; required: boolean; min_length: number; max_length: number; order: number }
interface Category { id: string; name: string; description: string | null; icon: string; color: string; fields: Field[] }

export default function YetkiliAlimPage() {
  const { status, data: session } = useSession()
  const { t } = useLanguage()
  const [cats, setCats] = useState<Category[]>([])
  const [enabled, setEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Category | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAgreement, setShowAgreement] = useState(false)
  const [agreementSignedAt, setAgreementSignedAt] = useState<string | null>(null)
  const [agreementVersion, setAgreementVersion] = useState("")

  useEffect(() => {
    fetch("/api/yetkilialim").then(r => r.json()).then(d => {
      setEnabled(d.enabled !== false)
      setCats(Array.isArray(d.categories) ? d.categories : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  function selectCat(cat: Category) {
    setSelected(cat)
    setAnswers({})
    setError(null)
    setSuccess(false)
  }

  function openAgreement() {
    if (!selected) return
    // Validate before showing the modal
    for (const f of selected.fields) {
      const val = answers[f.label] ?? ""
      if (f.required && !val.trim()) { setError(`"${f.label}" alanı zorunlu`); return }
      if (val.trim().length < f.min_length) { setError(`"${f.label}" en az ${f.min_length} karakter olmalı`); return }
    }
    setError(null)
    setShowAgreement(true)
  }

  async function submitWithAgreement(signedAt: string, version: string) {
    if (!selected) return
    setAgreementSignedAt(signedAt)
    setAgreementVersion(version)
    setShowAgreement(false)
    setSubmitting(true); setError(null)
    const res = await fetch("/api/yetkilialim/apply", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId: selected.id,
        answers,
        agreementSignedAt: signedAt,
        agreementVersion: version,
      }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (!res.ok) { setError(data.error ?? "Başvuru gönderilemedi"); return }
    setSuccess(true)
  }

  if (loading) return (
    <div className="min-h-screen bg-black">
      <div className="relative h-24 border-b border-white/[0.05]"><MiniNavbar /></div>
      <div className="mx-auto max-w-3xl px-6 py-20 space-y-4 animate-pulse">
        <div className="h-8 w-56 rounded-xl bg-white/[0.04]" />
        <div className="h-32 rounded-2xl bg-white/[0.03]" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative h-24 border-b border-white/[0.05]"><MiniNavbar /></div>

      <div className="mx-auto max-w-3xl px-6 sm:px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/30 mb-4">{t("joinTeam")}</p>
          <h1 className="text-4xl font-light tracking-tight text-white sm:text-5xl leading-[1.1]">
            {t("yetkilialimTitle")}<br />
            <span className="font-semibold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">{t("yetkilialimTitleBold")}</span>
          </h1>
          <p className="mt-4 text-sm text-white/40 max-w-md leading-relaxed">{t("yetkilialimDesc")}</p>
        </motion.div>

        {!enabled ? (
          <div className="rounded-2xl border border-white/[0.06] bg-[#080808] p-16 text-center">
            <Icon icon="carbon:close-filled" className="mx-auto text-white/15 mb-4" width={40} />
            <p className="text-white/40 text-sm">{t("yetkilialimClosed")}</p>
          </div>
        ) : !selected ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {cats.map((cat, i) => (
              <motion.button key={cat.id} onClick={() => selectCat(cat)}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-[#070707] p-5 text-left hover:border-white/[0.15] hover:bg-[#0b0b0b] transition-all">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.07]" style={{ background: cat.color + "18" }}>
                  <Icon icon={cat.icon ?? "carbon:user-certification"} style={{ color: cat.color }} width={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">{cat.name}</p>
                  {cat.description && <p className="text-xs text-white/35 mt-0.5 truncate">{cat.description}</p>}
                  <p className="text-[10px] text-white/25 mt-1">{cat.fields.length} {t("questionsSuffix")}</p>
                </div>
                <Icon icon="carbon:chevron-right" className="text-white/20 group-hover:text-white/50 transition-colors shrink-0" width={16} />
              </motion.button>
            ))}
          </div>
        ) : success ? (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-12 text-center">
            <Icon icon="carbon:checkmark-filled" className="mx-auto text-emerald-400 mb-4" width={40} />
            <p className="text-lg font-bold text-emerald-400">{t("applicationSuccess")}</p>
            <p className="text-sm text-emerald-400/60 mt-2">"{selected.name}" {t("applicationSuccessDesc")}</p>
            <button onClick={() => { setSelected(null); setSuccess(false) }} className="mt-6 rounded-xl border border-white/[0.09] px-5 py-2 text-xs text-white/50 hover:text-white transition-all">{t("otherCategories")}</button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-xs text-white/35 hover:text-white/70 transition-colors">
              <Icon icon="carbon:arrow-left" width={14} /> {t("backToCategories")}
            </button>

            <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-[#0a0a0a] px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07]" style={{ background: selected.color + "18" }}>
                <Icon icon={selected.icon} style={{ color: selected.color }} width={18} />
              </div>
              <p className="text-sm font-bold text-white/85">{selected.name}</p>
            </div>

            {status !== "authenticated" && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 flex items-center gap-2 text-xs text-amber-400">
                <Icon icon="carbon:warning" width={14} />
                {t("loginRequired")} <Link href="/giris" className="underline font-bold">{t("loginLink")}</Link> {t("loginRequiredSuffix")}
              </div>
            )}

            <div className="space-y-4">
              {selected.fields.map(f => (
                <div key={f.id} className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/60">
                    {f.label}
                    {f.required && <span className="text-red-400 ml-1">*</span>}
                    {f.min_length > 0 && <span className="text-white/25 font-normal ml-2">({t("atLeastChars")} {f.min_length} {t("charsSuffix")})</span>}
                  </label>
                  {f.field_type === "textarea" ? (
                    <textarea
                      className="w-full rounded-xl border border-white/[0.07] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all min-h-[100px] resize-y"
                      placeholder={f.placeholder ?? ""}
                      value={answers[f.label] ?? ""}
                      onChange={e => setAnswers(a => ({ ...a, [f.label]: e.target.value }))}
                    />
                  ) : f.field_type === "select" && f.options ? (
                    <select className="w-full rounded-xl border border-white/[0.07] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white outline-none focus:border-white/20 transition-all"
                      value={answers[f.label] ?? ""}
                      onChange={e => setAnswers(a => ({ ...a, [f.label]: e.target.value }))}>
                      <option value="" className="bg-[#111]">{t("selectPlaceholder")}</option>
                      {JSON.parse(f.options).map((o: string) => <option key={o} value={o} className="bg-[#111]">{o}</option>)}
                    </select>
                  ) : (
                    <input type={f.field_type === "number" ? "number" : "text"}
                      className="w-full rounded-xl border border-white/[0.07] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all"
                      placeholder={f.placeholder ?? ""}
                      value={answers[f.label] ?? ""}
                      onChange={e => setAnswers(a => ({ ...a, [f.label]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            {agreementSignedAt && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] px-4 py-2.5 text-xs text-emerald-400">
                <Icon icon="carbon:document-signed" width={13} />
                {t("agreementSigned")}
              </div>
            )}

            <button
              onClick={openAgreement}
              disabled={submitting || status !== "authenticated"}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-black py-3 text-sm font-bold hover:bg-white/90 disabled:opacity-40 transition-all"
            >
              {submitting
                ? <><Icon icon="carbon:circle-dash" className="animate-spin" width={15} /> {t("sendingLabel")}</>
                : <><Icon icon="carbon:document-signed" width={15} /> {t("applyWithAgreementBtn")}</>
              }
            </button>
          </motion.div>
        )}
      </div>
      <Footer />

      <YetkiliAlimAgreementModal
        open={showAgreement}
        onClose={() => setShowAgreement(false)}
        onAccept={submitWithAgreement}
      />
    </div>
  )
}