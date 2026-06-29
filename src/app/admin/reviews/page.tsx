"use client"

import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions"

import { AdminGuard } from "@/components/admin/admin-guard"

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

interface Review {
  id: string
  name: string
  role: string
  quote: string
  image: string | null
  rating: number
  visible: boolean
  order: number
}

const EMPTY_FORM = { name: "", role: "", quote: "", image: "", rating: 5 }

const inputCls = "w-full rounded-xl border border-white/[0.07] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all"

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState<{ ok: boolean; text: string } | null>(null)
  const [editId,  setEditId]  = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [showAdd, setShowAdd] = useState(false)

  function load() {
    setLoading(true)
    fetch("/api/admin/reviews")
      .then(r => r.json())
      .then(d => { setReviews(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function save() {
    setSaving(true); setMsg(null)
    const isEdit = editId !== null
    const body = { ...form, image: form.image.trim() || null }
    const res = await fetch(isEdit ? `/api/admin/reviews/${editId}` : "/api/admin/reviews", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    setSaving(false)
    if (!res.ok) { setMsg({ ok: false, text: (await res.json()).error ?? "Hata" }); return }
    setMsg({ ok: true, text: isEdit ? "Güncellendi" : "Eklendi" })
    setForm(EMPTY_FORM)
    setEditId(null); setShowAdd(false); load()
  }

  async function toggle(r: Review) {
    await fetch(`/api/admin/reviews/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !r.visible }),
    })
    load()
  }

  async function del(id: string) {
    if (!confirm("Yorumu sil?")) return
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" })
    load()
  }

  function startEdit(r: Review) {
    setForm({ name: r.name, role: r.role, quote: r.quote, image: r.image ?? "", rating: r.rating })
    setEditId(r.id); setShowAdd(true)
  }

  return (
    <AdminGuard permission={ADMIN_PERMISSIONS.REVIEWS}>
      <div className="p-6 sm:p-8 max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white/90">Yorumlar</h1>
            <p className="text-xs text-white/30 mt-0.5 uppercase tracking-widest font-mono">Admin · Reviews</p>
          </div>
          <button
            onClick={() => { setShowAdd(s => !s); setEditId(null); setForm(EMPTY_FORM) }}
            className="flex items-center gap-2 rounded-xl bg-white text-black px-4 py-2 text-xs font-bold hover:bg-white/90 transition-all"
          >
            <Icon icon="carbon:add" width={14} />
            Yorum Ekle
          </button>
        </div>

        {showAdd && (
          <div className="mb-6 rounded-2xl border border-white/[0.07] bg-[#0a0a0a] p-5 space-y-3">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">
              {editId ? "Yorumu Düzenle" : "Yeni Yorum"}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className={inputCls}
                placeholder="Ad Soyad"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              />
              <input
                className={inputCls}
                placeholder="Rol / Unvan"
                value={form.role}
                onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              />
            </div>

            {/* Profile photo URL + preview */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Icon icon="carbon:user-avatar" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" width={14} />
                <input
                  className={cn(inputCls, "pl-8")}
                  placeholder="Profil fotoğrafı URL'i (isteğe bağlı)"
                  value={form.image}
                  onChange={e => setForm(p => ({ ...p, image: e.target.value }))}
                />
              </div>
              {form.image.trim() ? (
                <img
                  src={form.image}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover border border-white/10 shrink-0"
                  onError={e => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <div className="h-10 w-10 rounded-full border border-white/[0.06] bg-[#111] flex items-center justify-center shrink-0">
                  <Icon icon="carbon:user" className="text-white/20" width={16} />
                </div>
              )}
            </div>

            <textarea
              className={cn(inputCls, "min-h-[90px] resize-none")}
              placeholder="Yorum metni..."
              value={form.quote}
              onChange={e => setForm(p => ({ ...p, quote: e.target.value }))}
            />

            <div className="flex items-center gap-3">
              <label className="text-xs text-white/40">Puan:</label>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setForm(p => ({ ...p, rating: n }))}
                  className={cn("text-lg transition-all", form.rating >= n ? "text-white/70" : "text-white/15")}
                >
                  ★
                </button>
              ))}
            </div>

            {msg && (
              <p className={cn("text-xs font-medium", msg.ok ? "text-emerald-400" : "text-red-400")}>
                {msg.text}
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={saving || !form.name || !form.quote}
                className="rounded-xl bg-white text-black px-5 py-2 text-xs font-bold hover:bg-white/90 disabled:opacity-40 transition-all"
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button
                onClick={() => { setShowAdd(false); setEditId(null) }}
                className="rounded-xl border border-white/[0.07] px-4 py-2 text-xs text-white/40 hover:text-white transition-all"
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-[#080808] p-12 text-center text-xs text-white/25">
            Henüz yorum yok
          </div>
        ) : (
          <div className="space-y-2">
            {reviews.map(r => (
              <div
                key={r.id}
                className={cn(
                  "rounded-xl border bg-[#0a0a0a] p-4 transition-all",
                  r.visible ? "border-white/[0.07]" : "border-white/[0.03] opacity-50"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="h-9 w-9 shrink-0 rounded-full border border-white/[0.07] bg-[#111] overflow-hidden flex items-center justify-center">
                    {r.image ? (
                      <img src={r.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-white/25">
                        {r.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white/85">{r.name}</span>
                      <span className="text-[10px] text-white/30">{r.role}</span>
                      <span className="text-xs text-white/25">{"★".repeat(r.rating)}</span>
                    </div>
                    <p className="mt-1 text-xs text-white/45 line-clamp-2">"{r.quote}"</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => toggle(r)}
                      title={r.visible ? "Gizle" : "Göster"}
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg border transition-all",
                        r.visible
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : "border-white/[0.06] text-white/25 hover:text-white/60"
                      )}
                    >
                      <Icon icon={r.visible ? "carbon:view" : "carbon:view-off"} width={13} />
                    </button>
                    <button
                      onClick={() => startEdit(r)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] text-white/30 hover:text-white/70 transition-all"
                    >
                      <Icon icon="carbon:edit" width={13} />
                    </button>
                    <button
                      onClick={() => del(r.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] text-white/30 hover:text-red-400 hover:border-red-500/30 transition-all"
                    >
                      <Icon icon="carbon:trash-can" width={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </AdminGuard>
  )
}