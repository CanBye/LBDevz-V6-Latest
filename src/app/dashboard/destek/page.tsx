"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { Icon } from "@iconify/react"
import { useLanguage } from "@/lib/language-context"
import { cn } from "@/lib/utils"
import { TurnstileWidget } from "@/components/ui/turnstile-widget"

interface Ticket {
  id: string
  subject: string
  category: string
  priority: string
  status: "open" | "answered" | "pending" | "closed"
  createdAt: string
  lastActivityAt: string
}

interface TicketMessage {
  id: string
  ticketId: string
  authorId: string
  body: string
  isInternal: boolean
  createdAt: string
}

const statusConfigs: Record<string, { label: string; color: string; bg: string }> = {
  open:     { label: "Açık",      color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  answered: { label: "Yanıtlandı", color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20" },
  pending:  { label: "Bekliyor",  color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
  closed:   { label: "Kapatıldı", color: "text-white/35",    bg: "bg-white/[0.04] border-white/[0.08]" },
}

const priorityConfigs: Record<string, { label: string; color: string }> = {
  low:    { label: "Düşük",  color: "text-white/35" },
  normal: { label: "Normal", color: "text-white/55" },
  high:   { label: "Yüksek", color: "text-orange-400" },
  urgent: { label: "Acil",   color: "text-red-400" },
}

const categoryLabels: Record<string, string> = {
  general:  "Genel",
  purchase: "Satın Alma",
  license:  "Lisans",
  bug:      "Hata Bildirimi",
  refund:   "İade",
}

const faqItems = [
  { icon: "carbon:server-dns", label: "Sunucu erişim sorunu" },
  { icon: "carbon:data-storage", label: "Disk alanı artırma" },
  { icon: "carbon:settings-adjust", label: "DNS ayarları" },
  { icon: "carbon:security", label: "SSL kurulumu" },
]

const inputCls =
  "w-full rounded-xl border border-white/[0.06] bg-[#0c0c0c] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/40 focus:shadow-[0_0_0_2px_rgba(139,92,246,0.08)] transition-all duration-200"

type View = "list" | "new" | "detail"

export default function DestekPage() {
  const { status } = useSession()
  const { t } = useLanguage()

  const [view, setView] = useState<View>("list")
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [replying, setReplying] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attachedFile, setAttachedFile] = useState<File | null>(null)

  const [form, setForm] = useState({
    subject: "",
    category: "general",
    priority: "low",
    message: "",
    relatedService: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [ticketTurnstileToken, setTicketTurnstileToken] = useState("")
  const handleTicketTurnstile = useCallback((token: string) => setTicketTurnstileToken(token), [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchTickets = () => {
    fetch("/api/dashboard/tickets")
      .then((r) => r.json())
      .then((d) => { setTickets(d.tickets ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    if (status === "authenticated") fetchTickets()
  }, [status])

  async function openTicketDetail(ticket: Ticket) {
    setSelectedTicket(ticket)
    setMessagesLoading(true)
    setView("detail")
    const res = await fetch(`/api/dashboard/tickets/${ticket.id}`)
    const data = await res.json()
    setMessages(data.messages ?? [])
    setMessagesLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setFormError("")
    const res = await fetch("/api/dashboard/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: form.subject,
        category: form.category,
        priority: form.priority,
        message: form.message,
        turnstileToken: ticketTurnstileToken,
      }),
    })
    setSubmitting(false)
    if (res.ok) {
      setSuccessMsg("Destek talebiniz oluşturuldu. En kısa sürede yanıtlanacak.")
      setForm({ subject: "", category: "general", priority: "low", message: "", relatedService: "" })
      setTicketTurnstileToken("")
      setView("list")
      fetchTickets()
    } else {
      const d = await res.json()
      setFormError(d.error ?? "Bir hata oluştu")
    }
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedTicket || (!replyText.trim() && !attachedFile)) return
    setReplying(true)

    let messageText = replyText.trim()

    // If file attached, upload as base64 or include filename in message
    if (attachedFile) {
      const isImage = attachedFile.type.startsWith("image/")
      if (isImage) {
        // Convert image to base64 data URL and embed in message
        const reader = new FileReader()
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(attachedFile)
        })
        messageText = messageText
          ? `${messageText}\n[IMG:${attachedFile.name}:${base64}]`
          : `[IMG:${attachedFile.name}:${base64}]`
      } else {
        messageText = messageText
          ? `${messageText}\n[DOSYA: ${attachedFile.name}]`
          : `[DOSYA: ${attachedFile.name}]`
      }
    }

    const res = await fetch(`/api/dashboard/tickets/${selectedTicket.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: messageText }),
    })
    setReplying(false)
    if (res.ok) {
      const data = await res.json()
      setMessages((prev) => [...prev, data.message])
      setReplyText("")
      setAttachedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  // ─── NEW TICKET VIEW ─────────────────────────────────────────────────────
  if (view === "new") {
    return (
      <div className="max-w-5xl space-y-6">
        {/* Back link */}
        <button
          onClick={() => setView("list")}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          <Icon icon="carbon:arrow-left" width={14} />
          Taleplere dön
        </button>

        <h1 className="text-2xl font-bold tracking-tight text-white">Yeni talep oluştur</h1>

        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          {/* Left sidebar */}
          <div className="space-y-4">
            {/* Tips card */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#080808] p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Icon icon="carbon:help-desk" width={16} className="text-violet-400" />
                <h3 className="text-sm font-semibold text-white/80">Destek İpuçları</h3>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">
                Talebinizi oluştururken aşağıdaki detaylara dikkat etmeniz çözüm sürecini hızlandıracaktır:
              </p>
              <ul className="space-y-2.5">
                {[
                  { text: "Hızlı Yanıt: Ortalama yanıt süremiz 2 saat içerisindedir." },
                  { text: "Detaylı Açıklama: Sorununuzu ne kadar detaylı anlatırsanız, o kadar hızlı çözüm üretiriz." },
                  { text: "Canlı Destek: Destek talebi sistemimiz canlıdır. Yetkili bir mesaj yazdığı anda bildirim alırsınız ve yanıtlar anlık olarak ekranınızda gözükür." },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Icon icon="carbon:checkmark-filled" width={14} className="text-violet-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-white/50 leading-relaxed">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* FAQ card */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#080808] p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Icon icon="carbon:chat-bot" width={16} className="text-violet-400" />
                <h3 className="text-sm font-semibold text-white/80">Sık Sorulan Konular</h3>
              </div>
              <ul className="space-y-1">
                {faqItems.map((item, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, subject: item.label }))}
                      className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-white/50 hover:bg-white/[0.03] hover:text-white/80 transition-all text-left"
                    >
                      <Icon icon={item.icon} width={13} className="text-white/30 shrink-0" />
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right form */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#080808] p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Konu */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/60">
                  Konu <span className="text-violet-400">*</span>
                </label>
                <input
                  className={inputCls}
                  placeholder="Konuyu kısaca açıklayınız..."
                  value={form.subject}
                  onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                  required
                />
              </div>

              {/* Öncelik + İlgili Hizmet */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/60">
                    Öncelik <span className="text-violet-400">*</span>
                  </label>
                  <select
                    className={inputCls}
                    value={form.priority}
                    onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))}
                  >
                    <option value="low"    className="bg-[#0c0c0c]">Düşük</option>
                    <option value="normal" className="bg-[#0c0c0c]">Normal</option>
                    <option value="high"   className="bg-[#0c0c0c]">Yüksek</option>
                    <option value="urgent" className="bg-[#0c0c0c]">Acil</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/60">İlgili Hizmet</label>
                  <select
                    className={inputCls}
                    value={form.category}
                    onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    <option value="general"  className="bg-[#0c0c0c]">Hizmet seçin</option>
                    <option value="purchase" className="bg-[#0c0c0c]">Satın Alma</option>
                    <option value="license"  className="bg-[#0c0c0c]">Lisans</option>
                    <option value="bug"      className="bg-[#0c0c0c]">Hata Bildirimi</option>
                    <option value="refund"   className="bg-[#0c0c0c]">İade</option>
                  </select>
                </div>
              </div>

              {/* Mesaj */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/60">
                  Mesaj <span className="text-violet-400">*</span>
                </label>
                <textarea
                  className={inputCls}
                  rows={6}
                  placeholder="Talebinizi detaylı bir şekilde açıklayınız..."
                  value={form.message}
                  onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                  required
                />
              </div>

              {formError && (
                <p className="text-xs text-red-400">{formError}</p>
              )}

              <TurnstileWidget onVerify={handleTicketTurnstile} />

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                <p className="text-[10px] text-white/25 flex items-center gap-1.5">
                  <Icon icon="carbon:information" width={12} />
                  Yıldızlı alanlar zorunludur.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-900/30 disabled:opacity-50 transition-all duration-200"
                >
                  <Icon icon="carbon:send-filled" width={14} />
                  {submitting ? "Gönderiliyor..." : "Talebi Gönder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ─── TICKET DETAIL VIEW ──────────────────────────────────────────────────
  if (view === "detail" && selectedTicket) {
    const sc = statusConfigs[selectedTicket.status] ?? statusConfigs.open
    const pc = priorityConfigs[selectedTicket.priority] ?? priorityConfigs.normal
    const ticketNum = selectedTicket.id.replace(/-/g, "").slice(0, 4).toUpperCase()

    return (
      <div className="flex flex-col gap-6">
        {/* Back */}
        <button
          onClick={() => { setView("list"); setSelectedTicket(null); setMessages([]) }}
          className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors w-fit"
        >
          <Icon icon="carbon:arrow-left" width={15} />
          Taleplere dön
        </button>

        {/* Two-column layout */}
        <div className="grid gap-5 lg:grid-cols-[300px_1fr] items-stretch" style={{ gridAutoRows: "1fr" }}>

          {/* LEFT — Ticket Meta Sidebar */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#070707] overflow-hidden flex flex-col justify-between">
            <div>
              {/* Title block */}
              <div className="p-6 border-b border-white/[0.04]">
                <div className="flex items-start gap-3.5">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                    <Icon icon="carbon:chat" width={20} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-bold text-white leading-snug">{selectedTicket.subject}</p>
                    <p className="text-xs text-white/35 mt-1 font-mono">Talep #{ticketNum} LBDev</p>
                  </div>
                </div>
              </div>

              {/* Meta rows — white icons */}
              <div className="divide-y divide-white/[0.04]">
                {[
                  {
                    icon: "carbon:circle-dash",
                    iconColor: "text-white",
                    label: "Durum",
                    value: (
                      <span className={cn("rounded-md px-2.5 py-1 text-xs font-bold", sc.bg, sc.color)}>
                        {sc.label}
                      </span>
                    ),
                  },
                  {
                    icon: "carbon:flag-filled",
                    iconColor: "text-white",
                    label: "Öncelik",
                    value: (
                      <span className={cn("rounded-md px-2.5 py-1 text-xs font-bold",
                        selectedTicket.priority === "urgent" ? "bg-red-500/10 text-red-400" :
                        selectedTicket.priority === "high"   ? "bg-orange-500/10 text-orange-400" :
                        selectedTicket.priority === "normal" ? "bg-blue-500/10 text-blue-400" :
                        "bg-white/[0.05] text-white/50"
                      )}>
                        {pc.label}
                      </span>
                    ),
                  },
                  {
                    icon: "carbon:calendar",
                    iconColor: "text-white",
                    label: "Oluşturulma",
                    value: <span className="text-sm text-white/70 font-medium">{new Date(selectedTicket.createdAt).toLocaleDateString("tr-TR")}</span>,
                  },
                  {
                    icon: "carbon:time",
                    iconColor: "text-white",
                    label: "Son Yanıt",
                    value: <span className="text-sm text-white/70 font-medium">{new Date(selectedTicket.lastActivityAt).toLocaleString("tr-TR")}</span>,
                  },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <Icon icon={row.icon} width={15} className={row.iconColor} />
                      <span className="text-sm text-white/40">{row.label}</span>
                    </div>
                    {row.value}
                  </div>
                ))}
              </div>

              {/* İlgilenen Yetkililer */}
              <div className="px-6 py-5 border-t border-white/[0.04]">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">İlgilenen Yetkililer</p>
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-xs font-bold text-white shadow-md">
                    K
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Destek Ekibi</p>
                    <p className="text-[11px] text-white/40">Aktif · Ortalama 2s yanıt</p>
                  </div>
                </div>
              </div>

              {/* Info notes */}
              <div className="px-6 py-5 border-t border-white/[0.04] space-y-3.5">
                {[
                  { icon: "carbon:checkmark-filled", color: "text-emerald-500", text: "Mesajlarınız anlık olarak destek ekibimize iletilir. Sayfayı yenilemenize gerek yoktur." },
                  { icon: "carbon:checkmark-filled", color: "text-emerald-500", text: "Tüm görüşme kaydı altına alınmaktadır." },
                  { icon: "carbon:time",             color: "text-amber-500",   text: "Mesai saatlerimiz 09:00 – 20:00 (TSİ). Bu saatler dışındaki taleplerde yanıtlar gecikebilir." },
                ].map((note, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Icon icon={note.icon} width={13} className={cn("shrink-0 mt-0.5", note.color)} />
                    <p className="text-xs text-white/45 leading-relaxed">{note.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Close ticket — kırmızı */}
            {selectedTicket.status !== "closed" && (
              <div className="p-5 border-t border-white/[0.04]">
                <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/[0.06] hover:bg-red-500/[0.12] px-4 py-3 text-sm font-semibold text-red-400 hover:text-red-300 transition-all duration-200">
                  <Icon icon="carbon:close-filled" width={15} />
                  Talebi Kapat
                </button>
              </div>
            )}
          </div>

          {/* RIGHT — Chat Area — same height as left sidebar */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#070707] overflow-hidden flex flex-col h-full">
            {/* Messages area — flex-1, internal scroll */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="flex flex-col space-y-5">
                {messagesLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
                    <p className="text-sm text-white/40">Mesajlar yükleniyor...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
                    <Icon icon="carbon:chat" width={40} className="text-white/10" />
                    <p className="text-sm text-white/40">Henüz mesaj yok</p>
                    <p className="text-xs text-white/25">Yanıtınızı aşağıya yazarak gönderebilirsiniz.</p>
                  </div>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full font-bold text-sm shadow-md",
                        m.isInternal
                          ? "bg-gradient-to-br from-teal-500 to-cyan-600 text-white"
                          : "bg-gradient-to-br from-violet-600 to-violet-500 text-white"
                      )}>
                        {m.isInternal ? "K" : "S"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-bold text-white">
                            {m.isInternal ? "Kaan Ö." : "Siz"}
                          </span>
                          <span className="text-[11px] text-white/30">
                            {new Date(m.createdAt).toLocaleString("tr-TR")}
                          </span>
                        </div>
                        {/* Bubble — auto-width, neutral tones */}
                        <div className={cn(
                          "rounded-2xl rounded-tl-sm text-sm leading-relaxed w-fit max-w-[85%] overflow-hidden",
                          m.isInternal
                            ? "bg-[#111] border border-white/[0.07] text-white/85"
                            : "bg-[#181818] border border-white/[0.09] text-white/90"
                        )}>
                          {m.body.startsWith("[IMG:") ? (
                            (() => {
                              const match = m.body.match(/\[IMG:(.+?):(.+)\]/)
                              if (!match) return <p className="px-4 py-3">{m.body}</p>
                              const [, name, src] = match
                              const textBefore = m.body.replace(/\[IMG:.+\]/, "").trim()
                              return (
                                <div>
                                  {textBefore && <p className="px-4 pt-3 pb-1">{textBefore}</p>}
                                  <img src={src} alt={name} className="max-w-[320px] max-h-[280px] object-contain" />
                                  <p className="px-4 py-1.5 text-[10px] text-white/30">{name}</p>
                                </div>
                              )
                            })()
                          ) : m.body.startsWith("[DOSYA:") ? (
                            <div className="flex items-center gap-2.5 px-4 py-3">
                              <Icon icon="carbon:document" width={16} className="text-white/50 shrink-0" />
                              <span>{m.body.replace("[DOSYA: ", "").replace("]", "")}</span>
                            </div>
                          ) : (
                            <p className="px-4 py-3">{m.body}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Reply input — always at bottom */}
            {selectedTicket.status !== "closed" && (
              <div className="border-t border-white/[0.04] p-4">
                <form onSubmit={handleReply}>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#0d0d0d] px-4 py-3 focus-within:border-white/20 transition-all">
                    {/* Attachment button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "shrink-0 transition-colors",
                        attachedFile ? "text-violet-400" : "text-white/30 hover:text-white/70"
                      )}
                      title="Dosya ekle"
                    >
                      <Icon icon="carbon:attachment" width={18} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf,.zip"
                      onChange={(e) => setAttachedFile(e.target.files?.[0] ?? null)}
                    />

                    <div className="flex-1 min-w-0">
                      {attachedFile && (
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Icon icon="carbon:document-attachment" width={12} className="text-violet-400" />
                          <span className="text-[11px] text-violet-400 truncate">{attachedFile.name}</span>
                          <button type="button" onClick={() => setAttachedFile(null)} className="text-white/30 hover:text-white/70 ml-1">
                            <Icon icon="carbon:close" width={11} />
                          </button>
                        </div>
                      )}
                      <input
                        type="text"
                        className="w-full bg-transparent text-sm text-white placeholder-white/25 outline-none"
                        placeholder="Yanıtınızı buraya yazın..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(e as never) }
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] text-white/25">{replyText.length}/1000</span>
                      <button
                        type="submit"
                        disabled={replying || (!replyText.trim() && !attachedFile)}
                        className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white disabled:opacity-30 transition-all shadow-lg shadow-violet-900/30"
                      >
                        <Icon icon="carbon:send-filled" width={16} />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ─── TICKET LIST VIEW ────────────────────────────────────────────────────
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Destek Talepleri</h1>
        <button
          onClick={() => setView("new")}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-900/30 transition-all duration-200"
        >
          <Icon icon="carbon:add-alt" width={14} />
          Talep Oluştur
        </button>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] px-5 py-3.5 flex items-center gap-3">
          <Icon icon="carbon:checkmark-filled" width={16} className="text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-400">{successMsg}</p>
          <button onClick={() => setSuccessMsg("")} className="ml-auto text-emerald-400/50 hover:text-emerald-400">
            <Icon icon="carbon:close" width={14} />
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-white/[0.02] animate-pulse" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-[#070707] p-16 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/[0.06]">
            <Icon icon="carbon:chat" width={26} className="text-violet-400" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-white/90">Henüz destek talebi yok</h3>
          <p className="mt-1.5 text-xs text-white/35 max-w-xs mx-auto">
            Bir sorunla karşılaştığında hızlıca destek talebi oluşturabilirsin.
          </p>
          <button
            onClick={() => setView("new")}
            className="mt-5 flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 px-6 py-2.5 text-xs font-bold text-white mx-auto shadow-lg shadow-violet-900/30 transition-all"
          >
            <Icon icon="carbon:add" width={14} />
            İlk talebi oluştur
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] bg-[#070707] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.04] text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] bg-black/25">
                  <th className="px-6 py-4">Talep Numarası</th>
                  <th className="px-6 py-4">Konu</th>
                  <th className="px-6 py-4">Öncelik</th>
                  <th className="px-6 py-4">Durum</th>
                  <th className="px-6 py-4">Son Yanıt</th>
                  <th className="px-6 py-4 text-center">Eylemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {tickets.map((ticket) => {
                  const sc = statusConfigs[ticket.status] ?? statusConfigs.open
                  const pc = priorityConfigs[ticket.priority] ?? priorityConfigs.normal
                  const formattedNum = ticket.id.slice(0, 4).toUpperCase()

                  return (
                    <tr
                      key={ticket.id}
                      className="hover:bg-white/[0.01] transition-all duration-150 group"
                    >
                      {/* Talep No */}
                      <td className="px-6 py-4 font-mono text-sm font-bold text-white">
                        {formattedNum}
                      </td>

                      {/* Konu */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-white truncate max-w-[280px]">
                          {ticket.subject}
                        </p>
                      </td>

                      {/* Öncelik */}
                      <td className="px-6 py-4 text-xs font-semibold">
                        <span className={pc.color}>{pc.label}</span>
                      </td>

                      {/* Durum */}
                      <td className="px-6 py-4 text-xs font-semibold">
                        <span className={sc.color}>{sc.label}</span>
                      </td>

                      {/* Son Yanıt */}
                      <td className="px-6 py-4 text-xs text-white/70 font-mono">
                        {new Date(ticket.lastActivityAt).toLocaleString("tr-TR")}
                      </td>

                      {/* Eylemler */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openTicketDetail(ticket)}
                          className="inline-flex size-8 items-center justify-center rounded-full border border-white/10 text-white/40 hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-400 transition-all duration-150"
                        >
                          <Icon icon="carbon:view" width={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}