"use client"

import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions"

import { AdminGuard } from "@/components/admin/admin-guard"

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

interface Role { id: string; name: string; color: string; priority: number; createdAt: string }
interface Customer { id: string; name: string | null; email: string; username: string | null }
interface PermissionRow { key: string; description: string; assigned: boolean }

const inputCls = "w-full rounded-xl border border-white/[0.07] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all"

// Group permissions by their prefix
const PERM_GROUPS: Record<string, string[]> = {
  "Temel": ["admin.dashboard", "admin.orders", "admin.products", "admin.customers", "admin.topups", "products.publish"],
  "Destek": ["admin.tickets", "admin.yetkilialim", "admin.coupons"],
  "Site": ["admin.agreements", "admin.reviews", "admin.team", "admin.blog", "admin.forum", "admin.site_settings", "admin.webhooks", "admin.notifications"],
  "Analitik": ["admin.analytics", "admin.revenue"],
  "Yönetim": ["admin.roles", "admin.settings"],
}

const PERM_LABELS: Record<string, string> = {
  // admin.* — panel sayfaları
  "admin.dashboard":        "Ana Panel",
  "admin.orders":           "Siparişler",
  "admin.products":         "Ürünler",
  "admin.customers":        "Müşteriler",
  "admin.topups":           "Kredi Talepleri",
  "admin.tickets":          "Destek Talepleri",
  "admin.yetkilialim":      "Yetkili Alım",
  "admin.coupons":          "Kuponlar",
  "admin.agreements":       "Sözleşmeler",
  "admin.reviews":          "Yorumlar",
  "admin.team":             "Ekip Yönetimi",
  "admin.blog":             "Blog",
  "admin.forum":            "Forum",
  "admin.site_settings":    "Site Ayarları",
  "admin.webhooks":         "Webhooklar",
  "admin.notifications":    "Bildirimler",
  "admin.analytics":        "Analizler",
  "admin.revenue":          "Gelir Raporu",
  "admin.roles":            "Rol Yönetimi",
  "admin.settings":         "Panel Ayarları",
  // granüler izinler
  "affiliates.manage":      "Affiliate Yönetimi",
  "announcements.publish":  "Duyuru Yayınlama",
  "coupons.manage":         "Kupon Yönetimi",
  "credits.adjust":         "Kredi Düzenleme",
  "credits.view":           "Kredi Görüntüleme",
  "discounts.manage":       "İndirim Yönetimi",
  "licenses.extend":        "Lisans Uzatma",
  "licenses.issue":         "Lisans Oluşturma",
  "licenses.revoke":        "Lisans İptal",
  "licenses.view":          "Lisans Görüntüleme",
  "logs.view":              "Log Görüntüleme",
  "products.create":        "Ürün Oluşturma",
  "products.delete":        "Ürün Silme",
  "products.edit":          "Ürün Düzenleme",
  "products.obfuscate":     "Kod Gizleme",
  "products.publish":       "Ürün Onaylama / Yayınlama",
  "roles.manage":           "Rol Yönetimi",
  "tickets.assign":         "Talep Atama",
  "tickets.close":          "Talep Kapatma",
  "tickets.delete":         "Talep Silme",
  "tickets.internal_note":  "Dahili Not",
  "tickets.reply":          "Talep Yanıtlama",
  "tickets.view":           "Talep Görüntüleme",
  "topups.approve":         "Kredi Onaylama",
  "users.manage":           "Kullanıcı Yönetimi",
  "users.view":             "Kullanıcı Görüntüleme",
  "webhooks.manage":        "Webhook Yönetimi",
}

