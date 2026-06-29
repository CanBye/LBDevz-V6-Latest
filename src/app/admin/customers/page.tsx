"use client"

import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions"

import { AdminGuard } from "@/components/admin/admin-guard"

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

interface Role { id: string; name: string; color: string; priority: number }

interface Customer {
  id: string
  name: string | null
  username: string | null
  email: string
  image: string | null
  balance: number
  licenseCount: number
  createdAt: string
  roles: Role[]
}

interface Product { id: string; name: string }

const inputCls = "w-full rounded-xl border border-white/[0.07] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all"

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products,  setProducts]  = useState<Product[]>([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState("")
  const [selected,  setSelected]  = useState<Customer | null>(null)
  const [detail,    setDetail]    = useState<any>(null)
  const [detailLoad,setDetailLoad]= useState(false)

  // Action state
  const [actionLoad, setActionLoad] = useState(false)
  const [actionMsg,  setActionMsg]  = useState<{ ok: boolean; text: string } | null>(null)

  // Form values
  const [balAmount,  setBalAmount]  = useState("")
  const [balNote,    setBalNote]    = useState("")
  const [grantProd,  setGrantProd]  = useState("")
  const [grantSeats, setGrantSeats] = useState("1")
  const [grantProds, setGrantProds] = useState<string[]>([])
  const [bulkLicMsg, setBulkLicMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [bulkLicLoad,setBulkLicLoad]= useState(false)
  const [ipLicId,    setIpLicId]    = useState("")
  const [ipSlots,    setIpSlots]    = useState("1")

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/customers").then(r => r.json()),
      fetch("/api/admin/products").then(r => r.json()),
    ]).then(([c, p]) => {
      setCustomers(Array.isArray(c) ? c : [])
      setProducts(Array.isArray(p) ? p : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  function openUser(c: Customer) {
    setSelected(c)
    setDetail(null)
    setActionMsg(null)
    setDetailLoad(true)
    fetch(`/api/admin/customers/${c.id}`)
      .then(r => r.json())
      .then(d => { setDetail(d); setDetailLoad(false) })
      .catch(() => setDetailLoad(false))
  }

  async function doAction(action: string, extra: Record<string, unknown>) {
    if (!selected) return
    setActionLoad(true); setActionMsg(null)
    const res = await fetch(`/api/admin/customers/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    })
    const data = await res.json()
    setActionLoad(false)
    if (!res.ok) { setActionMsg({ ok: false, text: data.error ?? "Hata" }); return }
    setActionMsg({ ok: true, text: action === "addBalance" ? `+${extra.amount} ₺ eklendi` : action === "grantLicense" ? `Lisans verildi: ${data.licenseKey}` : action === "addIpSlots" ? `IP slotu güncellendi` : "İşlem başarılı" })
    // Refresh detail
    fetch(`/api/admin/customers/${selected.id}`).then(r => r.json()).then(setDetail).catch(() => {})
    // Refresh customer list
    fetch("/api/admin/customers").then(r => r.json()).then(d => setCustomers(Array.isArray(d) ? d : [])).catch(() => {})
  }

  async function handleBulkLicense() {
    if (!selected || grantProds.length === 0) return
    setBulkLicLoad(true); setBulkLicMsg(null)
    const res = await fetch(`/api/admin/customers/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "grantLicenseBulk", productIds: grantProds, seatLimit: grantSeats ? Number(grantSeats) : undefined }),
    })
    const data = await res.json()
    setBulkLicLoad(false)
    if (!res.ok) { setBulkLicMsg({ ok: false, text: data.error ?? "Hata" }); return }
    setBulkLicMsg({ ok: true, text: `${data.count} lisans tanımlandı` })
    setGrantProds([])
    fetch(`/api/admin/customers/${selected.id}`).then(r => r.json()).then(setDetail).catch(() => {})
    fetch("/api/admin/customers").then(r => r.json()).then(d => setCustomers(Array.isArray(d) ? d : [])).catch(() => {})
  }

    const filtered = customers.filter(c =>
    (c.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.username ?? "").toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminGuard permission={ADMIN_PERMISSIONS.CUSTOMERS}>
      <div className="p-6 sm:p-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white/90">Müşteriler</h1>
          <p className="text-xs text-white/30 mt-0.5 uppercase tracking-widest font-mono">Admin · Customers</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-5 items-start">
          {/* ── Customer list ── */}
          <div className="xl:col-span-2 space-y-3">
            <input
              className={inputCls}
              placeholder="Ad, kullanıcı adı veya e-posta..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            {loading ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-white/[0.06] bg-[#080808] p-8 text-center text-xs text-white/25">Kullanıcı bulunamadı</div>
            ) : (
              <div className="space-y-1.5">
                {filtered.map(c => (
                  <button
                    key={c.id}
                    onClick={() => openUser(c)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                      selected?.id === c.id
                        ? "border-indigo-500/30 bg-indigo-500/10"
                        : "border-white/[0.06] bg-[#0a0a0a] hover:bg-white/[0.03]"
                    )}
                  >
                    <div className="h-8 w-8 rounded-full bg-[#1a1a1a] border border-white/[0.07] overflow-hidden flex items-center justify-center shrink-0">
                      {c.image ? <img src={c.image} alt="" className="h-full w-full object-cover" /> : <Icon icon="carbon:user-filled" className="text-white/30" width={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-semibold text-white/85 truncate">{c.name ?? c.username ?? c.email}</p>
                        {c.roles?.slice(0, 2).map(r => (
                          <span key={r.id} className="rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border"
                            style={{ color: r.color, borderColor: r.color + "40", background: r.color + "15" }}>
                            {r.name}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-white/30 truncate">{c.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-emerald-400">{Number(c.balance).toLocaleString("tr-TR")} ₺</p>
                      <p className="text-[10px] text-white/25">{c.licenseCount} lisans</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Detail panel ── */}
          <div className="xl:col-span-3 space-y-4">
            {!selected ? (
              <div className="rounded-2xl border border-white/[0.06] bg-[#080808] p-16 text-center">
                <Icon icon="carbon:user-profile" className="text-white/10 mx-auto" width={36} />
                <p className="mt-3 text-xs text-white/25">Sol taraftan müşteri seç</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="rounded-xl border border-white/[0.07] bg-[#0a0a0a] p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#1a1a1a] border border-white/[0.07] overflow-hidden flex items-center justify-center shrink-0">
                    {selected.image ? <img src={selected.image} alt="" className="h-full w-full object-cover" /> : <Icon icon="carbon:user-filled" className="text-white/30" width={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-white/90">{selected.name ?? selected.username ?? "—"}</p>
                      {selected.roles?.map(r => (
                        <span key={r.id} className="rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border"
                          style={{ color: r.color, borderColor: r.color + "40", background: r.color + "15" }}>
                          {r.name}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-white/35">{selected.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-400">{detail?.balance?.toLocaleString("tr-TR") ?? selected.balance.toLocaleString("tr-TR")} ₺</p>
                    <p className="text-[10px] text-white/30">Bakiye</p>
                  </div>
                </div>

                {actionMsg && (
                  <div className={cn("rounded-xl border px-4 py-2.5 text-xs font-medium", actionMsg.ok ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400" : "border-red-500/20 bg-red-500/[0.06] text-red-400")}>
                    {actionMsg.text}
                  </div>
                )}

                {/* Actions grid */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Add balance */}
                  <div className="rounded-xl border border-white/[0.07] bg-[#0a0a0a] p-4 space-y-3">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Bakiye Ekle</p>
                    <input className={inputCls} type="number" min="1" placeholder="Miktar (₺)" value={balAmount} onChange={e => setBalAmount(e.target.value)} />
                    <input className={inputCls} placeholder="Not (isteğe bağlı)" value={balNote} onChange={e => setBalNote(e.target.value)} />
                    <button
                      onClick={() => doAction("addBalance", { amount: Number(balAmount), note: balNote || undefined })}
                      disabled={actionLoad || !balAmount}
                      className="w-full rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 py-2 text-xs font-bold hover:bg-emerald-500/30 transition-all disabled:opacity-40"
                    >
                      {actionLoad ? "..." : "Bakiye Ekle"}
                    </button>
                  </div>

                  {/* Grant license — multi-product */}
                  <div className="rounded-xl border border-white/[0.07] bg-[#0a0a0a] p-4 space-y-3 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Lisans Ver</p>
                      <span className="text-[10px] text-white/20">{grantProds.length} seçili</span>
                    </div>
                    <div className="max-h-36 overflow-y-auto rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-2 space-y-0.5">
                      {products.map(p => (
                        <label key={p.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] cursor-pointer">
                          <input
                            type="checkbox"
                            className="accent-indigo-500"
                            checked={grantProds.includes(p.id)}
                            onChange={e => setGrantProds(prev => e.target.checked ? [...prev, p.id] : prev.filter(x => x !== p.id))}
                          />
                          <span className="text-xs text-white/60">{p.name}</span>
                        </label>
                      ))}
                      {products.length === 0 && <p className="text-xs text-white/20 px-2 py-1">Ürün yok</p>}
                    </div>
                    <div className="flex gap-2 items-center">
                      <label className="text-[10px] text-white/30 whitespace-nowrap">IP Limiti:</label>
                      <input className={cn(inputCls, "flex-1")} type="number" min="1" max="99" value={grantSeats} onChange={e => setGrantSeats(e.target.value)} />
                    </div>
                    {bulkLicMsg && (
                      <p className={cn("text-xs font-medium", bulkLicMsg.ok ? "text-emerald-400" : "text-red-400")}>{bulkLicMsg.text}</p>
                    )}
                    <button
                      onClick={handleBulkLicense}
                      disabled={bulkLicLoad || grantProds.length === 0}
                      className="w-full rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 py-2 text-xs font-bold hover:bg-indigo-500/30 transition-all disabled:opacity-40"
                    >
                      {bulkLicLoad ? "..." : grantProds.length > 0 ? `${grantProds.length} Ürüne Lisans Ver` : "Ürün Seç"}
                    </button>
                  </div>

                  {/* Add IP slots */}
                  <div className="rounded-xl border border-white/[0.07] bg-[#0a0a0a] p-4 space-y-3">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">IP Slotu Ekle</p>
                    {detailLoad ? (
                      <div className="h-9 rounded-xl bg-white/[0.04] animate-pulse" />
                    ) : (
                      <select className={inputCls} value={ipLicId} onChange={e => setIpLicId(e.target.value)}>
                        <option value="" className="bg-[#111]">Lisans seç...</option>
                        {(detail?.licenses ?? []).map((l: any) => (
                          <option key={l.license.id} value={l.license.id} className="bg-[#111]">
                            {l.product?.name ?? "?"} — {l.license.licenseKey.slice(0, 16)}... (şu an: {l.license.seatLimit})
                          </option>
                        ))}
                      </select>
                    )}
                    <input className={inputCls} type="number" min="1" max="20" placeholder="Eklenecek slot" value={ipSlots} onChange={e => setIpSlots(e.target.value)} />
                    <button
                      onClick={() => doAction("addIpSlots", { licenseId: ipLicId, slots: Number(ipSlots) })}
                      disabled={actionLoad || !ipLicId}
                      className="w-full rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 py-2 text-xs font-bold hover:bg-amber-500/30 transition-all disabled:opacity-40"
                    >
                      {actionLoad ? "..." : "Slot Ekle"}
                    </button>
                  </div>

                  {/* Revoke license */}
                  <div className="rounded-xl border border-white/[0.07] bg-[#0a0a0a] p-4 space-y-3">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Lisans İptal Et</p>
                    {detailLoad ? (
                      <div className="h-9 rounded-xl bg-white/[0.04] animate-pulse" />
                    ) : (
                      <select className={inputCls} value={ipLicId} onChange={e => setIpLicId(e.target.value)}>
                        <option value="" className="bg-[#111]">Lisans seç...</option>
                        {(detail?.licenses ?? []).filter((l: any) => l.license.status === "active").map((l: any) => (
                          <option key={l.license.id} value={l.license.id} className="bg-[#111]">
                            {l.product?.name ?? "?"} — {l.license.licenseKey.slice(0, 16)}...
                          </option>
                        ))}
                      </select>
                    )}
                    <button
                      onClick={() => doAction("revokeLicense", { licenseId: ipLicId })}
                      disabled={actionLoad || !ipLicId}
                      className="w-full rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 py-2 text-xs font-bold hover:bg-red-500/30 transition-all disabled:opacity-40"
                    >
                      {actionLoad ? "..." : "İptal Et"}
                    </button>
                  </div>
                </div>

                {/* License list */}
                {!detailLoad && detail?.licenses?.length > 0 && (
                  <div className="rounded-xl border border-white/[0.07] bg-[#0a0a0a] overflow-hidden">
                    <div className="border-b border-white/[0.05] px-4 py-3">
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Lisanslar</p>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                      {detail.licenses.map((l: any) => (
                        <div key={l.license.id} className="px-4 py-3 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-xs font-semibold text-white/80">{l.product?.name ?? "?"}</p>
                              <p className="font-mono text-[10px] text-white/30">{l.license.licenseKey}</p>
                            </div>
                            <span className={cn(
                              "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                              l.license.status === "active"
                                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                                : "border-red-500/25 bg-red-500/10 text-red-400"
                            )}>{l.license.status}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-white/30">
                            <span className="flex items-center gap-1">
                              <Icon icon="carbon:network-4" width={10} />
                              {l.ips.length}/{l.license.seatLimit} IP
                            </span>
                            {l.ips.map((ip: any) => (
                              <span key={ip.id} className="rounded bg-white/[0.05] px-1.5 py-0.5 font-mono text-white/40">
                                {ip.ip}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      </AdminGuard>
  )
}