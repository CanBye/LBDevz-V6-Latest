"use client"

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

interface WebhookConfig { id: string; event: string; url: string; enabled: boolean; template: string | null; createdAt: string }

const EVENTS = [
  "purchase", "license.created", "license.revoked", "license.expired",
  "topup.approved", "topup.rejected", "ticket.created", "ticket.closed",
  "user.registered", "download.completed",
]

const inputCls = "w-full rounded-xl border border-white/[0.07] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all"
const emptyForm = { event: EVENTS[0], url: "", template: "" }

export default function AdminWebhooksPage() {
  const [hooks,   setHooks]   = useState<WebhookConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState<{ ok: boolean; text: string } | null>(null)
  const [form,    setForm]    = useState(emptyForm)
  const [editId,  setEditId]  = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)

  function load() {
    setLoading(true)
    fetch("/api/admin/webhooks").then(r => r.json()).then(d => { setHooks(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  function startAdd() {
    setForm(emptyForm); setEditId(null); setShowForm(true); setMsg(null)
  }

  function startEdit(h: WebhookConfig) {
    setForm({ event: h.event, url: h.url, template: h.template ?? "" })
    setEditId(h.id); setShowForm(true); setMsg(null)
  }

  async function save() {
    setSaving(true); setMsg(null)
    const isEdit = editId !== null
    const res = await fetch(isEdit ? `/api/admin/webhooks/${editId}` : "/api/admin/webhooks", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: form.event, url: form.url, template: form.template || "" }),
    })
    setSaving(false)
    const data = await res.json()
    if (!res.ok) { setMsg({ ok: false, text: data.error ?? "Hata" }); return }
    setMsg({ ok: true, text: isEdit ? "Webhook güncellendi" : "Webhook eklendi" })
    setForm(emptyForm); setEditId(null); setShowForm(false); load()
  }

  async function toggleHook(h: WebhookConfig) {
    await fetch(`/api/admin/webhooks/${h.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: !h.enabled }) })
    load()
  }

  async function deleteHook(id: string) {
    if (!confirm("Webhook'u sil?")) return
    await fetch(`/api/admin/webhooks/${id}`, { method: "DELETE" }); load()
  }

  async function testHook(id: string) {
    setTesting(id); setMsg(null)
    const res = await fetch(`/api/admin/webhooks/${id}/test`, { method: "POST" })
    const data = await res.json()
    setTesting(null)
    setMsg({ ok: res.ok, text: res.ok ? "Test başarılı ✓" : `Başarısız: ${data.error}` })
  }

  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white/90">Webhooks</h1>
          <p className="text-xs text-white/30 mt-0.5 uppercase tracking-widest font-mono">Admin · Webhooks</p>
        </div>
        <button onClick={startAdd}
          className="flex items-center gap-2 rounded-xl bg-white text-black px-4 py-2 text-xs font-bold hover:bg-white/90 transition-all">
          <Icon icon="carbon:add" width={14} />
          Webhook Ekle
        </button>
      </div>

      {msg && (
        <div className={cn("mb-4 rounded-xl border px-4 py-2.5 text-xs font-medium", msg.ok ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400" : "border-red-500/20 bg-red-500/[0.06] text-red-400")}>
          {msg.text}
        </div>
      )}

      {showForm && (
        <div className="mb-6 rounded-2xl border border-white/[0.07] bg-[#0a0a0a] p-5 space-y-3">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">
            {editId ? "Webhook Düzenle" : "Yeni Webhook"}
          </p>

          <div className="space-y-1.5">
            <label className="text-[10px] text-white/30 uppercase tracking-wider font-bold">Olay</label>
            <select className={inputCls} value={form.event} onChange={e => setForm(p => ({ ...p, event: e.target.value }))}>
              {EVENTS.map(e => <option key={e} value={e} className="bg-[#111]">{e}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-white/30 uppercase tracking-wider font-bold">URL</label>
            <input className={inputCls} placeholder="https://discord.com/api/webhooks/..." value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-white/30 uppercase tracking-wider font-bold">
              JSON Şablon <span className="text-white/20 font-normal normal-case tracking-normal">(isteğe bağlı — boş bırakırsan orijinal payload gönderilir)</span>
            </label>
            <textarea
              className={cn(inputCls, "min-h-[120px] resize-y font-mono text-xs leading-relaxed")}
              placeholder={`{"content": "Yeni lisans oluşturuldu: {{licenseKey}}"}\n{"embeds": [{"title": "{{event}}", "description": "{{licenseKey}}"}]}`}
              value={form.template}
              onChange={e => setForm(p => ({ ...p, template: e.target.value }))}
            />
            <p className="text-[10px] text-white/25">Kullanılabilir değişkenler: {"{{"} event {"}}"}, {"{{"} licenseKey {"}}"}, {"{{"} userId {"}}"}, {"{{"} product {"}}"}, {"{{"} timestamp {"}}"}</p>
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={save} disabled={saving || !form.url}
              className="rounded-xl bg-white text-black px-5 py-2 text-xs font-bold hover:bg-white/90 disabled:opacity-40 transition-all">
              {saving ? "Kaydediliyor..." : editId ? "Güncelle" : "Ekle"}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null) }}
              className="rounded-xl border border-white/[0.07] px-4 py-2 text-xs text-white/40 hover:text-white transition-all">
              İptal
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[1, 2].map(i => <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />)}</div>
      ) : hooks.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-[#080808] p-12 text-center">
          <Icon icon="carbon:webhook" className="mx-auto text-white/10 mb-3" width={32} />
          <p className="text-xs text-white/25">Henüz webhook yok — eklemek için yukarıdaki butonu kullan</p>
        </div>
      ) : (
        <div className="space-y-2">
          {hooks.map(h => (
            <div key={h.id} className={cn("rounded-xl border bg-[#0a0a0a] p-4 transition-all", h.enabled ? "border-white/[0.07]" : "border-white/[0.03] opacity-50")}>
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 text-[10px] font-mono font-bold">{h.event}</span>
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", h.enabled ? "text-emerald-400" : "text-white/25")}>
                      {h.enabled ? "Aktif" : "Pasif"}
                    </span>
                    {h.template && <span className="text-[10px] text-white/25 italic">şablon mevcut</span>}
                  </div>
                  <p className="font-mono text-[11px] text-white/40 truncate">{h.url}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => testHook(h.id)} disabled={testing === h.id} title="Test Et"
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] text-white/30 hover:text-amber-400 hover:border-amber-500/30 transition-all">
                    <Icon icon={testing === h.id ? "carbon:circle-dash" : "carbon:play-outline"} width={13} className={testing === h.id ? "animate-spin" : ""} />
                  </button>
                  <button onClick={() => startEdit(h)} title="Düzenle"
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] text-white/30 hover:text-white/70 transition-all">
                    <Icon icon="carbon:edit" width={13} />
                  </button>
                  <button onClick={() => toggleHook(h)} title={h.enabled ? "Pasif Yap" : "Aktif Yap"}
                    className={cn("flex h-7 w-7 items-center justify-center rounded-lg border transition-all",
                      h.enabled ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-white/[0.06] text-white/25 hover:text-white/60")}>
                    <Icon icon={h.enabled ? "carbon:checkmark" : "carbon:close"} width={13} />
                  </button>
                  <button onClick={() => deleteHook(h.id)} title="Sil"
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] text-white/30 hover:text-red-400 hover:border-red-500/30 transition-all">
                    <Icon icon="carbon:trash-can" width={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}