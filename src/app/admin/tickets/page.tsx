"use client"

import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions"

import { AdminGuard } from "@/components/admin/admin-guard"

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"

interface TicketRow {
  ticket: {
    id: string
    subject: string
    category: string
    priority: string
    status: "open" | "answered" | "pending" | "closed"
    createdAt: string
    lastActivityAt: string
  }
  user: {
    id: string
    name: string | null
    email: string | null
  } | null
}

interface Message {
  message: {
    id: string
    body: string
    isInternal: boolean
    createdAt: string
  }
  author: {
    id: string
    name: string | null
    email: string | null
  } | null
}

const statusColors: Record<string, string> = {
  open: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  answered: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  closed: "bg-white/[0.05] text-white/35 border-white/[0.06]",
}

const statusLabel: Record<string, string> = {
  open: "Açık",
  answered: "Yanıtlandı",
  pending: "Bekliyor",
  closed: "Kapatıldı",
}

const priorityColors: Record<string, string> = {
  low: "text-white/30",
  normal: "text-white/50",
  high: "text-orange-400",
  urgent: "text-red-400",
}

const categoryLabel: Record<string, string> = {
  general: "Genel",
  purchase: "Satın Alma",
  license: "Lisans",
  bug: "Hata",
  refund: "İade",
}

const inputCls =
  "w-full rounded-xl border border-white/[0.06] bg-[#0c0c0c] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all duration-200"

