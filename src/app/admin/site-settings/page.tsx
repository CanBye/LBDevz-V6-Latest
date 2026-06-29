"use client"

import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions"

import { AdminGuard } from "@/components/admin/admin-guard"

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

const inputCls = "w-full rounded-xl border border-white/[0.07] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all"

export default function AdminSiteSettingsPage() {
  const [settings, setSettings] = useState({
    authorized_purchase_enabled: "false",
    authorized_purchase_label: "Yetkili Alım Açıldı!",
    authorized_purchase_color: "#a855f7",
    authorized_purchase_link: "",
  })
  const [loading, setSLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(d => {
      if (d && typeof d === "object") setSettings(s => ({ ...s, ...d }))
      setSLoading(false)
    }).catch(() => setSLoading(false))
  }, [])

  async function save() {
    setSaving(true); setMsg(null)
    const res = await fetch("/api/admin/settings", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings),
    })
    setSaving(false)
    setMsg({ ok: res.ok, text: res.ok ? "Kaydedildi" : "Hata" })
  }

  if (loading) return <div className="p-8"><div className="h-48 rounded-2xl bg-white/[0.03] animate-pulse" /></div>

  const enabled = settings.authorized_purchase_enabled === "true"

  return (
    <AdminGuard permission={ADMIN_PERMISSIONS.SITE_SETTINGS}>
      <div className="p-6 sm:p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white/90">Site Ayarları</h1>
          <p className="text-xs text-white/30 mt-0.5 uppercase tracking-widest font-mono">Admin · Settings</p>
        </div>

        {msg && <div className={cn("mb-4 rounded-xl border px-4 py-2.5 text-xs font-medium", msg.ok ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400" : "border-red-500/20 bg-red-500/[0.06] text-red-400")}>{msg.text}</div>}

        {/* Yetkili Alım */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#0a0a0a] p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white/85">Yetkili Alım Sistemi</p>
              <p className="text-xs text-white/35 mt-0.5">Açıkken navbarda renkli banner gösterilir</p>
            </div>
            <button onClick={() => setSettings(s => ({ ...s, authorized_purchase_enabled: s.authorized_purchase_enabled === "true" ? "false" : "true" }))}
              className={cn("relative h-7 w-12 rounded-full border transition-all duration-200",
                enabled ? "bg-emerald-500/20 border-emerald-500/40" : "bg-white/[0.04] border-white/[0.08]")}>
              <span className={cn("absolute top-0.5 h-6 w-6 rounded-full transition-all duration-200 flex items-center justify-center",
                enabled ? "left-5 bg-emerald-400" : "left-0.5 bg-white/20")}>
              </span>
            </button>
          </div>

          {/* Preview */}
          {enabled && (
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: settings.authorized_purchase_color + "40" }}>
              <div className="px-4 py-2.5 flex items-center justify-center gap-2 text-xs font-bold"
                style={{ background: settings.authorized_purchase_color + "15", color: settings.authorized_purchase_color }}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: settings.authorized_purchase_color }} />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: settings.authorized_purchase_color }} />
                </span>
                {settings.authorized_purchase_label}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5 block">Banner Yazısı</label>
              <input className={inputCls} value={settings.authorized_purchase_label}
                onChange={e => setSettings(s => ({ ...s, authorized_purchase_label: e.target.value }))}
                placeholder="Yetkili Alım Açıldı!" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5 block">Renk</label>
              <div className="flex items-center gap-3">
                <input type="color" value={settings.authorized_purchase_color}
                  onChange={e => setSettings(s => ({ ...s, authorized_purchase_color: e.target.value }))}
                  className="h-10 w-14 cursor-pointer rounded-xl border border-white/[0.07] bg-transparent" />
                <span className="font-mono text-xs text-white/40">{settings.authorized_purchase_color}</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5 block">Link (isteğe bağlı)</label>
              <input className={inputCls} value={settings.authorized_purchase_link}
                onChange={e => setSettings(s => ({ ...s, authorized_purchase_link: e.target.value }))}
                placeholder="/magaza veya https://..." />
            </div>
          </div>

          <button onClick={save} disabled={saving}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-black py-3 text-sm font-bold hover:bg-white/90 disabled:opacity-40 transition-all">
            {saving ? <><Icon icon="carbon:circle-dash" className="animate-spin" width={15} /> Kaydediliyor...</> : "Kaydet"}
          </button>
        </div>
      </div>
      </AdminGuard>
  )
}