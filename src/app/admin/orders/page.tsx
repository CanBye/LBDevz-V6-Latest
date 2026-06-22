"use client"

import { useEffect, useState, useCallback } from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface Order {
  id: string
  price_paid: number
  created_at: string
  product_name: string
  product_id: string
  user_name: string | null
  user_email: string
  user_image: string | null
}

export default function AdminOrdersPage() {
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState("")
  const [q, setQ]             = useState("")

  const load = useCallback((query: string) => {
    setLoading(true)
    fetch(`/api/admin/orders?q=${encodeURIComponent(query)}&limit=150`)
      .then(r => r.json())
      .then(d => { setOrders(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { load("") }, [load])

  useEffect(() => {
    const t = setTimeout(() => { setQ(search); load(search) }, 400)
    return () => clearTimeout(t)
  }, [search, load])

  const totalRevenue = orders.reduce((a, o) => a + Number(o.price_paid), 0)

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white/90">Siparişler</h1>
          <p className="text-xs text-white/30 mt-0.5 uppercase tracking-widest font-mono">Admin · Orders</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/[0.07] bg-[#0a0a0a] px-4 py-2 text-center">
            <p className="text-lg font-bold text-emerald-400">{totalRevenue.toLocaleString("tr-TR")} ₺</p>
            <p className="text-[10px] text-white/30">Gösterilen toplam</p>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-[#0a0a0a] px-4 py-2 text-center">
            <p className="text-lg font-bold text-white/80">{orders.length}</p>
            <p className="text-[10px] text-white/30">Sipariş</p>
          </div>
        </div>
      </div>

      <input
        className="w-full rounded-xl border border-white/[0.07] bg-[#0d0d0d] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all"
        placeholder="Kullanıcı adı, email veya ürün ara..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="rounded-2xl border border-white/[0.07] bg-[#080808] overflow-hidden">
        <div className="grid grid-cols-[2fr_2fr_1fr_1fr] px-5 py-2.5 border-b border-white/[0.04] text-[10px] font-bold text-white/25 uppercase tracking-wider">
          <span>Ürün</span>
          <span>Kullanıcı</span>
          <span>Ücret</span>
          <span>Tarih</span>
        </div>

        {loading ? (
          <div className="space-y-px">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-14 bg-white/[0.02] animate-pulse" style={{ opacity: 1 - i * 0.1 }} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-sm text-white/25">Sipariş bulunamadı</div>
        ) : (
          <div>
            {orders.map((o, i) => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                className="grid grid-cols-[2fr_2fr_1fr_1fr] items-center px-5 py-3.5 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-[#111]">
                    <Icon icon="carbon:cube" className="text-white/40" width={13} />
                  </div>
                  <span className="text-sm text-white/80 truncate">{o.product_name}</span>
                </div>

                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-6 w-6 rounded-full bg-[#1a1a1a] border border-white/[0.07] overflow-hidden flex items-center justify-center shrink-0">
                    {o.user_image
                      ? <img src={o.user_image} alt="" className="h-full w-full object-cover" />
                      : <Icon icon="carbon:user-filled" className="text-white/30" width={11} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white/75 truncate">{o.user_name ?? o.user_email}</p>
                    <p className="text-[10px] text-white/30 truncate">{o.user_email}</p>
                  </div>
                </div>

                <span className="text-sm font-bold text-emerald-400">{Number(o.price_paid).toLocaleString("tr-TR")} ₺</span>

                <span className="text-xs text-white/30">
                  {new Date(o.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}