type StatusFilter = "all" | "open" | "answered" | "pending" | "closed"

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<TicketRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [selected, setSelected] = useState<TicketRow | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [replying, setReplying] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const fetchTickets = (f: StatusFilter) => {
    setLoading(true)
    const url = f === "all" ? "/api/admin/tickets" : `/api/admin/tickets?status=${f}`
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setTickets(d.tickets ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchTickets(filter)
  }, [filter])

  async function openDetail(row: TicketRow) {
    setSelected(row)
    setMessagesLoading(true)
    const res = await fetch(`/api/admin/tickets/${row.ticket.id}`)
    const data = await res.json()
    setMessages(data.messages ?? [])
    setMessagesLoading(false)
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!selected || !replyText.trim()) return
    setReplying(true)
    const res = await fetch(`/api/admin/tickets/${selected.ticket.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: replyText }),
    })
    setReplying(false)
    if (res.ok) {
      const data = await res.json()
      setMessages((prev) => [...prev, data.message])
      setReplyText("")
      setSelected((prev) => prev ? { ...prev, ticket: { ...prev.ticket, status: "answered" } } : prev)
      fetchTickets(filter)
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!selected) return
    setUpdatingStatus(true)
    await fetch(`/api/admin/tickets/${selected.ticket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    setUpdatingStatus(false)
    setSelected((prev) =>
      prev ? { ...prev, ticket: { ...prev.ticket, status: newStatus as TicketRow["ticket"]["status"] } } : prev
    )
    fetchTickets(filter)
  }

  const filters: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "Tümü" },
    { key: "open", label: "Açık" },
    { key: "pending", label: "Bekliyor" },
    { key: "answered", label: "Yanıtlandı" },
    { key: "closed", label: "Kapatıldı" },
  ]

  if (selected) {
    return (
      <AdminGuard permission={ADMIN_PERMISSIONS.TICKETS}>
        <div className="p-6 sm:p-8 space-y-6 max-w-4xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setSelected(null); setMessages([]) }}
              className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              <Icon icon="carbon:arrow-left" width={16} />
              Ticket Listesi
            </button>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-[#070707] overflow-hidden">
            <div className="border-b border-white/[0.04] px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-bold text-white/90">{selected.ticket.subject}</h2>
                <p className="text-xs text-white/35 mt-1">
                  {selected.user?.name ?? selected.user?.email ?? "Bilinmeyen"}
                  {" · "}
                  {categoryLabel[selected.ticket.category] ?? selected.ticket.category}
                  {" · "}
                  <span className={priorityColors[selected.ticket.priority]}>
                    {selected.ticket.priority.toUpperCase()}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <select
                  value={selected.ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                  className="rounded-xl border border-white/[0.08] bg-[#0c0c0c] px-3 py-1.5 text-xs text-white outline-none"
                >
                  <option value="open" className="bg-[#0c0c0c]">Açık</option>
                  <option value="pending" className="bg-[#0c0c0c]">Bekliyor</option>
                  <option value="answered" className="bg-[#0c0c0c]">Yanıtlandı</option>
                  <option value="closed" className="bg-[#0c0c0c]">Kapatıldı</option>
                </select>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[selected.ticket.status]}`}>
                  {statusLabel[selected.ticket.status]}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4 min-h-[200px]">
              {messagesLoading ? (
                <div className="text-center text-sm text-white/30 animate-pulse py-8">Yükleniyor...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-sm text-white/25 py-8">Mesaj bulunamadı</div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.message.id}
                    className={`rounded-xl border p-4 ${m.message.isInternal ? "border-amber-500/10 bg-amber-500/[0.03]" : "border-white/[0.06] bg-[#0a0a0a]"}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-white/50">
                        {m.author?.name ?? m.author?.email ?? "Bilinmeyen"}
                      </span>
                      {m.message.isInternal && (
                        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">Internal</span>
                      )}
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">{m.message.body}</p>
                    <p className="mt-2 text-[10px] text-white/20">
                      {new Date(m.message.createdAt).toLocaleString("tr-TR")}
                    </p>
                  </div>
                ))
              )}
            </div>

            {selected.ticket.status !== "closed" && (
              <div className="border-t border-white/[0.04] p-6">
                <form onSubmit={handleReply} className="space-y-3">
                  <textarea
                    className={inputCls}
                    rows={4}
                    placeholder="Kullanıcıya yanıt yaz..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                  />
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={replying}
                      className="rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-black hover:bg-white/90 disabled:opacity-50 transition-all"
                    >
                      {replying ? "Gönderiliyor..." : "Yanıt Gönder"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
          </AdminGuard>
    )
  }

  return (
    <div className="p-6 sm:p-8 space-y-8">
      <div className="border-b border-white/[0.04] pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white/90">Support Tickets</h1>
        <p className="text-xs text-white/35 mt-1 font-mono uppercase tracking-widest">LBDEV // TICKET MANAGEMENT</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition-all ${
              filter === f.key
                ? "bg-white text-black border-white"
                : "border-white/[0.08] text-white/50 hover:text-white hover:border-white/20"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-[#070707] overflow-hidden">
        <div className="border-b border-white/[0.04] px-6 py-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/80">Ticket Listesi</h2>
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
            {tickets.length} Ticket
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-white/30 animate-pulse">Yükleniyor...</div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center space-y-3">
            <Icon icon="carbon:chat-off" className="text-white/10" width={36} />
            <p className="text-xs text-white/35">Ticket bulunamadı</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {tickets.map((row) => (
              <button
                key={row.ticket.id}
                onClick={() => openDetail(row)}
                className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 hover:bg-white/[0.01] transition-all gap-3 text-left"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white/90 truncate">{row.ticket.subject}</p>
                    <p className="text-xs text-white/35 mt-0.5">
                      {row.user?.name ?? row.user?.email ?? "Bilinmeyen"}
                      {" · "}
                      {categoryLabel[row.ticket.category] ?? row.ticket.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] font-bold uppercase ${priorityColors[row.ticket.priority]}`}>
                    {row.ticket.priority}
                  </span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[row.ticket.status]}`}>
                    {statusLabel[row.ticket.status]}
                  </span>
                  <span className="text-[10px] text-white/20">
                    {new Date(row.ticket.lastActivityAt).toLocaleDateString("tr-TR")}
                  </span>
                  <Icon icon="carbon:chevron-right" width={14} className="text-white/20" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}