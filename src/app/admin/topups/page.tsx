"use client"

import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions"

import { AdminGuard } from "@/components/admin/admin-guard"

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

interface TopupRequest {
  id: string
  userId: string
  amountCredits: number
  ibanReference: string | null
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

export default function AdminTopupsPage() {
  const [requests, setRequests] = useState<TopupRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [filter, setFilter] = useState<"pending" | "all">("pending")

  const fetchRequests = () => {
    fetch("/api/admin/topups")
      .then(r => r.json())
      .then(d => {
        setRequests(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  async function handleAction(id: string, status: "approved" | "rejected") {
    setProcessing(id)
    await fetch(`/api/admin/topups/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    setProcessing(null)
    fetchRequests()
  }

  const displayed =
    filter === "pending"
      ? requests.filter(r => r.status === "pending")
      : requests

  const statusConfigs = {
    pending: {
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      label: "Pending Verification",
      icon: "carbon:pending",
    },
    approved: {
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      label: "Approved & Deposited",
      icon: "carbon:checkmark-filled",
    },
    rejected: {
      color: "bg-red-500/10 text-red-400 border-red-500/20",
      label: "Rejected / Cancelled",
      icon: "carbon:close-filled",
    },
  }

  return (
    <AdminGuard permission={ADMIN_PERMISSIONS.TOPUPS}>
      <div className="p-6 sm:p-8 space-y-10 max-w-5xl">
        {/* Page Header */}
        <div className="border-b border-white/[0.04] pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white/90">Credit Requests</h1>
            <p className="text-xs text-white/35 mt-1 font-mono uppercase tracking-widest">LBDEV // TRANSACTION DEPOSIT AUDIT</p>
          </div>
        
          {/* Filter Toggle */}
          <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.02] p-1 self-start sm:self-auto">
            {([
              { id: "pending", label: "Pending" },
              { id: "all", label: "All Records" },
            ] as const).map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "rounded-lg px-4 py-1.5 text-xs font-semibold transition-all",
                  filter === f.id
                    ? "bg-white text-black"
                    : "text-white/40 hover:text-white"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Content */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#070707] overflow-hidden">
          <div className="border-b border-white/[0.04] px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white/80">Pending Wire Transfers</h2>
              <p className="text-[10px] text-white/35 mt-0.5">Cross-examine IBAN bank transfers and approve client credits</p>
            </div>
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
              {displayed.length} Requests Listed
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-white/30 animate-pulse">Loading transaction queue...</div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center space-y-3">
              <Icon icon="carbon:wallet" className="text-white/10" width={36} />
              <p className="text-xs text-white/35">
                {filter === "pending" ? "All deposits verified. Support queue clear!" : "No transactions found"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.03]">
              {displayed.map(r => {
                const cfg = statusConfigs[r.status] ?? statusConfigs.pending
                return (
                  <div key={r.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 hover:bg-white/[0.01] transition-all gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-[#0b0b0b] text-white/40 shrink-0">
                        <Icon icon="carbon:wallet" width={18} />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-bold text-white">₺{r.amountCredits.toLocaleString("tr-TR")}</p>
                          <span className={cn("flex items-center gap-1 rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider", cfg.color)}>
                            <Icon icon={cfg.icon} width={10} />
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-xs text-white/35 font-medium">
                          Client ID: <span className="font-mono text-[11px] text-white/50">{r.userId.slice(0, 12)}...</span>
                          {r.ibanReference && (
                            <>
                              {" · "}
                              Reference: <span className="font-semibold text-white/60">{r.ibanReference}</span>
                            </>
                          )}
                        </p>
                        <p className="text-[10px] text-white/20 font-mono">
                          Requested on: {new Date(r.createdAt).toLocaleString("tr-TR")}
                        </p>
                      </div>
                    </div>

                    {/* Approve/Reject Buttons */}
                    {r.status === "pending" && (
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <button
                          onClick={() => handleAction(r.id, "approved")}
                          disabled={processing === r.id}
                          className="flex items-center gap-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-4 py-2.5 text-xs font-semibold text-emerald-400 disabled:opacity-50 transition-all duration-150"
                        >
                          {processing === r.id ? "Processing..." : (
                            <>
                              <Icon icon="carbon:checkmark-filled" width={14} />
                              Approve Deposit
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleAction(r.id, "rejected")}
                          disabled={processing === r.id}
                          className="flex items-center gap-1 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-4 py-2.5 text-xs font-semibold text-red-400 disabled:opacity-50 transition-all duration-150"
                        >
                          {processing === r.id ? "..." : (
                            <>
                              <Icon icon="carbon:close-filled" width={14} />
                              Reject
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      </AdminGuard>
  )
}
