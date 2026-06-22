"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useLanguage } from "@/lib/language-context"
import { TopupForm } from "@/components/dashboard/topup-form"

interface KrediData {
  balance: number
  transactions: Array<{
    id: string
    amount: number
    type: string
    note: string | null
    balanceAfter: number
    createdAt: string
  }>
  pendingTopups: Array<{
    id: string
    amountCredits: number
    createdAt: string
    status: "pending" | "approved" | "rejected"
  }>
}

export default function KrediPage() {
  const { status } = useSession()
  const { t } = useLanguage()
  const [data, setData] = useState<KrediData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchKrediData = () => {
    Promise.all([
      fetch("/api/me").then((r) => r.json()),
      fetch("/api/dashboard/kredi/data").then((r) => r.json()).catch(() => ({ transactions: [], pendingTopups: [] }))
    ])
      .then(([meData, krediData]) => {
        setData({
          balance: meData.balance ?? 0,
          transactions: krediData.transactions ?? [],
          pendingTopups: krediData.pendingTopups ?? [],
        })
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchKrediData()
    }
  }, [status])

  if (status === "loading" || loading || !data) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-48 rounded bg-white/5" />
        <div className="h-32 rounded-2xl bg-white/5" />
        <div className="h-64 rounded-2xl bg-white/5" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">{t("credits")}</h1>
        <p className="mt-1 text-sm text-white/40">Bakiye ve işlem geçmişi / Balance and history</p>
      </div>

      {/* Bakiye kartı */}
      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0c0c0c] to-[#040404] p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-white/30">{t("balance")}</p>
        <p className="mt-2 text-5xl font-bold tracking-tight text-white">
          {data.balance.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} <span className="text-2xl text-white/40">₺</span>
        </p>
      </div>

      {/* Kredi yükleme formu */}
      <TopupForm onSuccess={fetchKrediData} />

      {/* Bekleyen talepler */}
      {data.pendingTopups.length > 0 && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#070707]">
          <div className="border-b border-white/[0.06] px-6 py-4">
            <h2 className="text-sm font-semibold text-white/70">{t("pendingTopups")}</h2>
          </div>
          <ul className="divide-y divide-white/[0.04]">
            {data.pendingTopups.map((req) => (
              <li key={req.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-semibold text-white/80">{req.amountCredits} ₺ {t("pendingTopups")}</p>
                  <p className="text-xs text-white/35">
                    {new Date(req.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    req.status === "pending"
                      ? "bg-yellow-500/10 text-yellow-400"
                      : req.status === "approved"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {req.status === "pending"
                    ? t("pending")
                    : req.status === "approved"
                      ? t("approved")
                      : t("rejected")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* İşlem geçmişi */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#070707]">
        <div className="border-b border-white/[0.06] px-6 py-4">
          <h2 className="text-sm font-semibold text-white/70">{t("recentTransactions")}</h2>
        </div>
        {data.transactions.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-white/30">{t("noTransactions")}</p>
        ) : (
          <ul className="divide-y divide-white/[0.04]">
            {data.transactions.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-semibold text-white/80">
                    {tx.type === "topup" ? "Kredi yükleme / Top-up" :
                     tx.type === "purchase" ? "Satın alma / Purchase" :
                     tx.type === "refund" ? "İade / Refund" :
                     tx.type === "renewal" ? "Yenileme / Renewal" :
                     tx.type === "commission" ? "Komisyon / Commission" : "Admin düzeltme / Adjustment"}
                  </p>
                  {tx.note && <p className="text-xs text-white/35">{tx.note}</p>}
                  <p className="text-xs text-white/25">
                    {new Date(tx.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-bold ${tx.amount > 0 ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount} ₺
                  </p>
                  <p className="text-xs text-white/25">Bakiye / Balance: {tx.balanceAfter} ₺</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
