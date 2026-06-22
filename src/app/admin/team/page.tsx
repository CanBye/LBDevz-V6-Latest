"use client"

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

interface TeamMember { id: string; name: string; role: string; bio: string | null; image: string | null; github: string | null; discord: string | null; twitter: string | null; order: number; visible: boolean }

const inputCls = "w-full rounded-xl border border-white/[0.07] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all"
const emptyForm = { name: "", role: "", bio: "", image: "", github: "", discord: "", twitter: "", order: 0 }

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState<{ ok: boolean; text: string } | null>(null)
  const [editId,  setEditId]  = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [showAdd, setShowAdd] = useState(false)

  const f = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: k === "order" ? Number(e.target.value) : e.target.value }))

  function load() {
    setLoading(true)
    fetch("/api/admin/team").then(r => r.json()).then(d => { setMembers(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  async function save() {
    setSaving(true); setMsg(null)
    const isEdit = editId !== null
    const res = await fetch(isEdit ? `/api/admin/team/${editId}` : "/api/admin/team", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, bio: form.bio || null, image: form.image || null, github: form.github || null, discord: form.discord || null, twitter: form.twitter || null }),
    })
    setSaving(false)
    if (!res.ok) { setMsg({ ok: false, text: (await res.json()).error ?? "Hata" }); return }
    setMsg({ ok: true, text: isEdit ? "Güncellendi" : "Eklendi" })
    setForm(emptyForm); setEditId(null); setShowAdd(false); load()
  }

  async function toggle(m: TeamMember) {
    await fetch(`/api/admin/team/${m.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ visible: !m.visible }) })
    load()
  }

  async function del(id: string) {
    if (!confirm("Üyeyi sil?")) return
    await fetch(`/api/admin/team/${id}`, { method: "DELETE" }); load()
  }

  function startEdit(m: TeamMember) {
    setForm({ name: m.name, role: m.role, bio: m.bio ?? "", image: m.image ?? "", github: m.github ?? "", discord: m.discord ?? "", twitter: m.twitter ?? "", order: m.order })
    setEditId(m.id); setShowAdd(true)
  }

  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white/90">Takım</h1>
          <p className="text-xs text-white/30 mt-0.5 uppercase tracking-widest font-mono">Admin · Team</p>
        </div>
        <button onClick={() => { setShowAdd(s => !s); setEditId(null); setForm(emptyForm) }}
          className="flex items-center gap-2 rounded-xl bg-white text-black px-4 py-2 text-xs font-bold hover:bg-white/90 transition-all">
          <Icon icon="carbon:add" width={14} />
          Üye Ekle
        </button>
      </div>

      {showAdd && (
        <div className="mb-6 rounded-2xl border border-white/[0.07] bg-[#0a0a0a] p-5 space-y-3">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">{editId ? "Üyeyi Düzenle" : "Yeni Üye"}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className={inputCls} placeholder="Ad Soyad *" value={form.name} onChange={f("name")} />
            <input className={inputCls} placeholder="Rol / Unvan *" value={form.role} onChange={f("role")} />
          </div>
          <textarea className={cn(inputCls, "min-h-[70px] resize-none")} placeholder="Kısa biyografi..." value={form.bio} onChange={f("bio")} />
          <input className={inputCls} placeholder="Profil fotoğrafı URL" value={form.image} onChange={f("image")} />
          <div className="grid gap-3 sm:grid-cols-3">
            <input className={inputCls} placeholder="GitHub kullanıcı adı" value={form.github} onChange={f("github")} />
            <input className={inputCls} placeholder="Discord ID" value={form.discord} onChange={f("discord")} />
            <input className={inputCls} placeholder="Twitter/X kullanıcı adı" value={form.twitter} onChange={f("twitter")} />
          </div>
          <input className={cn(inputCls, "w-24")} type="number" placeholder="Sıra" value={form.order} onChange={f("order")} />
          {msg && <p className={cn("text-xs font-medium", msg.ok ? "text-emerald-400" : "text-red-400")}>{msg.text}</p>}
          <div className="flex gap-2">
            <button onClick={save} disabled={saving || !form.name || !form.role}
              className="rounded-xl bg-white text-black px-5 py-2 text-xs font-bold hover:bg-white/90 disabled:opacity-40 transition-all">
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button onClick={() => { setShowAdd(false); setEditId(null) }}
              className="rounded-xl border border-white/[0.07] px-4 py-2 text-xs text-white/40 hover:text-white transition-all">İptal</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-white/[0.03] animate-pulse" />)}</div>
      ) : members.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-[#080808] p-12 text-center text-xs text-white/25">Henüz üye yok</div>
      ) : (
        <div className="space-y-2">
          {members.map(m => (
            <div key={m.id} className={cn("rounded-xl border bg-[#0a0a0a] p-4 flex items-center gap-4 transition-all", m.visible ? "border-white/[0.07]" : "border-white/[0.03] opacity-50")}>
              <div className="h-10 w-10 rounded-full overflow-hidden border border-white/[0.07] bg-[#111] flex items-center justify-center shrink-0">
                {m.image ? <img src={m.image} alt="" className="h-full w-full object-cover" /> : <span className="text-sm font-bold text-white/30">{m.name.charAt(0)}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white/85">{m.name}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-wider">{m.role}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => toggle(m)}
                  className={cn("flex h-7 w-7 items-center justify-center rounded-lg border transition-all",
                    m.visible ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-white/[0.06] text-white/25 hover:text-white/60")}>
                  <Icon icon={m.visible ? "carbon:view" : "carbon:view-off"} width={13} />
                </button>
                <button onClick={() => startEdit(m)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] text-white/30 hover:text-white/70 transition-all">
                  <Icon icon="carbon:edit" width={13} />
                </button>
                <button onClick={() => del(m.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] text-white/30 hover:text-red-400 hover:border-red-500/30 transition-all">
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