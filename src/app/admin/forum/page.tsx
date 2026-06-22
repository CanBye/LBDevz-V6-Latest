"use client"

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

interface Category { id: string; name: string; slug: string; description: string | null; icon: string; color: string; min_chars: number; require_title: boolean; rules: string | null; order: number; visible: boolean }
const inputCls = "w-full rounded-xl border border-white/[0.07] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all"
const emptyForm = { name: "", description: "", icon: "carbon:forum", color: "#6366f1", minChars: 50, requireTitle: true, rules: "", order: 0, visible: true }

export default function AdminForumPage() {
  const [cats, setCats] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  function load() { setLoading(true); fetch("/api/admin/forum/categories").then(r => r.json()).then(d => { setCats(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false)) }
  useEffect(() => load(), [])

  function startEdit(c: Category) {
    setForm({ name: c.name, description: c.description ?? "", icon: c.icon, color: c.color, minChars: c.min_chars, requireTitle: c.require_title, rules: c.rules ?? "", order: c.order, visible: c.visible })
    setEditId(c.id); setShowForm(true); setMsg(null)
  }

  async function save() {
    setSaving(true); setMsg(null)
    const isEdit = !!editId
    const body = { name: form.name, description: form.description || undefined, icon: form.icon, color: form.color, minChars: form.minChars, requireTitle: form.requireTitle, rules: form.rules || undefined, order: form.order, visible: form.visible }
    const res = await fetch(isEdit ? `/api/admin/forum/categories/${editId}` : "/api/admin/forum/categories", {
      method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setMsg({ ok: false, text: data.error ?? "Hata" }); return }
    setMsg({ ok: true, text: isEdit ? "Güncellendi" : "Oluşturuldu" })
    setForm(emptyForm); setEditId(null); setShowForm(false); load()
  }

  async function del(id: string) {
    if (!confirm("Kategoriyi ve tüm konuları sil?")) return
    await fetch(`/api/admin/forum/categories/${id}`, { method: "DELETE" }); load()
  }

  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white/90">Forum Kategorileri</h1>
          <p className="text-xs text-white/30 mt-0.5 uppercase tracking-widest font-mono">Admin · Forum</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(s => !s) }}
          className="flex items-center gap-2 rounded-xl bg-white text-black px-4 py-2 text-xs font-bold hover:bg-white/90 transition-all">
          <Icon icon="carbon:add" width={14} /> Kategori Ekle
        </button>
      </div>

      {msg && <div className={cn("mb-4 rounded-xl border px-4 py-2.5 text-xs font-medium", msg.ok ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400" : "border-red-500/20 bg-red-500/[0.06] text-red-400")}>{msg.text}</div>}

      {showForm && (
        <div className="mb-6 rounded-2xl border border-white/[0.07] bg-[#0a0a0a] p-5 space-y-3">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">{editId ? "Kategoriyi Düzenle" : "Yeni Kategori"}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className={inputCls} placeholder="Kategori adı *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <input className={inputCls} placeholder="Icon (carbon:forum)" value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} />
          </div>
          <input className={inputCls} placeholder="Açıklama" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          <textarea className={cn(inputCls, "min-h-[80px] resize-none")} placeholder="Kurallar (kullanıcıya gösterilir)..." value={form.rules} onChange={e => setForm(p => ({ ...p, rules: e.target.value }))} />
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-white/40">Renk:</label>
              <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} className="h-8 w-10 cursor-pointer rounded-lg border border-white/[0.07] bg-transparent" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-white/40">Min karakter:</label>
              <input type="number" min={0} value={form.minChars} onChange={e => setForm(p => ({ ...p, minChars: Number(e.target.value) }))} className="w-16 rounded-lg border border-white/[0.07] bg-[#0d0d0d] px-2 py-1.5 text-xs text-white outline-none" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-white/40">Sıra:</label>
              <input type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))} className="w-16 rounded-lg border border-white/[0.07] bg-[#0d0d0d] px-2 py-1.5 text-xs text-white outline-none" />
            </div>
          </div>
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-white" checked={form.requireTitle} onChange={e => setForm(p => ({ ...p, requireTitle: e.target.checked }))} />
              <span className="text-xs text-white/50">Başlık zorunlu</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-white" checked={form.visible} onChange={e => setForm(p => ({ ...p, visible: e.target.checked }))} />
              <span className="text-xs text-white/50">Görünür</span>
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving || !form.name}
              className="rounded-xl bg-white text-black px-5 py-2 text-xs font-bold hover:bg-white/90 disabled:opacity-40 transition-all">
              {saving ? "..." : editId ? "Güncelle" : "Oluştur"}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null) }} className="rounded-xl border border-white/[0.07] px-4 py-2 text-xs text-white/40 hover:text-white transition-all">İptal</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 rounded-xl bg-white/[0.03] animate-pulse" />)}</div>
      ) : cats.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-[#080808] p-12 text-center text-xs text-white/25">Henüz kategori yok</div>
      ) : (
        <div className="space-y-2">
          {cats.map(c => (
            <div key={c.id} className={cn("rounded-xl border bg-[#0a0a0a] px-4 py-3 flex items-center gap-4 transition-all", c.visible ? "border-white/[0.07]" : "border-white/[0.03] opacity-50")}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] shrink-0" style={{ background: c.color + "18" }}>
                <Icon icon={c.icon ?? "carbon:forum"} style={{ color: c.color }} width={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white/85">{c.name}</p>
                <p className="text-[10px] text-white/30">Min: {c.min_chars} kar · {c.require_title ? "Başlık zorunlu" : "Başlıksız"}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => startEdit(c)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] text-white/30 hover:text-white/70 transition-all">
                  <Icon icon="carbon:edit" width={13} />
                </button>
                <button onClick={() => del(c.id)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] text-white/30 hover:text-red-400 hover:border-red-500/30 transition-all">
                  <Icon icon="carbon:trash-can" width={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}