"use client"

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { AdminGuard } from "@/components/admin/admin-guard"
import { useConfirm } from "@/components/ui/confirm-dialog"
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions"

interface RefServer {
  id: string
  name: string
  href: string | null
  logoUrl: string | null
  players: number
  showInHero: boolean
  showInSection: boolean
  order: number
  visible: boolean
}

const BLANK = {
  name: "", href: "", logoUrl: "", players: 0,
  showInHero: true, showInSection: true, order: 0,
}

export default function ReferencesAdminPage() {
  const [servers, setServers] = useState<RefServer[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ ...BLANK })
  const [editing, setEditing] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [logoMode, setLogoMode] = useState<"url" | "upload">("url")
  const confirm = useConfirm()
  const [uploadLoading, setUploadLoading] = useState(false)

  async function load() {
    const r = await fetch("/api/admin/references").then(r => r.json())
    setServers(Array.isArray(r) ? r : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openEdit(s: RefServer) {
    setEditing(s.id)
    setForm({ name: s.name, href: s.href ?? "", logoUrl: s.logoUrl ?? "", players: s.players, showInHero: s.showInHero, showInSection: s.showInSection, order: s.order })
    setMsg(null)
  }

  function reset() { setEditing(null); setForm({ ...BLANK }); setMsg(null) }

  async function handleUpload(file: File) {
    setUploadLoading(true)
    const fd = new FormData(); fd.append("file", file)
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
    const data = await res.json()
    setUploadLoading(false)
    if (data.url) setForm(f => ({ ...f, logoUrl: data.url }))
  }

  async function save() {
    setSaving(true); setMsg(null)
    const method = editing ? "PATCH" : "POST"
    const url = editing ? `/api/admin/references/${editing}` : "/api/admin/references"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, players: Number(form.players), order: Number(form.order) }),
    })
    setSaving(false)
    if (!res.ok) { setMsg({ ok: false, text: "Hata oluştu" }); return }
    setMsg({ ok: true, text: editing ? "Güncellendi" : "Eklendi" })
    reset(); load()
  }

  async function del(id: string) {
    const ok = await confirm({ title: "Sunucu Sil", description: "Bu sunucu kalıcı olarak silinecek.", confirmText: "Sil", cancelText: "İptal" })
    if (!ok) return
    await fetch(`/api/admin/references/${id}`, { method: "DELETE" })
    load()
  }

  async function toggleVisible(s: RefServer) {
    await fetch(`/api/admin/references/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !s.visible }),
    })
    load()
  }

  return (
    <AdminGuard permission={ADMIN_PERMISSIONS.SITE_SETTINGS}>
      <div className="p-6 sm:p-8 space-y-8 max-w-5xl">
        <div>
          <h1 className="text-lg font-bold text-white/90">Referans Sunucular</h1>
          <p className="text-xs text-white/35 mt-1">Hero ve referanslar section'ında gösterilecek sunucuları yönet.</p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-6 space-y-4">
          <p className="text-xs font-bold text-white/50 uppercase tracking-widest">{editing ? "Düzenle" : "Yeni Ekle"}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[10px] text-white/35 uppercase tracking-wider">Sunucu Adı *</label>
              <input className="w-full rounded-xl border border-white/[0.07] bg-[#111] px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/20" placeholder="HanedanMC" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-white/35 uppercase tracking-wider">Link (URL)</label>
              <input className="w-full rounded-xl border border-white/[0.07] bg-[#111] px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/20" placeholder="https://hanedanmc.com" value={form.href} onChange={e => setForm(f => ({ ...f, href: e.target.value }))} />
            </div>
          </div>

          {/* Logo */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-white/35 uppercase tracking-wider">Logo</label>
              <div className="flex rounded-lg border border-white/[0.07] overflow-hidden text-[10px]">
                {(["url", "upload"] as const).map(m => (
                  <button key={m} onClick={() => setLogoMode(m)} className={cn("px-2.5 py-1 transition-colors", logoMode === m ? "bg-white/10 text-white" : "text-white/35 hover:text-white/60")}>
                    {m === "url" ? "URL" : "Yükle"}
                  </button>
                ))}
              </div>
              {form.logoUrl && <img src={form.logoUrl} alt="" className="size-7 rounded-full object-cover border border-white/10" />}
            </div>
            {logoMode === "url" ? (
              <input className="w-full rounded-xl border border-white/[0.07] bg-[#111] px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/20" placeholder="https://..." value={form.logoUrl} onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))} />
            ) : (
              <label className={cn("flex items-center gap-2 rounded-xl border border-dashed border-white/[0.12] bg-[#111] px-4 py-3 text-xs text-white/35 cursor-pointer hover:border-white/25 transition-colors", uploadLoading && "opacity-50 pointer-events-none")}>
                <Icon icon="carbon:upload" width={14} />
                {uploadLoading ? "Yükleniyor..." : "Dosya seç (PNG, JPG, SVG)"}
                <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]) }} />
              </label>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-[10px] text-white/35 uppercase tracking-wider">Oyuncu Sayısı</label>
              <input type="number" className="w-full rounded-xl border border-white/[0.07] bg-[#111] px-3 py-2 text-sm text-white outline-none focus:border-white/20" value={form.players} onChange={e => setForm(f => ({ ...f, players: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-white/35 uppercase tracking-wider">Sıra</label>
              <input type="number" className="w-full rounded-xl border border-white/[0.07] bg-[#111] px-3 py-2 text-sm text-white outline-none focus:border-white/20" value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2 pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-indigo-500" checked={form.showInHero} onChange={e => setForm(f => ({ ...f, showInHero: e.target.checked }))} />
                <span className="text-xs text-white/50">Hero'da göster</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-indigo-500" checked={form.showInSection} onChange={e => setForm(f => ({ ...f, showInSection: e.target.checked }))} />
                <span className="text-xs text-white/50">Referanslar section'ında göster</span>
              </label>
            </div>
          </div>

          {msg && <p className={cn("text-xs font-medium", msg.ok ? "text-emerald-400" : "text-red-400")}>{msg.text}</p>}

          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-xl bg-white text-black px-5 py-2 text-xs font-bold hover:bg-white/90 disabled:opacity-50 transition-all">
              {saving ? <Icon icon="carbon:circle-dash" width={13} className="animate-spin" /> : <Icon icon="carbon:checkmark" width={13} />}
              {editing ? "Güncelle" : "Ekle"}
            </button>
            {editing && <button onClick={reset} className="rounded-xl border border-white/[0.08] px-4 py-2 text-xs text-white/40 hover:text-white transition-colors">İptal</button>}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />)}</div>
        ) : servers.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-[#080808] p-10 text-center">
            <p className="text-xs text-white/25">Henüz sunucu yok</p>
          </div>
        ) : (
          <div className="space-y-2">
            {servers.map(s => (
              <div key={s.id} className={cn("flex items-center gap-4 rounded-xl border px-4 py-3 transition-all", s.visible ? "border-white/[0.07] bg-[#0a0a0a]" : "border-white/[0.04] bg-[#070707] opacity-50")}>
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-[#111] overflow-hidden">
                  {s.logoUrl ? <img src={s.logoUrl} alt="" className="h-full w-full object-cover" /> : <span className="text-xs font-bold text-white/30">{s.name.charAt(0)}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white/80 truncate">{s.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {s.showInHero && <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400 border border-indigo-500/20 bg-indigo-500/10 px-1.5 py-0.5 rounded">Hero</span>}
                    {s.showInSection && <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 rounded">Section</span>}
                    <span className="text-[10px] text-white/25">{s.players} oyuncu</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => toggleVisible(s)} className="rounded-lg border border-white/[0.07] px-2.5 py-1 text-[10px] font-bold text-white/35 hover:text-white transition-colors">
                    {s.visible ? "Gizle" : "Göster"}
                  </button>
                  <button onClick={() => openEdit(s)} className="rounded-lg border border-white/[0.07] px-2.5 py-1 text-[10px] font-bold text-white/35 hover:text-indigo-400 hover:border-indigo-500/30 transition-all">
                    Düzenle
                  </button>
                  <button onClick={() => del(s.id)} className="rounded-lg border border-white/[0.07] px-2.5 py-1 text-[10px] font-bold text-white/35 hover:text-red-400 hover:border-red-500/30 transition-all">
                    Sil
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