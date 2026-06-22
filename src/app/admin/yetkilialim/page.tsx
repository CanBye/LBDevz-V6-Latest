"use client"

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

interface Field { id?: string; label: string; placeholder: string; fieldType: string; options: string; required: boolean; minLength: number; maxLength: number; order: number }
interface Category { id: string; name: string; description: string | null; icon: string; color: string; visible: boolean; order: number; fields: Field[] }
interface Application { id: string; category_name: string; user_name: string | null; user_email: string | null; user_image: string | null; status: string; answers: Record<string, string>; created_at: string; admin_note: string | null }

const inputCls = "w-full rounded-xl border border-white/[0.07] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all"
const FIELD_TYPES = [{ v: "text", l: "Kısa Metin" }, { v: "textarea", l: "Uzun Metin" }, { v: "number", l: "Sayı" }, { v: "select", l: "Seçim" }]
const emptyCat = { name: "", description: "", icon: "carbon:user-certification", color: "#6366f1", visible: true, order: 0 }
const emptyField = (): Field => ({ label: "", placeholder: "", fieldType: "text", options: "", required: true, minLength: 0, maxLength: 500, order: 0 })

export default function AdminYetkiliAlimPage() {
  const [cats, setCats] = useState<Category[]>([])
  const [apps, setApps] = useState<Application[]>([])
  const [tab, setTab] = useState<"categories" | "applications">("categories")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [editCat, setEditCat] = useState<(typeof emptyCat & { id?: string }) | null>(null)
  const [editFields, setEditFields] = useState<Field[]>([])
  const [editCatId, setEditCatId] = useState<string | null>(null)
  const [savingFields, setSavingFields] = useState(false)
  // Site settings toggle
  const [enabled, setEnabled] = useState(false)
  const [sLabel, setSLabel] = useState("Yetkili Alım Başvuruları Açıldı!")
  const [sColor, setSColor] = useState("#6366f1")
  const [settingSaving, setSettingSaving] = useState(false)

  function load() {
    setLoading(true)
    Promise.all([
      fetch("/api/admin/yetkilialim/categories").then(r => r.json()),
      fetch("/api/admin/yetkilialim/applications").then(r => r.json()),
      fetch("/api/admin/settings").then(r => r.json()),
    ]).then(([c, a, s]) => {
      setCats(Array.isArray(c) ? c : [])
      setApps(Array.isArray(a) ? a : [])
      if (s) {
        setEnabled(s.authorized_purchase_enabled === "true")
        if (s.authorized_purchase_label) setSLabel(s.authorized_purchase_label)
        if (s.authorized_purchase_color) setSColor(s.authorized_purchase_color)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }
  useEffect(() => load(), [])

  async function saveSettings() {
    setSettingSaving(true)
    await fetch("/api/admin/settings", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorized_purchase_enabled: enabled ? "true" : "false", authorized_purchase_label: sLabel, authorized_purchase_color: sColor, authorized_purchase_link: "/yetkilialim" }),
    })
    setSettingSaving(false)
    setMsg({ ok: true, text: "Ayarlar kaydedildi" })
  }

  async function saveCat() {
    if (!editCat?.name) return
    setSaving(true); setMsg(null)
    const isEdit = !!editCat.id
    const res = await fetch(isEdit ? `/api/admin/yetkilialim/categories/${editCat.id}` : "/api/admin/yetkilialim/categories", {
      method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editCat.name, description: editCat.description || null, icon: editCat.icon, color: editCat.color, visible: editCat.visible, order: editCat.order }),
    })
    setSaving(false)
    if (!res.ok) { setMsg({ ok: false, text: "Hata" }); return }
    setMsg({ ok: true, text: isEdit ? "Güncellendi" : "Oluşturuldu" })
    setEditCat(null); load()
  }

  async function delCat(id: string) {
    if (!confirm("Kategoriyi ve tüm başvuruları sil?")) return
    await fetch(`/api/admin/yetkilialim/categories/${id}`, { method: "DELETE" }); load()
  }

  function openFields(cat: Category) {
    setEditCatId(cat.id)
    setEditFields(cat.fields.length > 0 ? cat.fields : [emptyField()])
  }

  async function saveFields() {
    if (!editCatId) return
    setSavingFields(true)
    await fetch(`/api/admin/yetkilialim/categories/${editCatId}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: editFields.map((f, i) => ({ ...f, order: i })) }),
    })
    setSavingFields(false); setEditCatId(null); setEditFields([]); load()
  }

  async function reviewApp(id: string, status: string) {
    await fetch("/api/admin/yetkilialim/applications", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    }); load()
  }

  const pendingCount = apps.filter(a => a.status === "pending").length

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white/90">Yetkili Alım</h1>
        <p className="text-xs text-white/30 mt-0.5 uppercase tracking-widest font-mono">Admin · Yetkili Alım</p>
      </div>

      {msg && <div className={cn("mb-4 rounded-xl border px-4 py-2.5 text-xs font-medium", msg.ok ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400" : "border-red-500/20 bg-red-500/[0.06] text-red-400")}>{msg.text}</div>}

      {/* Toggle card */}
      <div className="mb-6 rounded-2xl border border-white/[0.07] bg-[#0a0a0a] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-bold text-white/85">Sistem Durumu</p>
            <p className="text-xs text-white/35 mt-0.5">Açık olduğunda navbar'da banner gösterilir, başvuru sayfası aktif olur</p>
          </div>
          <button onClick={() => setEnabled(e => !e)}
            className={cn("relative h-7 w-12 rounded-full border transition-all duration-200 shrink-0",
              enabled ? "bg-emerald-500/20 border-emerald-500/40" : "bg-white/[0.04] border-white/[0.08]")}>
            <span className={cn("absolute top-0.5 h-6 w-6 rounded-full transition-all duration-200",
              enabled ? "left-5 bg-emerald-400" : "left-0.5 bg-white/20")} />
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5 block">Banner Yazısı</label>
            <input className={inputCls} value={sLabel} onChange={e => setSLabel(e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5 block">Renk</label>
            <div className="flex items-center gap-3">
              <input type="color" value={sColor} onChange={e => setSColor(e.target.value)} className="h-10 w-14 cursor-pointer rounded-xl border border-white/[0.07] bg-transparent" />
              <span className="font-mono text-xs text-white/40">{sColor}</span>
            </div>
          </div>
        </div>
        <button onClick={saveSettings} disabled={settingSaving}
          className="mt-4 rounded-xl bg-white text-black px-5 py-2 text-xs font-bold hover:bg-white/90 disabled:opacity-40 transition-all">
          {settingSaving ? "Kaydediliyor..." : "Ayarları Kaydet"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/[0.06] mb-6">
        {([["categories", "Kategoriler"], ["applications", `Başvurular${pendingCount > 0 ? ` (${pendingCount})` : ""}`]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={cn("px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 -mb-px",
              tab === k ? "border-white text-white" : "border-transparent text-white/30 hover:text-white/60")}>
            {l}
          </button>
        ))}
      </div>

      {/* Field editor modal */}
      {editCatId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/[0.09] bg-[#080808] p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-bold text-white/85">Form Alanları</p>
              <button onClick={() => { setEditCatId(null); setEditFields([]) }} className="text-white/30 hover:text-white transition-colors">
                <Icon icon="carbon:close" width={18} />
              </button>
            </div>
            <div className="space-y-4">
              {editFields.map((f, i) => (
                <div key={i} className="rounded-xl border border-white/[0.07] bg-[#0d0d0d] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Alan {i + 1}</span>
                    <button onClick={() => setEditFields(fields => fields.filter((_, fi) => fi !== i))} className="text-white/20 hover:text-red-400 transition-colors">
                      <Icon icon="carbon:close" width={14} />
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input className={inputCls} placeholder="Soru / Alan adı *" value={f.label} onChange={e => setEditFields(fields => fields.map((x, xi) => xi === i ? { ...x, label: e.target.value } : x))} />
                    <input className={inputCls} placeholder="Placeholder" value={f.placeholder} onChange={e => setEditFields(fields => fields.map((x, xi) => xi === i ? { ...x, placeholder: e.target.value } : x))} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <select className={inputCls} value={f.fieldType} onChange={e => setEditFields(fields => fields.map((x, xi) => xi === i ? { ...x, fieldType: e.target.value } : x))}>
                      {FIELD_TYPES.map(t => <option key={t.v} value={t.v} className="bg-[#111]">{t.l}</option>)}
                    </select>
                    <input type="number" className={inputCls} placeholder="Min karakter" value={f.minLength} onChange={e => setEditFields(fields => fields.map((x, xi) => xi === i ? { ...x, minLength: Number(e.target.value) } : x))} />
                    <input type="number" className={inputCls} placeholder="Max karakter" value={f.maxLength} onChange={e => setEditFields(fields => fields.map((x, xi) => xi === i ? { ...x, maxLength: Number(e.target.value) } : x))} />
                  </div>
                  {f.fieldType === "select" && (
                    <input className={inputCls} placeholder='Seçenekler JSON: ["A","B","C"]' value={f.options} onChange={e => setEditFields(fields => fields.map((x, xi) => xi === i ? { ...x, options: e.target.value } : x))} />
                  )}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-white" checked={f.required} onChange={e => setEditFields(fields => fields.map((x, xi) => xi === i ? { ...x, required: e.target.checked } : x))} />
                    <span className="text-xs text-white/50">Zorunlu alan</span>
                  </label>
                </div>
              ))}
              <button onClick={() => setEditFields(fields => [...fields, emptyField()])}
                className="w-full rounded-xl border border-dashed border-white/[0.1] py-3 text-xs text-white/35 hover:text-white/60 hover:border-white/20 transition-all flex items-center justify-center gap-2">
                <Icon icon="carbon:add" width={14} /> Alan Ekle
              </button>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={saveFields} disabled={savingFields}
                className="rounded-xl bg-white text-black px-5 py-2 text-xs font-bold hover:bg-white/90 disabled:opacity-40 transition-all">
                {savingFields ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button onClick={() => { setEditCatId(null); setEditFields([]) }} className="rounded-xl border border-white/[0.07] px-4 py-2 text-xs text-white/40 hover:text-white transition-all">İptal</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 rounded-xl bg-white/[0.03] animate-pulse" />)}</div>
      ) : tab === "categories" ? (
        <div className="space-y-3">
          {/* Add category */}
          <button onClick={() => setEditCat(emptyCat)}
            className="w-full rounded-xl border border-dashed border-white/[0.1] py-3 text-xs text-white/35 hover:text-white/60 hover:border-white/20 transition-all flex items-center justify-center gap-2">
            <Icon icon="carbon:add" width={14} /> Yeni Kategori
          </button>

          {editCat && (
            <div className="rounded-2xl border border-white/[0.07] bg-[#0a0a0a] p-5 space-y-3">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">{editCat.id ? "Düzenle" : "Yeni Kategori"}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input className={inputCls} placeholder="Kategori adı (ör: Web Tasarımcı) *" value={editCat.name} onChange={e => setEditCat(c => c ? { ...c, name: e.target.value } : c)} />
                <input className={inputCls} placeholder="Icon (carbon:user-certification)" value={editCat.icon} onChange={e => setEditCat(c => c ? { ...c, icon: e.target.value } : c)} />
              </div>
              <input className={inputCls} placeholder="Açıklama" value={editCat.description} onChange={e => setEditCat(c => c ? { ...c, description: e.target.value } : c)} />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-white/40">Renk:</label>
                  <input type="color" value={editCat.color} onChange={e => setEditCat(c => c ? { ...c, color: e.target.value } : c)} className="h-9 w-12 cursor-pointer rounded-lg border border-white/[0.07] bg-transparent" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-white" checked={editCat.visible} onChange={e => setEditCat(c => c ? { ...c, visible: e.target.checked } : c)} />
                  <span className="text-xs text-white/50">Görünür</span>
                </label>
              </div>
              <div className="flex gap-2">
                <button onClick={saveCat} disabled={saving || !editCat.name}
                  className="rounded-xl bg-white text-black px-5 py-2 text-xs font-bold hover:bg-white/90 disabled:opacity-40 transition-all">
                  {saving ? "..." : "Kaydet"}
                </button>
                <button onClick={() => setEditCat(null)} className="rounded-xl border border-white/[0.07] px-4 py-2 text-xs text-white/40 hover:text-white transition-all">İptal</button>
              </div>
            </div>
          )}

          {cats.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-[#080808] p-12 text-center text-xs text-white/25">Henüz kategori yok</div>
          ) : (
            cats.map(cat => (
              <div key={cat.id} className={cn("rounded-xl border bg-[#0a0a0a] px-4 py-3 flex items-center gap-4 transition-all", cat.visible ? "border-white/[0.07]" : "border-white/[0.03] opacity-50")}>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] shrink-0" style={{ background: cat.color + "18" }}>
                  <Icon icon={cat.icon ?? "carbon:user-certification"} style={{ color: cat.color }} width={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white/85">{cat.name}</p>
                  <p className="text-[10px] text-white/30">{cat.fields.length} alan · {apps.filter(a => a.category_name === cat.name).length} başvuru</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => openFields(cat)} title="Soruları Düzenle"
                    className="flex h-7 items-center gap-1 rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 px-2 hover:bg-indigo-500/20 transition-all text-[10px] font-bold">
                    <Icon icon="carbon:list-checked" width={12} />
                    Sorular
                  </button>
                  <button onClick={() => setEditCat({ ...cat, description: cat.description ?? "", id: cat.id })}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] text-white/30 hover:text-white/70 transition-all">
                    <Icon icon="carbon:edit" width={13} />
                  </button>
                  <button onClick={() => delCat(cat.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] text-white/30 hover:text-red-400 hover:border-red-500/30 transition-all">
                    <Icon icon="carbon:trash-can" width={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {apps.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-[#080808] p-12 text-center text-xs text-white/25">Henüz başvuru yok</div>
          ) : apps.map(app => (
            <div key={app.id} className="rounded-xl border border-white/[0.07] bg-[#0a0a0a] p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-bold text-white/85">{app.user_name ?? app.user_email ?? "Anonim"}</span>
                    <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 px-2 py-0.5 text-[9px] font-bold">{app.category_name}</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-bold border",
                      app.status === "pending" ? "border-amber-500/20 bg-amber-500/10 text-amber-400" :
                      app.status === "approved" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" :
                      "border-red-500/20 bg-red-500/10 text-red-400")}>
                      {app.status === "pending" ? "Bekliyor" : app.status === "approved" ? "Onaylandı" : "Reddedildi"}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/25">{new Date(app.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  {/* Answers */}
                  <div className="mt-3 space-y-1.5">
                    {Object.entries(app.answers).map(([k, v]) => (
                      <div key={k} className="text-xs">
                        <span className="text-white/35">{k}: </span>
                        <span className="text-white/65">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {app.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => reviewApp(app.id, "approved")}
                      className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 text-[10px] font-bold hover:bg-emerald-500/20 transition-all">
                      Onayla
                    </button>
                    <button onClick={() => reviewApp(app.id, "rejected")}
                      className="rounded-lg border border-red-500/25 bg-red-500/10 text-red-400 px-3 py-1.5 text-[10px] font-bold hover:bg-red-500/20 transition-all">
                      Reddet
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}