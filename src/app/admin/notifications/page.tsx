"use client"

import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions"

import { AdminGuard } from "@/components/admin/admin-guard"

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

interface Customer { id: string; name: string | null; email: string; username: string | null }

const inputCls = "w-full rounded-xl border border-white/[0.07] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all"

const TYPES = ["info", "success", "warning", "error"] as const

export default function AdminNotificationsPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [form, setForm] = useState({ target: "all", userId: "", type: "info" as typeof TYPES[number], title: "", body: "", link: "" })

  useEffect(() => {
    fetch("/api/admin/customers").then(r => r.json()).then(d => setCustomers(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  async function send() {
    setSending(true); setMsg(null)
    const res = await fetch("/api/admin/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: form.target,
        userId: form.target === "user" ? form.userId : undefined,
        type: form.type,
        title: form.title,
        body: form.body,
        link: form.link || undefined,
      }),
    })
    const data = await res.json()
    setSending(false)
    setMsg({ ok: res.ok, text: res.ok ? `${data.count ?? 1} kullanıcıya gönderildi` : data.error ?? "Hata" })
    if (res.ok) setForm(p => ({ ...p, title: "", body: "", link: "" }))
  }

  const typeColors: Record<string, string> = {
    info: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    error: "border-red-500/30 bg-red-500/10 text-red-400",
  }

  return (
    <AdminGuard permission={ADMIN_PERMISSIONS.NOTIFICATIONS}>
      <div className="p-6 sm:p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white/90">Bildirim Gönder</h1>
          <p className="text-xs text-white/30 mt-0.5 uppercase tracking-widest font-mono">Admin · Notifications</p>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-[#0a0a0a] p-6 space-y-4">
          {/* Target */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Hedef</label>
            <div className="flex gap-2">
              {[["all", "Tüm Kullanıcılar"], ["user", "Belirli Kullanıcı"]].map(([v, l]) => (
                <button key={v} onClick={() => setForm(p => ({ ...p, target: v }))}
                  className={cn("flex-1 rounded-xl border py-2 text-xs font-semibold transition-all",
                    form.target === v ? "border-white/20 bg-white/[0.07] text-white" : "border-white/[0.06] text-white/35 hover:text-white/60")}>
                  {l}
                </button>
              ))}
            </div>
            {form.target === "user" && (
              <select className={inputCls} value={form.userId} onChange={e => setForm(p => ({ ...p, userId: e.target.value }))}>
                <option value="" className="bg-[#111]">Kullanıcı seç...</option>
                {customers.map(c => <option key={c.id} value={c.id} className="bg-[#111]">{c.name ?? c.username ?? c.email}</option>)}
              </select>
            )}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Tür</label>
            <div className="flex gap-2 flex-wrap">
              {TYPES.map(t => (
                <button key={t} onClick={() => setForm(p => ({ ...p, type: t }))}
                  className={cn("rounded-lg border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all",
                    form.type === t ? typeColors[t] : "border-white/[0.06] text-white/25 hover:text-white/50")}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Başlık</label>
            <input className={inputCls} placeholder="Bildirim başlığı" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Mesaj</label>
            <textarea className={cn(inputCls, "min-h-[90px] resize-none")} placeholder="Bildirim içeriği..." value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Link (isteğe bağlı)</label>
            <input className={inputCls} placeholder="/dashboard/..." value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} />
          </div>

          {msg && <div className={cn("rounded-xl border px-4 py-2.5 text-xs font-medium", msg.ok ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400" : "border-red-500/20 bg-red-500/[0.06] text-red-400")}>{msg.text}</div>}

          <button onClick={send} disabled={sending || !form.title || !form.body || (form.target === "user" && !form.userId)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-black py-3 text-sm font-bold hover:bg-white/90 disabled:opacity-40 transition-all">
            {sending ? <><Icon icon="carbon:circle-dash" className="animate-spin" width={15} /> Gönderiliyor...</> : <><Icon icon="carbon:send-alt" width={15} /> Gönder</>}
          </button>
        </div>
      </div>
      </AdminGuard>
  )
}