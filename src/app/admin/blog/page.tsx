"use client"

import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions"

import { AdminGuard } from "@/components/admin/admin-guard"

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

interface Post { id: string; title: string; slug: string; published: boolean; published_at: string | null; created_at: string }
const inputCls = "w-full rounded-xl border border-white/[0.07] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all"
const emptyForm = { title: "", excerpt: "", content: "", coverUrl: "", published: false }

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  function load() { setLoading(true); fetch("/api/admin/blog").then(r => r.json()).then(d => { setPosts(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false)) }
  useEffect(() => load(), [])

  function startNew() { setForm(emptyForm); setEditId(null); setShowForm(true); setMsg(null) }
  function startEdit(p: Post) { setForm({ title: p.title, excerpt: "", content: "", coverUrl: "", published: p.published }); setEditId(p.id); setShowForm(true); setMsg(null) }

  async function save() {
    setSaving(true); setMsg(null)
    const isEdit = !!editId
    const res = await fetch(isEdit ? `/api/admin/blog/${editId}` : "/api/admin/blog", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: form.title, excerpt: form.excerpt || undefined, content: form.content || undefined, coverUrl: form.coverUrl || undefined, published: form.published }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setMsg({ ok: false, text: data.error ?? "Hata" }); return }
    setMsg({ ok: true, text: isEdit ? "Güncellendi" : "Yayınlandı" })
    setForm(emptyForm); setEditId(null); setShowForm(false); load()
  }

  async function togglePublish(p: Post) {
    await fetch(`/api/admin/blog/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !p.published }) })
    load()
  }

  async function del(id: string) {
    if (!confirm("Gönderiyi sil?")) return
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE" }); load()
  }

  return (
    <AdminGuard permission={ADMIN_PERMISSIONS.BLOG}>
      <div className="p-6 sm:p-8 max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white/90">Blog / Duyurular</h1>
            <p className="text-xs text-white/30 mt-0.5 uppercase tracking-widest font-mono">Admin · Blog</p>
          </div>
          <button onClick={startNew} className="flex items-center gap-2 rounded-xl bg-white text-black px-4 py-2 text-xs font-bold hover:bg-white/90 transition-all">
            <Icon icon="carbon:add" width={14} /> Yeni Yazı
          </button>
        </div>

        {msg && <div className={cn("mb-4 rounded-xl border px-4 py-2.5 text-xs font-medium", msg.ok ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400" : "border-red-500/20 bg-red-500/[0.06] text-red-400")}>{msg.text}</div>}

        {showForm && (
          <div className="mb-6 rounded-2xl border border-white/[0.07] bg-[#0a0a0a] p-5 space-y-3">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">{editId ? "Düzenle" : "Yeni Yazı"}</p>
            <input className={inputCls} placeholder="Başlık *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <input className={inputCls} placeholder="Kapak fotoğrafı URL" value={form.coverUrl} onChange={e => setForm(p => ({ ...p, coverUrl: e.target.value }))} />
            <textarea className={cn(inputCls, "min-h-[70px] resize-none")} placeholder="Kısa açıklama (excerpt)" value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} />
            <textarea className={cn(inputCls, "min-h-[200px] resize-y font-mono text-xs")} placeholder="İçerik (HTML destekli)" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-white" checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} />
              <span className="text-xs text-white/50">Hemen yayınla (webhook tetiklenir)</span>
            </label>
            <div className="flex gap-2">
              <button onClick={save} disabled={saving || !form.title}
                className="rounded-xl bg-white text-black px-5 py-2 text-xs font-bold hover:bg-white/90 disabled:opacity-40 transition-all">
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button onClick={() => { setShowForm(false); setEditId(null) }} className="rounded-xl border border-white/[0.07] px-4 py-2 text-xs text-white/40 hover:text-white transition-all">İptal</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 rounded-xl bg-white/[0.03] animate-pulse" />)}</div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-[#080808] p-12 text-center text-xs text-white/25">Henüz yazı yok</div>
        ) : (
          <div className="space-y-2">
            {posts.map(p => (
              <div key={p.id} className={cn("rounded-xl border bg-[#0a0a0a] px-4 py-3 flex items-center gap-3 transition-all", p.published ? "border-white/[0.07]" : "border-white/[0.03] opacity-60")}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white/85 truncate">{p.title}</p>
                  <p className="text-[10px] text-white/25 font-mono">{p.slug}</p>
                </div>
                <span className={cn("text-[9px] font-bold uppercase tracking-wider shrink-0", p.published ? "text-emerald-400" : "text-white/25")}>
                  {p.published ? "Yayında" : "Taslak"}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => togglePublish(p)} title={p.published ? "Yayından Kaldır" : "Yayınla"}
                    className={cn("flex h-7 w-7 items-center justify-center rounded-lg border transition-all",
                      p.published ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-white/[0.06] text-white/25 hover:text-emerald-400")}>
                    <Icon icon={p.published ? "carbon:view" : "carbon:view-off"} width={13} />
                  </button>
                  <button onClick={() => startEdit(p)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] text-white/30 hover:text-white/70 transition-all">
                    <Icon icon="carbon:edit" width={13} />
                  </button>
                  <button onClick={() => del(p.id)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] text-white/30 hover:text-red-400 hover:border-red-500/30 transition-all">
                    <Icon icon="carbon:trash-can" width={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </AdminGuard>
  )
}