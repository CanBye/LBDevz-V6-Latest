"use client"

import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions"

import { AdminGuard } from "@/components/admin/admin-guard"

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell
} from "recharts"

interface DayData   { date: string; revenue: number; order_count: number }
interface ProdData  { id: string; name: string; revenue: number; order_count: number }
interface BuyerData { name: string | null; email: string; image: string | null; spent: number; order_count: number }
interface Totals    { total_orders: number; total_revenue: number; avg_order: number; unique_buyers: number }

const DAYS_OPTIONS = [7, 14, 30, 90, 365]
const COLORS = ["#818cf8", "#34d399", "#fb923c", "#f472b6", "#60a5fa", "#a78bfa", "#4ade80", "#fbbf24", "#f87171", "#38bdf8"]

const StatCard = ({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) => (
  <div className="rounded-2xl border border-white/[0.07] bg-[#090909] p-5 space-y-3">
    <div className="flex items-center justify-between">
      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{label}</p>
      <Icon icon={icon} className="text-white/20" width={18} />
    </div>
    <p className="text-2xl font-bold text-white/90">{value}</p>
    {sub && <p className="text-[10px] text-white/25">{sub}</p>}
  </div>
)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <AdminGuard permission={ADMIN_PERMISSIONS.REVENUE}>
      <div className="rounded-xl border border-white/[0.1] bg-[#0d0d0d] px-3 py-2.5 shadow-2xl">
        <p className="text-[10px] text-white/40 mb-1.5">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="text-xs font-semibold" style={{ color: p.color }}>
            {p.name === "revenue" ? `${Number(p.value).toLocaleString("tr-TR")} ₺` : `${p.value} sipariş`}
          </p>
        ))}
      </div>
      </AdminGuard>
  )
}

export default function AdminRevenuePage() {
  const [days, setDays]       = useState(30)
  const [daily, setDaily]     = useState<DayData[]>([])
  const [products, setProds]  = useState<ProdData[]>([])
  const [totals, setTotals]   = useState<Totals | null>(null)
  const [buyers, setBuyers]   = useState<BuyerData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/revenue?days=${days}`)
      .then(r => r.json())
      .then(d => {
        setDaily(d.daily ?? [])
        setProds(d.products ?? [])
        setTotals(d.totals ?? null)
        setBuyers(d.topBuyers ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [days])

  const maxRevenue = Math.max(...daily.map(d => d.revenue), 1)

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-white/90">Gelir</h1>
          <p className="text-xs text-white/30 mt-0.5 uppercase tracking-widest font-mono">Admin · Revenue</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-white/[0.07] bg-[#090909] p-1">
          {DAYS_OPTIONS.map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${days === d ? "bg-white/[0.08] text-white" : "text-white/30 hover:text-white/60"}`}
            >
              {d === 365 ? "1Y" : `${d}G`}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-2xl bg-white/[0.03] animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="carbon:finance"          label="Toplam Gelir"    value={`${Number(totals?.total_revenue ?? 0).toLocaleString("tr-TR")} ₺`} />
          <StatCard icon="carbon:receipt"          label="Sipariş Sayısı"  value={String(totals?.total_orders ?? 0)} />
          <StatCard icon="carbon:finance"          label="Ort. Sipariş"    value={`${Number(totals?.avg_order ?? 0).toLocaleString("tr-TR")} ₺`} />
          <StatCard icon="carbon:user-multiple"    label="Alıcı Sayısı"    value={String(totals?.unique_buyers ?? 0)} />
        </div>
      )}

      {/* Revenue chart */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#090909] p-5 space-y-4">
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Günlük Gelir</p>
        {loading ? (
          <div className="h-52 rounded-xl bg-white/[0.03] animate-pulse" />
        ) : daily.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-sm text-white/20">Veri yok</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={daily} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#818cf8" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
                tickFormatter={v => new Date(v).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
                tickFormatter={v => `${v.toLocaleString("tr-TR")}₺`}
                axisLine={false} tickLine={false} width={60} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="revenue"
                stroke="#818cf8" strokeWidth={2}
                fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Product breakdown */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#090909] p-5 space-y-4">
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Ürüne Göre Gelir</p>
          {loading ? (
            <div className="h-52 rounded-xl bg-white/[0.03] animate-pulse" />
          ) : products.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-sm text-white/20">Veri yok</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={products} margin={{ top: 4, right: 4, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9 }}
                    axisLine={false} tickLine={false}
                    tickFormatter={v => v.length > 10 ? v.slice(0, 10) + "…" : v} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
                    tickFormatter={v => `${v.toLocaleString()}₺`}
                    axisLine={false} tickLine={false} width={55} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" name="revenue" radius={[6, 6, 0, 0]}>
                    {products.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {products.map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-white/60 truncate">{p.name}</span>
                      <span className="text-white/25 shrink-0">{p.order_count} sipariş</span>
                    </div>
                    <span className="font-bold text-white/80 shrink-0 ml-2">{Number(p.revenue).toLocaleString("tr-TR")} ₺</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Top buyers */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#090909] p-5 space-y-4">
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest">En Çok Harcayan</p>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 rounded-xl bg-white/[0.03] animate-pulse" />)}
            </div>
          ) : buyers.length === 0 ? (
            <div className="py-20 text-center text-sm text-white/20">Veri yok</div>
          ) : (
            <div className="space-y-2">
              {buyers.map((b, i) => (
                <div key={b.email} className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-[#0d0d0d] px-4 py-3">
                  <span className="text-sm font-bold text-white/20 w-4 shrink-0">{i + 1}</span>
                  <div className="h-8 w-8 rounded-full bg-[#1a1a1a] border border-white/[0.07] overflow-hidden flex items-center justify-center shrink-0">
                    {b.image ? <img src={b.image} alt="" className="h-full w-full object-cover" /> : <span className="text-xs font-bold text-white/30">{(b.name ?? b.email)[0].toUpperCase()}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white/80 truncate">{b.name ?? b.email}</p>
                    <p className="text-[10px] text-white/30">{b.order_count} sipariş</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-400 shrink-0">{Number(b.spent).toLocaleString("tr-TR")} ₺</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}