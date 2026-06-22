"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"

interface Application {
  id: string
  status: "pending" | "approved" | "rejected"
  admin_note: string | null
  created_at: string
  reviewed_at: string | null
  answers: Record<string, string>
  category_name: string
  category_icon: string
  category_color: string
}

const STATUS_ICONS = {
  pending:  { icon: "carbon:time",            cls: "border-amber-500/20 bg-amber-500/[0.07] text-amber-400" },
  approved: { icon: "carbon:checkmark-filled", cls: "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-400" },
  rejected: { icon: "carbon:close-filled",     cls: "border-red-500/20 bg-red-500/[0.07] text-red-400" },
}

export default function BasvurularimPage() {
  const { t } = useLanguage()
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  const STATUS = {
    pending:  { label: t("pending"),  ...STATUS_ICONS.pending },
    approved: { label: t("approved"), ...STATUS_ICONS.approved },
    rejected: { label: t("rejected"), ...STATUS_ICONS.rejected },
  }

  useEffect(() => {
    fetch("/api/dashboard/basvurularim")
      .then(r => r.json())
      .then(d => { setApps(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white/90">{t("myApplicationsTitle")}</h1>
        <p className="mt-1 text-sm text-white/35">{t("myApplicationsDesc")}</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-white/[0.03] animate-pulse" />)}
        </div>
      ) : apps.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-[#080808] p-16 text-center">
          <Icon icon="carbon:document-blank" className="mx-auto text-white/15 mb-4" width={40} />
          <p className="text-sm text-white/35">{t("noApplications")}</p>
          <a href="/yetkilialim" className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] px-4 py-2 text-xs text-white/50 hover:text-white transition-all">
            <Icon icon="carbon:add" width={13} /> {t("newApplicationBtn")}
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app, i) => {
            const s = STATUS[app.status]
            const isOpen = expanded === app.id
            return (
              <motion.div key={app.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="rounded-2xl border border-white/[0.07] bg-[#090909] overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : app.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition-all"
                >
                  {/* Category icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07]"
                    style={{ background: app.category_color + "18" }}>
                    <Icon icon={app.category_icon ?? "carbon:user-certification"} style={{ color: app.category_color }} width={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white/85">{app.category_name}</p>
                    <p className="text-[11px] text-white/30 mt-0.5">
                      {new Date(app.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>

                  {/* Status badge */}
                  <div className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold shrink-0", s.cls)}>
                    <Icon icon={s.icon} width={11} />
                    {s.label}
                  </div>

                  <Icon icon={isOpen ? "carbon:chevron-up" : "carbon:chevron-down"} className="text-white/25 shrink-0 ml-1" width={14} />
                </button>

                {isOpen && (
                  <div className="border-t border-white/[0.05] px-5 py-4 space-y-4">
                    {/* Answers */}
                    <div className="space-y-2.5">
                      <p className="text-[10px] font-bold text-white/25 uppercase tracking-wider">{t("yourAnswersLabel")}</p>
                      {Object.entries(app.answers).map(([k, v]) => (
                        <div key={k} className="rounded-xl border border-white/[0.05] bg-[#0d0d0d] px-4 py-3">
                          <p className="text-[10px] font-bold text-white/30 mb-1">{k}</p>
                          <p className="text-sm text-white/70">{v}</p>
                        </div>
                      ))}
                    </div>

                    {/* Admin note */}
                    {app.admin_note && (
                      <div className={cn("rounded-xl border px-4 py-3", app.status === "approved" ? "border-emerald-500/20 bg-emerald-500/[0.05]" : "border-red-500/20 bg-red-500/[0.05]")}>
                        <p className="text-[10px] font-bold text-white/30 mb-1 uppercase tracking-wider">{t("adminNoteLabel")}</p>
                        <p className={cn("text-sm", app.status === "approved" ? "text-emerald-300/80" : "text-red-300/80")}>{app.admin_note}</p>
                      </div>
                    )}

                    {app.reviewed_at && (
                      <p className="text-[10px] text-white/20">
                        {t("reviewedAtLabel")} {new Date(app.reviewed_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}