"use client"

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

interface TeamServer { name: string; role?: string; period?: string }
interface TeamProject { title: string; description?: string; link?: string; image?: string }
interface PickUser { id: string; name: string | null; username: string | null; email: string; image: string | null; discordId: string | null }
interface TeamMember {
  id: string
  slug: string | null
  name: string
  role: string
  bio: string | null
  longBio: string | null
  image: string | null
  github: string | null
  discord: string | null
  twitter: string | null
  yearsExperience: number | null
  languages: string[]
  servers: TeamServer[]
  projects: TeamProject[]
  order: number
  visible: boolean
}

const inputCls = "w-full rounded-xl border border-white/[0.07] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all"

interface FormState {
  name: string; role: string; bio: string; longBio: string; image: string
  github: string; discord: string; twitter: string; slug: string
  yearsExperience: string; languages: string
  servers: TeamServer[]; projects: TeamProject[]; order: number
}

const emptyForm: FormState = {
  name: "", role: "", bio: "", longBio: "", image: "",
  github: "", discord: "", twitter: "", slug: "",
  yearsExperience: "", languages: "",
  servers: [], projects: [], order: 0,
}

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState<{ ok: boolean; text: string } | null>(null)
  const [editId,  setEditId]  = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [showAdd, setShowAdd] = useState(false)

  // ── Kullanıcı seçici (Discord ile giriş yapanlardan ad/pp/Discord otomatik doldur) ──
  const [userSearch, setUserSearch] = useState("")
  const [userResults, setUserResults] = useState<PickUser[]>([])
  const [userSearching, setUserSearching] = useState(false)
  const [discordOnly, setDiscordOnly] = useState(true)

  const f = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: k === "order" ? Number(e.target.value) : e.target.value }))

  function load() {
    setLoading(true)
    fetch("/api/admin/team").then(r => r.json()).then(d => { setMembers(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  // Kullanıcı araması (debounce'lu)
  useEffect(() => {
    if (!showAdd) return
    const t = setTimeout(() => {
      setUserSearching(true)
      const params = new URLSearchParams()
      if (userSearch.trim()) params.set("q", userSearch.trim())
      if (discordOnly) params.set("discordOnly", "1")
      fetch(`/api/admin/team/users?${params}`)
        .then(r => r.json())
        .then(d => setUserResults(Array.isArray(d) ? d : []))
        .catch(() => setUserResults([]))
        .finally(() => setUserSearching(false))
    }, 300)
    return () => clearTimeout(t)
  }, [userSearch, discordOnly, showAdd])

  // Seçilen kullanıcının ad / profil fotoğrafı / Discord bilgisini forma doldur.
  function pickUser(u: PickUser) {
    setForm(p => ({
      ...p,
      name: u.name || u.username || p.name,
      image: u.image || p.image,
      discord: u.discordId || p.discord,
      slug: p.slug || "", // slug boşsa backend ad'dan üretir
    }))
    setUserSearch("")
    setUserResults([])
  }

  // ── Servers (repeatable) ──
  const addServer = () => setForm(p => ({ ...p, servers: [...p.servers, { name: "", role: "", period: "" }] }))
  const setServer = (i: number, k: keyof TeamServer, v: string) =>
    setForm(p => ({ ...p, servers: p.servers.map((s, idx) => idx === i ? { ...s, [k]: v } : s) }))
  const delServer = (i: number) => setForm(p => ({ ...p, servers: p.servers.filter((_, idx) => idx !== i) }))

  // ── Projects (repeatable) ──
  const addProject = () => setForm(p => ({ ...p, projects: [...p.projects, { title: "", description: "", link: "", image: "" }] }))
  const setProject = (i: number, k: keyof TeamProject, v: string) =>
    setForm(p => ({ ...p, projects: p.projects.map((pr, idx) => idx === i ? { ...pr, [k]: v } : pr) }))
  const delProject = (i: number) => setForm(p => ({ ...p, projects: p.projects.filter((_, idx) => idx !== i) }))

  async function save() {
    setSaving(true); setMsg(null)
    const isEdit = editId !== null
    const payload = {
      name: form.name,
      role: form.role,
      slug: form.slug || undefined,
      bio: form.bio || null,
      longBio: form.longBio || null,
      image: form.image || null,
      github: form.github || null,
      discord: form.discord || null,
      twitter: form.twitter || null,
      yearsExperience: form.yearsExperience === "" ? null : Number(form.yearsExperience),
      languages: form.languages.split(",").map(s => s.trim()).filter(Boolean),
      servers: form.servers.filter(s => s.name.trim()),
      projects: form.projects.filter(p => p.title.trim()),
      order: form.order,
    }
    const res = await fetch(isEdit ? `/api/admin/team/${editId}` : "/api/admin/team", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
    setForm({
      name: m.name, role: m.role, bio: m.bio ?? "", longBio: m.longBio ?? "", image: m.image ?? "",
      github: m.github ?? "", discord: m.discord ?? "", twitter: m.twitter ?? "", slug: m.slug ?? "",
      yearsExperience: m.yearsExperience != null ? String(m.yearsExperience) : "",
      languages: (m.languages ?? []).join(", "),
      servers: m.servers ?? [], projects: m.projects ?? [], order: m.order,
    })
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
        <div className="mb-6 rounded-2xl border border-white/[0.07] bg-[#0a0a0a] p-5 space-y-4">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">{editId ? "Üyeyi Düzenle" : "Yeni Üye"}</p>

          {/* Kayıtlı kullanıcıdan seç (opsiyonel) — ad/pp/Discord otomatik doldurur */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.04] p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-300/80 uppercase tracking-wider">
                <Icon icon="carbon:user-follow" width={13} />
                Kayıtlı kullanıcıdan seç (opsiyonel)
              </p>
              <label className="flex items-center gap-1.5 text-[10px] text-white/40 cursor-pointer select-none">
                <input type="checkbox" checked={discordOnly} onChange={e => setDiscordOnly(e.target.checked)} className="accent-indigo-500" />
                Sadece Discord&apos;lular
              </label>
            </div>
            <input
              className={inputCls}
              placeholder="Kullanıcı ara (ad, email, kullanıcı adı)..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
            />
            {(userSearch || userResults.length > 0) && (
              <div className="max-h-52 overflow-y-auto rounded-lg border border-white/[0.06] bg-[#0d0d0d]">
                {userSearching ? (
                  <p className="px-3 py-2 text-[11px] text-white/30">Aranıyor...</p>
                ) : userResults.length === 0 ? (
                  <p className="px-3 py-2 text-[11px] text-white/30">Kullanıcı bulunamadı.</p>
                ) : userResults.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => pickUser(u)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-white/[0.04]"
                  >
                    <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full border border-white/[0.08] bg-[#111] flex items-center justify-center">
                      {u.image ? <img src={u.image} alt="" className="h-full w-full object-cover" /> : <span className="text-[10px] text-white/30">{(u.name ?? u.email).charAt(0)}</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-white/80">{u.name ?? u.username ?? u.email}</p>
                      <p className="truncate text-[10px] text-white/30">{u.email}{u.discordId ? " · Discord" : ""}</p>
                    </div>
                    <Icon icon="carbon:add" width={14} className="shrink-0 text-indigo-300/60" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Temel bilgiler */}
          <div className="grid gap-3 sm:grid-cols-2">
            <input className={inputCls} placeholder="Ad Soyad *" value={form.name} onChange={f("name")} />
            <input className={inputCls} placeholder="Rol / Unvan *" value={form.role} onChange={f("role")} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className={inputCls} placeholder="Profil URL (slug) — boş bırak otomatik" value={form.slug} onChange={f("slug")} />
            <input className={inputCls} type="number" placeholder="Tecrübe (yıl)" value={form.yearsExperience} onChange={f("yearsExperience")} />
          </div>
          <textarea className={cn(inputCls, "min-h-[60px] resize-none")} placeholder="Kısa biyografi (kartta görünür)..." value={form.bio} onChange={f("bio")} />
          <textarea className={cn(inputCls, "min-h-[90px] resize-none")} placeholder="Uzun biyografi / hakkında (profil sayfasında, HTML destekli)..." value={form.longBio} onChange={f("longBio")} />
          <input className={inputCls} placeholder="Profil fotoğrafı URL" value={form.image} onChange={f("image")} />
          <input className={inputCls} placeholder="Bildiği diller / teknolojiler (virgülle: Java, React, Go)" value={form.languages} onChange={f("languages")} />

          <div className="grid gap-3 sm:grid-cols-3">
            <input className={inputCls} placeholder="GitHub kullanıcı adı" value={form.github} onChange={f("github")} />
            <input className={inputCls} placeholder="Discord ID" value={form.discord} onChange={f("discord")} />
            <input className={inputCls} placeholder="Twitter/X kullanıcı adı" value={form.twitter} onChange={f("twitter")} />
          </div>

          {/* Sunucular */}
          <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Yetkili Olduğu Sunucular</p>
              <button onClick={addServer} type="button" className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300">
                <Icon icon="carbon:add" width={12} /> Ekle
              </button>
            </div>
            {form.servers.length === 0 && <p className="text-[10px] text-white/20">Henüz sunucu eklenmedi.</p>}
            {form.servers.map((s, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_0.7fr_auto]">
                <input className={inputCls} placeholder="Sunucu adı" value={s.name} onChange={e => setServer(i, "name", e.target.value)} />
                <input className={inputCls} placeholder="Rol (ör. Admin)" value={s.role ?? ""} onChange={e => setServer(i, "role", e.target.value)} />
                <input className={inputCls} placeholder="Dönem (2022-2024)" value={s.period ?? ""} onChange={e => setServer(i, "period", e.target.value)} />
                <button onClick={() => delServer(i)} type="button" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] text-white/30 hover:text-red-400">
                  <Icon icon="carbon:trash-can" width={13} />
                </button>
              </div>
            ))}
          </div>

          {/* Projeler */}
          <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Yaptığı Projeler</p>
              <button onClick={addProject} type="button" className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300">
                <Icon icon="carbon:add" width={12} /> Ekle
              </button>
            </div>
            {form.projects.length === 0 && <p className="text-[10px] text-white/20">Henüz proje eklenmedi.</p>}
            {form.projects.map((p, i) => (
              <div key={i} className="space-y-2 rounded-lg border border-white/[0.05] p-2.5">
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <input className={inputCls} placeholder="Proje başlığı" value={p.title} onChange={e => setProject(i, "title", e.target.value)} />
                  <button onClick={() => delProject(i)} type="button" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] text-white/30 hover:text-red-400">
                    <Icon icon="carbon:trash-can" width={13} />
                  </button>
                </div>
                <textarea className={cn(inputCls, "min-h-[50px] resize-none")} placeholder="Açıklama" value={p.description ?? ""} onChange={e => setProject(i, "description", e.target.value)} />
                <div className="grid gap-2 sm:grid-cols-2">
                  <input className={inputCls} placeholder="Link (https://...)" value={p.link ?? ""} onChange={e => setProject(i, "link", e.target.value)} />
                  <input className={inputCls} placeholder="Görsel URL" value={p.image ?? ""} onChange={e => setProject(i, "image", e.target.value)} />
                </div>
              </div>
            ))}
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
                <p className="text-[10px] text-white/30 uppercase tracking-wider">{m.role}{m.slug ? ` · /ekip/${m.slug}` : ""}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {m.slug && (
                  <a href={`/ekip/${m.slug}`} target="_blank" rel="noopener noreferrer"
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] text-white/30 hover:text-white/70 transition-all">
                    <Icon icon="carbon:launch" width={13} />
                  </a>
                )}
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
