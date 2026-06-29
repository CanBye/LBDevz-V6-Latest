"use client"

import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions"

import { AdminGuard } from "@/components/admin/admin-guard"

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

interface Stats {
  totalViews: number; uniqueVisitors: number
  topPages: { path: string; views: number }[]
  topCountries: { country: string; country_code: string; views: number }[]
  dailyViews: { date: string; views: number; unique_visitors: number }[]
  topReferrers: { referrer: string; count: number }[]
  recentViews: { path: string; country: string | null; created_at: string }[]
}

const FLAG_MAP: Record<string, string> = { TR: "🇹🇷", US: "🇺🇸", DE: "🇩🇪", GB: "🇬🇧", FR: "🇫🇷", NL: "🇳🇱", RU: "🇷🇺", UA: "🇺🇦", PL: "🇵🇱", RO: "🇷🇴", BG: "🇧🇬", GR: "🇬🇷" }

export default function AdminAnalyticsPage() {
  const [stats, setStats]   = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays]     = useState(30)

  function load(d = days) {
    setLoading(true)
    fetch(`/api/admin/analytics?days=${d}`)
      .then(r => r.json()).then(d => { setStats(d); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(() => load(), [])

  function changeDays(d: number) { setDays(d); load(d) }

  const maxViews = stats?.dailyViews.reduce((a, b) => Math.max(a, b.views), 1) ?? 1

  return (
    <AdminGuard permission={ADMIN_PERMISSIONS.ANALYTICS}>
      <div className="p-6 sm:p-8 max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-white/90">Analizler</h1>
            <p className="text-xs text-white/30 mt-0.5 uppercase tracking-widest font-mono">Admin · Analytics</p>
          </div>
          <div className="flex gap-1.5">
            {[7, 14, 30, 90].map(d => (
              <button key={d} onClick={() => changeDays(d)}
                className={cn("rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all",
                  days === d ? "border-white/20 bg-white/[0.08] text-white" : "border-white/[0.07] text-white/35 hover:text-white/60")}>
                {d}G
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl bg-white/[0.03] animate-pulse" />)}
          </div>
        ) : !stats ? null : (
          <>
            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              {[
                { label: "Toplam Görüntülenme", value: stats.totalViews.toLocaleString("tr-TR"), icon: "carbon:view", color: "text-indigo-400" },
                { label: "Tekil Ziyaretçi", value: stats.uniqueVisitors.toLocaleString("tr-TR"), icon: "carbon:user-multiple", color: "text-emerald-400" },
                { label: "En Çok Ziyaret", value: stats.topPages[0]?.path ?? "-", icon: "carbon:document", color: "text-amber-400" },
                { label: "En Çok Ülke", value: stats.topCountries[0] ? `${FLAG_MAP[stats.topCountries[0].country_code] ?? "🌍"} ${stats.topCountries[0].country}` : "-", icon: "carbon:earth", color: "text-rose-400" },
              ].map(c => (
                <div key={c.label} className="rounded-2xl border border-white/[0.07] bg-[#080808] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon icon={c.icon} className={cn(c.color, "opacity-70")} width={16} />
                    <span className="text-[10px] text-white/30 uppercase tracking-wider font-bold">{c.label}</span>
                  </div>
                  <p className="text-xl font-bold text-white/85 truncate">{c.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3 mb-6">
              {/* Daily chart */}
              <div className="lg:col-span-2 rounded-2xl border border-white/[0.07] bg-[#080808] p-5">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-5">Günlük Trafik</p>
                {stats.dailyViews.length === 0 ? (
                  <p className="text-xs text-white/25 py-8 text-center">Henüz veri yok</p>
                ) : (
                  <div className="flex items-end gap-0.5 h-36">
                    {stats.dailyViews.map(d => {
                      const h = Math.max(4, (d.views / maxViews) * 100)
                      return (
                        <div key={d.date} className="group relative flex-1 flex flex-col items-center justify-end h-full">
                          <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                            <div className="rounded-lg border border-white/[0.1] bg-[#111] px-2 py-1 text-[9px] text-white/70 whitespace-nowrap">
                              {d.views} görüntülenme<br />{d.unique_visitors} tekil
                            </div>
                          </div>
                          <div className="w-full rounded-sm bg-indigo-500/60 hover:bg-indigo-400/80 transition-colors" style={{ height: `${h}%` }} />
                          <span className="text-[7px] text-white/20 mt-1 rotate-45 origin-left hidden sm:block">
                            {new Date(d.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Countries */}
              <div className="rounded-2xl border border-white/[0.07] bg-[#080808] p-5">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-4">Ülkeler</p>
                {stats.topCountries.length === 0 ? (
                  <p className="text-xs text-white/25 py-4 text-center">Henüz veri yok</p>
                ) : (
                  <div className="space-y-2.5">
                    {stats.topCountries.slice(0, 10).map(c => {
                      const maxC = stats.topCountries[0]?.views ?? 1
                      const pct = Math.round((c.views / maxC) * 100)
                      return (
                        <div key={c.country_code}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-white/65 flex items-center gap-1.5">
                              <span>{FLAG_MAP[c.country_code] ?? "🌍"}</span>
                              {c.country}
                            </span>
                            <span className="text-[10px] text-white/35 font-mono">{c.views}</span>
                          </div>
                          <div className="h-1 rounded-full bg-white/[0.05]">
                            <div className="h-1 rounded-full bg-indigo-500/50" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Top pages */}
              <div className="rounded-2xl border border-white/[0.07] bg-[#080808] p-5">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-4">En Çok Ziyaret Edilen Sayfalar</p>
                <div className="space-y-2">
                  {stats.topPages.slice(0, 10).map(p => (
                    <div key={p.path} className="flex items-center justify-between gap-3">
                      <span className="text-xs text-white/55 truncate font-mono flex-1">{p.path}</span>
                      <span className="text-xs font-bold text-white/45 shrink-0">{p.views.toLocaleString("tr-TR")}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Referrers */}
              <div className="rounded-2xl border border-white/[0.07] bg-[#080808] p-5">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-4">Trafik Kaynakları</p>
                <div className="space-y-2">
                  {stats.topReferrers.slice(0, 10).map(r => (
                    <div key={r.referrer} className="flex items-center justify-between gap-3">
                      <span className="text-xs text-white/55 truncate flex-1">{r.referrer}</span>
                      <span className="text-xs font-bold text-white/45 shrink-0">{r.count.toLocaleString("tr-TR")}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent views */}
              <div className="lg:col-span-2 rounded-2xl border border-white/[0.07] bg-[#080808] p-5">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-4">Son Ziyaretler</p>
                <div className="space-y-1.5">
                  {stats.recentViews.map((v, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs">
                      <span className="text-white/25 w-4">{FLAG_MAP[v.country ?? ""] ?? "🌍"}</span>
                      <span className="text-white/55 font-mono flex-1 truncate">{v.path}</span>
                      <span className="text-white/25 shrink-0 text-[10px]">{new Date(v.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      </AdminGuard>
  )
}