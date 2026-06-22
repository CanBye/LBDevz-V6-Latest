"use client"

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

interface Coupon {
  id: string
  code: string
  type: string
  value: number
  maxUses: number | null
  usesCount?: number
  usedCount?: number
  minAmount?: number | null
  productId?: string | null
  expiresAt?: string | null
  isActive?: boolean
  active?: boolean
  createdAt: string
}

const inputCls =
  "w-full rounded-xl border border-white/[0.06] bg-[#0c0c0c] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all duration-200"

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")
  const [form, setForm] = useState({
    code: "",
    type: "percentage",
    value: "",
    maxUses: "",
    minAmount: "",
    productId: "",
    expiresAt: "",
  })

  const fetchCoupons = () => {
    fetch("/api/admin/coupons")
      .then(r => r.json())
      .then(d => {
        setCoupons(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchCoupons() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMsg("")
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        value: Number(form.value),
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        minAmount: form.minAmount ? Number(form.minAmount) : null,
        productId: form.productId || null,
        expiresAt: form.expiresAt || null,
      }),
    })
    setSaving(false)
    if (res.ok) {
      setMsg("Kupon oluşturuldu!")
      setForm({ code: "", type: "percentage", value: "", maxUses: "", minAmount: "", productId: "", expiresAt: "" })
      fetchCoupons()
    } else {
      const d = await res.json()
      setMsg(d.error ?? "Hata oluştu")
    }
  }

  async function toggleActive(coupon: Coupon) {
    const currentActive = coupon.isActive ?? coupon.active ?? true
    await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !currentActive }),
    })
    fetchCoupons()
  }

  async function deleteCoupon(id: string) {
    if (!confirm("Bu kuponu silmek istediğinize emin misiniz?")) return
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" })
    fetchCoupons()
  }

  const typeLabel: Record<string, string> = {
    percentage: "% İndirim",
    percent: "% İndirim",
    fixed: "Sabit ₺",
    free: "Ücretsiz",
  }

  const typeBadgeColor: Record<string, string> = {
    percentage: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    percent: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    fixed: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    free: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  }

  return (
    <div className="p-6 sm:p-8 space-y-10">
      <div className="border-b border-white/[0.04] pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white/90">Kupon Yönetimi</h1>
        <p className="text-xs text-white/35 mt-1 font-mono uppercase tracking-widest">LBDEV // COUPON ENGINE</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Create Form */}
        <div className="lg:col-span-1 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#0c0c0c] to-[#040404] p-6 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-white/80">Yeni Kupon Oluştur</h2>
            <p className="text-[10px] text-white/35 mt-0.5">İndirim kuponu ekle</p>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white/35 uppercase tracking-wider">Kupon Kodu</label>
              <input
                className={inputCls}
                placeholder="örn. YENI20"
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/35 uppercase tracking-wider">Tip</label>
                <select
                  className={inputCls}
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                >
                  <option value="percentage" className="bg-[#0c0c0c]">% İndirim</option>
                  <option value="fixed" className="bg-[#0c0c0c]">Sabit ₺</option>
                  <option value="free" className="bg-[#0c0c0c]">Ücretsiz</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/35 uppercase tracking-wider">Değer</label>
                <input
                  className={inputCls}
                  type="number"
                  min="0"
                  placeholder="10"
                  value={form.value}
                  onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/35 uppercase tracking-wider">Max Kullanım</label>
                <input
                  className={inputCls}
                  type="number"
                  min="1"
                  placeholder="Sınırsız"
                  value={form.maxUses}
                  onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/35 uppercase tracking-wider">Min Tutar ₺</label>
                <input
                  className={inputCls}
                  type="number"
                  min="0"
                  placeholder="Yok"
                  value={form.minAmount}
                  onChange={e => setForm(f => ({ ...f, minAmount: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white/35 uppercase tracking-wider">Son Geçerlilik</label>
              <input
                className={inputCls}
                type="datetime-local"
                value={form.expiresAt}
                onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
              />
            </div>

            {msg && (
              <p className={cn("text-xs font-medium", msg.includes("oluşturuldu") ? "text-emerald-400" : "text-red-400")}>
                {msg}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-white/90 text-black py-3 text-xs font-bold transition-all duration-200 disabled:opacity-50"
            >
              {saving ? "Oluşturuluyor..." : (
                <>
                  <Icon icon="carbon:tag" width={16} />
                  Kupon Oluştur
                </>
              )}
            </button>
          </form>
        </div>

        {/* Coupons Table */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-[#070707] overflow-hidden">
          <div className="border-b border-white/[0.04] px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white/80">Aktif Kuponlar</h2>
              <p className="text-[10px] text-white/35 mt-0.5">Tüm indirim kuponları</p>
            </div>
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{coupons.length} Kupon</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-white/30 animate-pulse">Yükleniyor...</div>
          ) : coupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center space-y-3">
              <Icon icon="carbon:tag" className="text-white/10" width={36} />
              <p className="text-xs text-white/35">Henüz kupon yok</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.03]">
              {coupons.map(c => {
                const isActive = c.isActive ?? c.active ?? true
                const uses = c.usesCount ?? c.usedCount ?? 0
                return (
                  <div key={c.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 hover:bg-white/[0.01] transition-all gap-3">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-bold text-white">{c.code}</span>
                          <span className={cn("rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider", typeBadgeColor[c.type] ?? "bg-white/5 text-white/40 border-white/10")}>
                            {typeLabel[c.type] ?? c.type}
                          </span>
                          <span className={cn("rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider", isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20")}>
                            {isActive ? "Aktif" : "Pasif"}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/30 mt-1">
                          Değer: {c.type === "percentage" || c.type === "percent" ? `%${c.value}` : `₺${c.value}`}
                          {c.maxUses ? ` · ${uses}/${c.maxUses} kullanım` : ` · ${uses} kullanım`}
                          {c.expiresAt ? ` · ${new Date(c.expiresAt).toLocaleDateString("tr-TR")} son` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleActive(c)}
                        className={cn(
                          "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all border",
                          isActive
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-amber-500/10"
                        )}
                      >
                        {isActive ? "Pasif Et" : "Aktif Et"}
                      </button>
                      <button
                        onClick={() => deleteCoupon(c.id)}
                        className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 transition-all"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}