"use client"

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface LegalPage { id: string; slug: string; title: string; updated_at: string }

const inputCls = "w-full rounded-xl border border-white/[0.07] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all"

export default function AdminAgreementsPage() {
  const [pages, setPages]   = useState<LegalPage[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<{ id?: string; slug: string; title: string; content: string } | null>(null)
  const [saving, setSaving]   = useState(false)
  const [msg, setMsg]         = useState<{ ok: boolean; text: string } | null>(null)
  const [preview, setPreview] = useState(false)
  const [creating, setCreating] = useState(false)

  const load = () => {
    setLoading(true)
    fetch("/api/admin/legal").then(r => r.json()).then(d => { setPages(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function openEdit(p: LegalPage) {
    setMsg(null)
    const res = await fetch(`/api/legal/${p.slug}`).then(r => r.json())
    setEditing({ id: p.id, slug: p.slug, title: p.title, content: res.content ?? "" })
  }

  async function save() {
    if (!editing) return
    setSaving(true); setMsg(null)
    const method = editing.id ? "PATCH" : "POST"
    const res = await fetch("/api/admin/legal", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    })
    setSaving(false)
    if (res.ok) { setMsg({ ok: true, text: "Kaydedildi!" }); load() }
    else { setMsg({ ok: false, text: "Hata oluştu" }) }
  }

  async function deletePage(id: string) {
    if (!confirm("Bu sayfayı silmek istediğinize emin misiniz?")) return
    await fetch("/api/admin/legal", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    setEditing(null); load()
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white/90">Sözleşmeler</h1>
          <p className="text-xs text-white/30 mt-0.5 uppercase tracking-widest font-mono">Admin · Legal Pages</p>
        </div>
        <button onClick={() => { setCreating(true); setEditing({ slug: "", title: "", content: "" }); setMsg(null) }}
          className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/[0.06] transition-all">
          <Icon icon="carbon:add" width={14} /> Yeni Sayfa
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 items-start">
        {/* Left: list */}
        <div className="lg:col-span-2 space-y-2">
          {loading ? (
            <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />)}</div>
          ) : pages.map(p => (
            <button key={p.id} onClick={() => openEdit(p)}
              className={cn("w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                editing?.id === p.id ? "border-indigo-500/30 bg-indigo-500/[0.07]" : "border-white/[0.06] bg-[#0a0a0a] hover:bg-white/[0.03]")}>
              <div>
                <p className="text-sm font-medium text-white/80">{p.title}</p>
                <p className="text-[10px] text-white/25 font-mono">/sozlesmeler/{p.slug}</p>
              </div>
              <Icon icon="carbon:chevron-right" className="text-white/20 shrink-0" width={14} />
            </button>
          ))}
        </div>

        {/* Right: editor */}
        <div className="lg:col-span-3">
          {!editing ? (
            <div className="rounded-2xl border border-white/[0.06] bg-[#080808] p-16 text-center">
              <Icon icon="carbon:document-blank" className="text-white/10 mx-auto mb-3" width={32} />
              <p className="text-sm text-white/25">Sol taraftan bir sayfa seç veya yeni oluştur</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Title + slug */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Başlık</label>
                  <input className={inputCls} value={editing.title} onChange={e => setEditing(p => p && ({ ...p, title: e.target.value }))} placeholder="Sözleşme başlığı..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Slug</label>
                  <input className={cn(inputCls, editing.id ? "opacity-50 cursor-not-allowed" : "")}
                    value={editing.slug} readOnly={!!editing.id}
                    onChange={e => setEditing(p => p && ({ ...p, slug: e.target.value }))} placeholder="ornek-sozlesme" />
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {["**Kalın**", "_İtalik_", "## Başlık", "- Madde"].map(t => (
                    <button key={t} onClick={() => setEditing(p => p && ({ ...p, content: p.content + "\n" + t }))}
                      className="rounded-lg border border-white/[0.07] bg-[#0d0d0d] px-2 py-1 text-[10px] text-white/40 hover:text-white transition-all font-mono">
                      {t}
                    </button>
                  ))}
                </div>
                <button onClick={() => setPreview(v => !v)}
                  className={cn("flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs transition-all", preview ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400" : "border-white/[0.07] text-white/40 hover:text-white")}>
                  <Icon icon={preview ? "carbon:code" : "carbon:view"} width={12} />
                  {preview ? "Düzenle" : "Önizle"}
                </button>
              </div>

              {/* Editor / Preview */}
              <AnimatePresence mode="wait">
                {preview ? (
                  <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="min-h-[400px] rounded-xl border border-white/[0.07] bg-[#080808] p-5 text-sm text-white/70 leading-relaxed prose prose-invert max-w-none whitespace-pre-wrap">
                    {editing.content || <span className="text-white/20 italic">İçerik yok</span>}
                  </motion.div>
                ) : (
                  <motion.textarea key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className={cn(inputCls, "min-h-[400px] font-mono text-xs leading-relaxed resize-y")}
                    value={editing.content}
                    onChange={e => setEditing(p => p && ({ ...p, content: e.target.value }))}
                    placeholder="Sözleşme içeriğini buraya yazın... Markdown desteklidir." />
                )}
              </AnimatePresence>

              {msg && (
                <div className={cn("rounded-xl border px-4 py-2.5 text-xs font-medium", msg.ok ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400" : "border-red-500/20 bg-red-500/[0.06] text-red-400")}>
                  {msg.text}
                </div>
              )}

              <div className="flex items-center justify-between">
                {editing.id && (
                  <button onClick={() => deletePage(editing.id!)}
                    className="flex items-center gap-1.5 rounded-xl border border-red-500/20 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-all">
                    <Icon icon="carbon:trash-can" width={13} /> Sil
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
                  <button onClick={() => { setEditing(null); setCreating(false) }}
                    className="rounded-xl border border-white/[0.07] px-4 py-2 text-xs text-white/40 hover:text-white transition-all">
                    İptal
                  </button>
                  <button onClick={save} disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-xs font-bold text-white transition-all disabled:opacity-50">
                    {saving ? <Icon icon="carbon:circle-dash" className="animate-spin" width={13} /> : <Icon icon="carbon:save" width={13} />}
                    Kaydet
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}