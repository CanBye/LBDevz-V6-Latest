"use client"

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"
import DOMPurify from "isomorphic-dompurify"

const SLUG = "yetkili-alim-sozlesmesi"

interface Props {
  open: boolean
  onClose: () => void
  onAccept: (signedAt: string, version: string) => void
}

export function YetkiliAlimAgreementModal({ open, onClose, onAccept }: Props) {
  const { t } = useLanguage()
  const [checked, setChecked] = useState(false)
  const [content, setContent] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [version, setVersion] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setChecked(false)
    setLoading(true)
    fetch(`/api/legal/${SLUG}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.content) {
          setContent(data.content)
          setTitle(data.title ?? title)
          setVersion(data.id ?? data.updated_at ?? "")
        } else {
          setContent(null)
        }
      })
      .catch(() => setContent(null))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  function handleAccept() {
    if (!checked) return
    onAccept(new Date().toISOString(), version)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-white/[0.08] bg-[#0a0a0a] shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10">
              <Icon icon="carbon:document-signed" className="text-indigo-400" width={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-white/90">{title || t("agreementTitle")}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-widest">{t("agreementSubtitle")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-all"
          >
            <Icon icon="carbon:close" width={14} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {loading ? (
            <div className="space-y-3 animate-pulse py-4">
              {[80, 60, 90, 70, 50].map(w => (
                <div key={w} className="h-3 rounded bg-white/[0.05]" style={{ width: `${w}%` }} />
              ))}
            </div>
          ) : content ? (
            <div
              className="prose prose-invert prose-sm max-w-none text-white/60 leading-relaxed [&_h2]:text-white/80 [&_h3]:text-white/70 [&_strong]:text-white/80"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content, { USE_PROFILES: { html: true } }) }}
            />
          ) : (
            <div className="py-8 text-center">
              <Icon icon="carbon:document-unknown" className="mx-auto text-white/15 mb-3" width={32} />
              <p className="text-sm text-white/40">{t("agreementLoadFailed")}</p>
              <p className="text-xs text-white/25 mt-1">
                <a
                  href={`/sozlesmeler/${SLUG}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                >
                  {t("agreementReadHere")}
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/[0.06] space-y-3 shrink-0">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div
              onClick={() => setChecked(v => !v)}
              className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all",
                checked
                  ? "border-indigo-500 bg-indigo-500"
                  : "border-white/20 bg-transparent group-hover:border-white/40"
              )}
            >
              {checked && <Icon icon="carbon:checkmark" className="text-white" width={10} />}
            </div>
            <span className="text-xs text-white/50 leading-relaxed">
              {t("agreementCheckbox")}
            </span>
          </label>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/[0.08] py-2.5 text-xs text-white/40 hover:text-white/70 hover:border-white/20 transition-all"
            >
              {t("agreementCancelBtn")}
            </button>
            <button
              onClick={handleAccept}
              disabled={!checked}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Icon icon="carbon:document-signed" width={13} />
              {t("agreementSignBtn")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}