export default function AdminRolesPage() {
  const [roles,     setRoles]     = useState<Role[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [msg,       setMsg]       = useState<{ ok: boolean; text: string } | null>(null)
  const [form,      setForm]      = useState({ name: "", color: "#6366f1", priority: 0 })
  const [showAdd,   setShowAdd]   = useState(false)
  const [assignForm, setAssignForm] = useState({ userId: "", roleId: "" })
  const [assigning,  setAssigning]  = useState(false)

  // Permission editing
  const [selectedRole,  setSelectedRole]  = useState<Role | null>(null)
  const [rolePerms,     setRolePerms]     = useState<PermissionRow[]>([])
  const [permLoading,   setPermLoading]   = useState(false)
  const [permSaving,    setPermSaving]    = useState(false)

  function load() {
    setLoading(true)
    Promise.all([
      fetch("/api/admin/roles").then(r => r.json()),
      fetch("/api/admin/customers").then(r => r.json()),
    ]).then(([r, c]) => {
      setRoles(Array.isArray(r) ? r : [])
      setCustomers(Array.isArray(c) ? c : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function createRole() {
    setSaving(true); setMsg(null)
    const res = await fetch("/api/admin/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setMsg({ ok: false, text: data.error ?? "Hata" }); return }
    setMsg({ ok: true, text: "Rol oluşturuldu" })
    setForm({ name: "", color: "#6366f1", priority: 0 }); setShowAdd(false); load()
  }

  async function deleteRole(id: string) {
    if (!confirm("Rolü sil?")) return
    await fetch(`/api/admin/roles/${id}`, { method: "DELETE" })
    if (selectedRole?.id === id) setSelectedRole(null)
    load()
  }

  async function assignRole() {
    if (!assignForm.userId || !assignForm.roleId) return
    setAssigning(true); setMsg(null)
    const res = await fetch("/api/admin/roles/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: assignForm.userId, roleId: assignForm.roleId }),
    })
    const data = await res.json()
    setAssigning(false)
    setMsg({ ok: res.ok, text: res.ok ? "Rol atandı" : data.error ?? "Hata" })
  }

  async function openPermissions(role: Role) {
    setSelectedRole(role)
    setPermLoading(true)
    const res = await fetch(`/api/admin/roles/${role.id}/permissions`)
    const data = await res.json()
    setRolePerms(Array.isArray(data) ? data : [])
    setPermLoading(false)
  }

  function togglePerm(key: string) {
    setRolePerms(prev =>
      prev.map(p => p.key === key ? { ...p, assigned: !p.assigned } : p)
    )
  }

  function toggleGroup(keys: string[], assign: boolean) {
    setRolePerms(prev =>
      prev.map(p => keys.includes(p.key) ? { ...p, assigned: assign } : p)
    )
  }

  async function savePermissions() {
    if (!selectedRole) return
    setPermSaving(true)
    const keys = rolePerms.filter(p => p.assigned).map(p => p.key)
    const res = await fetch(`/api/admin/roles/${selectedRole.id}/permissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keys }),
    })
    setPermSaving(false)
    setMsg({ ok: res.ok, text: res.ok ? "İzinler kaydedildi" : "Hata oluştu" })
  }

  return (
    <AdminGuard permission={ADMIN_PERMISSIONS.ROLES}>
      <div className="p-6 sm:p-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white/90">Rol Yönetimi</h1>
          <p className="text-xs text-white/30 mt-0.5 uppercase tracking-widest font-mono">Admin · Roles</p>
        </div>

        {msg && (
          <div className={cn("mb-4 rounded-xl border px-4 py-2.5 text-xs font-medium", msg.ok ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400" : "border-red-500/20 bg-red-500/[0.06] text-red-400")}>
            {msg.text}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* ── Col 1: Role list ── */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Roller</p>
              <button onClick={() => setShowAdd(s => !s)} className="text-[10px] text-white/40 hover:text-white transition-colors flex items-center gap-1">
                <Icon icon="carbon:add" width={11} /> Rol Ekle
              </button>
            </div>

            {showAdd && (
              <div className="mb-3 rounded-xl border border-white/[0.07] bg-[#0a0a0a] p-4 space-y-3">
                <input className={inputCls} placeholder="Rol adı" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="text-xs text-white/40 whitespace-nowrap">Renk:</label>
                  <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                    className="h-9 w-12 cursor-pointer rounded-lg border border-white/[0.07] bg-transparent" />
                  <span className="font-mono text-xs text-white/40">{form.color}</span>
                  <label className="text-xs text-white/40 ml-2 whitespace-nowrap">Öncelik:</label>
                  <input type="number" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: Number(e.target.value) }))}
                    className="w-16 rounded-lg border border-white/[0.07] bg-[#0d0d0d] px-2 py-1.5 text-xs text-white outline-none" />
                </div>
                <button onClick={createRole} disabled={saving || !form.name}
                  className="w-full rounded-xl bg-white text-black py-2 text-xs font-bold hover:bg-white/90 disabled:opacity-40 transition-all">
                  {saving ? "..." : "Oluştur"}
                </button>
              </div>
            )}

            {loading ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-10 rounded-xl bg-white/[0.03] animate-pulse" />)}</div>
            ) : roles.length === 0 ? (
              <div className="rounded-xl border border-white/[0.06] bg-[#080808] p-8 text-center text-xs text-white/25">Henüz rol yok</div>
            ) : (
              <div className="space-y-1.5">
                {roles.sort((a, b) => b.priority - a.priority).map(r => (
                  <div key={r.id}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-2.5 cursor-pointer transition-all",
                      selectedRole?.id === r.id
                        ? "border-white/20 bg-white/[0.04]"
                        : "border-white/[0.06] bg-[#0a0a0a] hover:border-white/10"
                    )}
                    onClick={() => openPermissions(r)}
                  >
                    <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                    <span className="flex-1 text-sm font-semibold text-white/80">{r.name}</span>
                    <span className="text-[10px] text-white/25 font-mono">p:{r.priority}</span>
                    <button
                      onClick={e => { e.stopPropagation(); deleteRole(r.id) }}
                      className="text-white/20 hover:text-red-400 transition-colors"
                    >
                      <Icon icon="carbon:trash-can" width={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Assign role */}
            <div className="mt-6">
              <p className="mb-3 text-[10px] font-bold text-white/30 uppercase tracking-wider">Rol Ata</p>
              <div className="rounded-xl border border-white/[0.07] bg-[#0a0a0a] p-4 space-y-3">
                <select className={inputCls} value={assignForm.userId} onChange={e => setAssignForm(p => ({ ...p, userId: e.target.value }))}>
                  <option value="" className="bg-[#111]">Kullanıcı seç...</option>
                  {customers.map(c => <option key={c.id} value={c.id} className="bg-[#111]">{c.name ?? c.username ?? c.email}</option>)}
                </select>
                <select className={inputCls} value={assignForm.roleId} onChange={e => setAssignForm(p => ({ ...p, roleId: e.target.value }))}>
                  <option value="" className="bg-[#111]">Rol seç...</option>
                  {roles.map(r => <option key={r.id} value={r.id} className="bg-[#111]">{r.name}</option>)}
                </select>
                <button onClick={assignRole} disabled={assigning || !assignForm.userId || !assignForm.roleId}
                  className="w-full rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 py-2.5 text-xs font-bold hover:bg-indigo-500/30 disabled:opacity-40 transition-all">
                  {assigning ? "Atanıyor..." : "Rol Ata"}
                </button>
              </div>
            </div>
          </div>

          {/* ── Col 2+3: Permission editor ── */}
          <div className="lg:col-span-2">
            {!selectedRole ? (
              <div className="flex h-full min-h-[300px] items-center justify-center rounded-2xl border border-white/[0.06] bg-[#080808]">
                <div className="text-center">
                  <Icon icon="carbon:user-role" className="mx-auto text-white/10 mb-3" width={36} />
                  <p className="text-sm text-white/25">Düzenlemek için sol taraftan bir rol seç</p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/[0.07] bg-[#090909] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedRole.color }} />
                    <p className="text-sm font-bold text-white/90">{selectedRole.name}</p>
                    <span className="text-[10px] text-white/30 uppercase tracking-widest">İzinler</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleGroup(rolePerms.map(p => p.key), true)}
                      className="text-[10px] text-white/30 hover:text-white transition-colors px-2 py-1 rounded-lg border border-white/[0.05] hover:border-white/10"
                    >
                      Tümünü Seç
                    </button>
                    <button
                      onClick={() => toggleGroup(rolePerms.map(p => p.key), false)}
                      className="text-[10px] text-white/30 hover:text-white transition-colors px-2 py-1 rounded-lg border border-white/[0.05] hover:border-white/10"
                    >
                      Tümünü Kaldır
                    </button>
                  </div>
                </div>

                {permLoading ? (
                  <div className="p-6 space-y-3">
                    {[1,2,3,4].map(i => <div key={i} className="h-8 rounded-lg bg-white/[0.03] animate-pulse" />)}
                  </div>
                ) : (
                  <div className="p-5 space-y-6">
                    {(() => {
                      // Build groups: predefined ones + "Diğer" for any unmatched keys from DB
                      const mappedKeys = new Set(Object.values(PERM_GROUPS).flat())
                      const ungrouped = rolePerms.filter(p => !mappedKeys.has(p.key))

                      const allGroups: Record<string, PermissionRow[]> = {}
                      for (const [groupName, keys] of Object.entries(PERM_GROUPS)) {
                        const perms = rolePerms.filter(p => keys.includes(p.key))
                        if (perms.length > 0) allGroups[groupName] = perms
                      }
                      if (ungrouped.length > 0) allGroups["Diğer"] = ungrouped

                      return Object.entries(allGroups).map(([groupName, groupPerms]) => {
                        const groupKeys = groupPerms.map(p => p.key)
                        const allChecked = groupPerms.every(p => p.assigned)
                        const noneChecked = groupPerms.every(p => !p.assigned)

                        return (
                          <div key={groupName}>
                            <div className="flex items-center justify-between mb-2.5">
                              <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">{groupName}</p>
                              <button
                                onClick={() => toggleGroup(groupKeys, !allChecked)}
                                className={cn(
                                  "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md transition-all",
                                  allChecked
                                    ? "text-emerald-400 bg-emerald-500/10"
                                    : noneChecked
                                    ? "text-white/25 hover:text-white/50"
                                    : "text-amber-400 bg-amber-500/10"
                                )}
                              >
                                {allChecked ? "Tümü Açık" : noneChecked ? "Tümü Kapalı" : "Kısmi"}
                              </button>
                            </div>

                            <div className="grid gap-1.5 sm:grid-cols-2">
                              {groupPerms.map(perm => (
                                <button
                                  key={perm.key}
                                  onClick={() => togglePerm(perm.key)}
                                  className={cn(
                                    "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all",
                                    perm.assigned
                                      ? "border-emerald-500/25 bg-emerald-500/[0.06] text-emerald-300"
                                      : "border-white/[0.05] bg-[#0a0a0a] text-white/35 hover:border-white/10 hover:text-white/60"
                                  )}
                                >
                                  <div className={cn(
                                    "flex size-4 shrink-0 items-center justify-center rounded border transition-all",
                                    perm.assigned ? "border-emerald-500/50 bg-emerald-500/20" : "border-white/10"
                                  )}>
                                    {perm.assigned && <Icon icon="carbon:checkmark" width={10} className="text-emerald-400" />}
                                  </div>
                                  <span className="flex-1 flex items-center gap-1.5 text-xs font-medium min-w-0">
                                    <span className="truncate">{PERM_LABELS[perm.key] ?? perm.key}</span>
                                    <span
                                      title={perm.key}
                                      onClick={e => e.stopPropagation()}
                                      className="shrink-0 group/tip relative"
                                    >
                                      <Icon icon="carbon:information" width={11} className="opacity-30 hover:opacity-70 transition-opacity cursor-default" />
                                      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/tip:block whitespace-nowrap rounded-md bg-[#1a1a1a] border border-white/10 px-2 py-1 text-[10px] font-mono text-white/60 shadow-xl z-50">
                                        {perm.key}
                                      </span>
                                    </span>
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                )}

                {/* Footer */}
                <div className="border-t border-white/[0.05] px-5 py-3.5 flex items-center justify-between">
                  <p className="text-[10px] text-white/25">
                    {rolePerms.filter(p => p.assigned).length} / {rolePerms.length} izin aktif
                  </p>
                  <button
                    onClick={savePermissions}
                    disabled={permSaving || permLoading}
                    className="flex items-center gap-2 rounded-xl bg-white text-black px-4 py-2 text-xs font-bold hover:bg-white/90 disabled:opacity-40 transition-all"
                  >
                    <Icon icon="carbon:save" width={13} />
                    {permSaving ? "Kaydediliyor..." : "İzinleri Kaydet"}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
      </AdminGuard>
  )
}