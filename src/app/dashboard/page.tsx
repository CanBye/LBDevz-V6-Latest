"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Icon } from "@iconify/react"
import { useLanguage } from "@/lib/language-context"

interface DashboardStats {
  balance: number
  activeLicenses: number
  activeTickets: number
  unpaidInvoices: number
  transactions: Array<{
    id: string
    amount: number
    type: string
    createdAt: string
  }>
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const { t } = useLanguage()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/me").then((r) => r.json()),
        fetch("/api/dashboard/stats").then((r) => r.json()).catch(() => ({ activeLicenses: 0, activeTickets: 0, unpaidInvoices: 0, transactions: [] }))
      ])
        .then(([meData, statsData]) => {
          setStats({
            balance: meData.balance ?? 0,
            activeLicenses: statsData.activeLicenses ?? 0,
            activeTickets: statsData.activeTickets ?? 0,
            unpaidInvoices: statsData.unpaidInvoices ?? 0,
            transactions: statsData.transactions ?? [],
          })
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    }
  }, [status])

  if (status === "loading" || loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-48 rounded bg-white/5" />
        <div className="grid gap-6 md:grid-cols-[1.2fr_2fr]">
          <div className="h-32 rounded-2xl bg-white/5" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-32 rounded-2xl bg-white/5" />
            <div className="h-32 rounded-2xl bg-white/5" />
            <div className="h-32 rounded-2xl bg-white/5" />
          </div>
        </div>
      </div>
    )
  }

  const formattedBalance = (stats?.balance ?? 0).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <div className="space-y-14">
      {/* Metrics Row */}
      <div className="grid gap-5 lg:grid-cols-[1.1fr_2fr]">
        
        {/* Large Bakiye Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#111] via-[#0a0a0a] to-[#060606] p-7 flex flex-col justify-between h-[160px] group cursor-default transition-all duration-300 hover:border-white/[0.14] hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.04)]">
          <div className="absolute -right-6 -bottom-6 text-emerald-400 opacity-[0.12] transition-all duration-500 group-hover:opacity-[0.22] group-hover:scale-105">
            <Icon icon="carbon:wallet" width={120} height={120} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/25">
              {t("balance")}
            </p>
            <p className="mt-2.5 text-[2.6rem] font-bold tracking-tight text-white leading-none">
              ₺{formattedBalance}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/25">
            <Icon icon="carbon:security" width={13} height={13} />
            Güvenli Bakiye / Secure Wallet
          </div>
        </div>

        {/* Small Metric Cards Grid */}
        <div className="grid grid-cols-3 gap-5">
          {[
            { label: t("activeLicenses"), value: stats?.activeLicenses ?? 0, icon: "carbon:cloud-service-management", sub: "Aktif Hizmetler" },
            { label: t("activeTickets"), value: stats?.activeTickets ?? 0, icon: "carbon:customer-service", sub: "Aktif Destek Talepleri" },
            { label: t("unpaidInvoices"), value: stats?.unpaidInvoices ?? 0, icon: "carbon:receipt", sub: "Ödenmemiş Faturalar" },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0f0f0f] to-[#070707] p-7 flex flex-col justify-between h-[160px] cursor-default transition-all duration-300 hover:border-white/[0.14] hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.04)]">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/25">
                    {card.sub}
                  </p>
                  <Icon icon={card.icon} width={20} height={20} className="text-white/20" />
                </div>
                <p className="mt-3 text-[2.6rem] font-bold tracking-tight text-white leading-none">
                  {card.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services Section */}
      <div className="space-y-5">
        <h2 className="text-base font-semibold tracking-tight text-white/50">
          {t("allServices")}
        </h2>
        
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="/dashboard/magaza"
            className="group flex flex-col items-center justify-center p-10 rounded-2xl border border-dashed border-white/10 bg-[#080808] hover:border-white/25 hover:bg-[#0c0c0c] transition-all duration-300 text-center h-[220px]"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/60 group-hover:scale-105 group-hover:bg-white/[0.09] group-hover:border-white/20 group-hover:text-white transition-all duration-300">
              <Icon icon="carbon:add-alt" width={26} height={26} />
            </div>
            <h3 className="mt-5 text-base font-bold text-white/80 group-hover:text-white transition-colors">
              {t("buyService")}
            </h3>
            <p className="mt-2 max-w-[220px] text-xs leading-relaxed text-white/30">
              {t("buyServiceDesc")}
            </p>
          </a>
        </div>
      </div>

      {/* Son işlemler */}
      {stats?.transactions && stats.transactions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight text-white/80">
            {t("recentTransactions")}
          </h2>
          <div className="rounded-2xl border border-white/[0.08] bg-[#070707]">
            <ul className="divide-y divide-white/[0.04]">
              {stats.transactions.map((tx) => (
                <li key={tx.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-white/80">{txTypeLabel(tx.type, t)}</p>
                    <p className="text-xs text-white/35">
                      {new Date(tx.createdAt).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold ${tx.amount > 0 ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount} ₺
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

function txTypeLabel(type: string, t: (k: any) => string) {
  const labels: Record<string, string> = {
    topup: "Kredi yükleme / Top-up",
    purchase: "Satın alma / Purchase",
    refund: "İade / Refund",
    renewal: "Yenileme / Renewal",
    commission: "Komisyon / Commission",
    admin_adjust: "Admin düzeltme / Adjustment",
  }
  return labels[type] ?? type
}
