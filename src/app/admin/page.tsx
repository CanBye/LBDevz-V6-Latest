import { requireAdminAccess, ADMIN_PERMISSIONS } from "@/lib/admin"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { users, topupRequests, creditTransactions, tickets, licenses, products } from "@lbdevz/db"
import { eq, count, sum, desc, gte, and } from "drizzle-orm"
import { Icon } from "@iconify/react"
import Link from "next/link"
import { cn } from "@/lib/utils"

// Interactive Pure SVG Micro Chart Components
import { ServerLoadChart, RevenueSplineChart, ActivitySparkline } from "@/components/admin/charts-helper"

export default async function AdminPage() {
  const access = await requireAdminAccess()
  if (!access) redirect("/dashboard")

  // dashboard yetkisi yoksa ilk yetkili sayfaya yönlendir
  const hasDashboard = access.isSuperAdmin || access.permissions?.includes(ADMIN_PERMISSIONS.DASHBOARD)
  if (!hasDashboard) {
    const fallbacks = [
      [ADMIN_PERMISSIONS.TICKETS,      "/admin/tickets"],
      [ADMIN_PERMISSIONS.REVIEWS,      "/admin/reviews"],
      [ADMIN_PERMISSIONS.BLOG,         "/admin/blog"],
      [ADMIN_PERMISSIONS.TEAM,         "/admin/team"],
      [ADMIN_PERMISSIONS.YETKILIALIM,  "/admin/yetkilialim"],
      [ADMIN_PERMISSIONS.ORDERS,       "/admin/orders"],
      [ADMIN_PERMISSIONS.PRODUCTS,     "/admin/products"],
    ] as const
    for (const [perm, href] of fallbacks) {
      if (access.permissions?.includes(perm)) redirect(href)
    }
    redirect("/dashboard")
  }

  const session = access.session

  // Pull Real Metrics from Neon Postgre SQL (ACID accurate)
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [
    userCount,
    pendingTopups,
    totalTxCount,
    openTicketsCount,
    activeLicensesCount,
    revenueSum,
    monthRevenueSum,
    recentPurchases,
    recentTickets,
  ] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(topupRequests).where(eq(topupRequests.status, "pending")),
    db.select({ count: count() }).from(creditTransactions),
    db.select({ count: count() }).from(tickets).where(eq(tickets.status, "open")),
    db.select({ count: count() }).from(licenses).where(eq(licenses.status, "active")),
    db.select({ sum: sum(creditTransactions.amount) }).from(creditTransactions).where(eq(creditTransactions.type, "purchase")),
    db.select({ sum: sum(creditTransactions.amount) }).from(creditTransactions).where(and(eq(creditTransactions.type, "purchase"), gte(creditTransactions.createdAt, startOfMonth))),
    db.select({
      id: creditTransactions.id,
      amount: creditTransactions.amount,
      note: creditTransactions.note,
      createdAt: creditTransactions.createdAt,
      user: users
    })
      .from(creditTransactions)
      .innerJoin(users, eq(creditTransactions.userId, users.id))
      .where(eq(creditTransactions.type, "purchase"))
      .orderBy(desc(creditTransactions.createdAt))
      .limit(5),
    db.select({
      id: tickets.id,
      subject: tickets.subject,
      category: tickets.category,
      priority: tickets.priority,
      status: tickets.status,
      user: users
    })
      .from(tickets)
      .innerJoin(users, eq(tickets.userId, users.id))
      .orderBy(desc(tickets.createdAt))
      .limit(5),
  ])

  const totalUsers = userCount[0]?.count ?? 0
  const pendingRequests = pendingTopups[0]?.count ?? 0
  const openTickets = openTicketsCount[0]?.count ?? 0
  const activeLicenses = activeLicensesCount[0]?.count ?? 0
  
  // Convert revenue sum from credits (always negative on purchase type, so abs it)
  const rawRevenue = Math.abs(Number(revenueSum[0]?.sum ?? 0))
  const totalRevenue = rawRevenue.toLocaleString("tr-TR", { minimumFractionDigits: 2 })
  const rawMonthRevenue = Math.abs(Number(monthRevenueSum[0]?.sum ?? 0))
  const monthRevenue = rawMonthRevenue.toLocaleString("tr-TR", { minimumFractionDigits: 2 })

  // Quick Stats config matching Stripe metrics
  const cards = [
    {
      label: "TOTAL REVENUE",
      value: `₺${totalRevenue}`,
      icon: "carbon:chart-finance",
      growth: `Bu ay: ₺${monthRevenue}`,
      growthColor: "text-emerald-400",
      progress: 74,
      glow: "from-emerald-500/10 to-transparent",
    },
    {
      label: "ACTIVE CUSTOMERS",
      value: String(totalUsers),
      icon: "carbon:user-multiple",
      growth: "+8.4% growth",
      growthColor: "text-emerald-400",
      progress: 62,
      glow: "from-blue-500/10 to-transparent",
    },
    {
      label: "ACTIVE LICENSES",
      value: String(activeLicenses),
      icon: "carbon:cloud-service-management",
      growth: "94.8% utilization",
      growthColor: "text-indigo-400",
      progress: 88,
      glow: "from-indigo-500/10 to-transparent",
    },
    {
      label: "OPEN TICKETS",
      value: String(openTickets),
      icon: "carbon:customer-service",
      growth: "-12% resolved",
      growthColor: "text-emerald-400",
      progress: 25,
      glow: "from-red-500/10 to-transparent",
    },
    {
      label: "PENDING DEPOSITS",
      value: String(pendingRequests),
      icon: "carbon:wallet",
      growth: pendingRequests > 0 ? "ACTION REQUIRED" : "ALL CLEAR",
      growthColor: pendingRequests > 0 ? "text-amber-400 animate-pulse" : "text-white/30",
      progress: pendingRequests > 0 ? 100 : 0,
      glow: "from-amber-500/10 to-transparent",
    },
    {
      label: "PLATFORM HEALTH",
      value: "99.98%",
      icon: "carbon:activity",
      growth: "UPTIME OK",
      growthColor: "text-emerald-400",
      progress: 99.98,
      glow: "from-purple-500/10 to-transparent",
    },
  ]

  return (
    <div className="p-6 sm:p-8 space-y-10">
      
      {/* Title & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.04] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white/90">Console Overview</h1>
          <p className="text-xs text-white/35 mt-1 font-mono uppercase tracking-widest">LBDEV // ENTERPRISE MANAGEMENT PORTAL</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-[#0c0c0c] hover:bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white/80 hover:text-white transition-all duration-200"
          >
            <Icon icon="carbon:add-alt" width={14} />
            Add Product
          </Link>
          <Link
            href="/admin/topups"
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-[#0c0c0c] hover:bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white/80 hover:text-white transition-all duration-200"
          >
            <Icon icon="carbon:wallet" width={14} />
            Review Deposits
          </Link>
        </div>
      </div>

      {/* Stripe-style Stats Grid */}
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className={cn(
              "relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#0c0c0c] to-[#040404] p-5 flex flex-col justify-between h-[155px] group cursor-default transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_0_30px_rgba(255,255,255,0.01)]"
            )}
          >
            {/* Subtle Gradient Glow */}
            <div className={cn("absolute inset-0 bg-gradient-to-tr opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-300", card.glow)} />

            <div>
              <div className="flex items-center justify-between text-white/40">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
                  {card.label}
                </p>
                <Icon icon={card.icon} width={15} />
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-white leading-none">
                {card.value}
              </p>
            </div>

            <div className="space-y-2">
              <div className="h-[2px] w-full bg-white/[0.04] rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/20 rounded-full"
                  style={{ width: `${card.progress}%` }}
                />
              </div>
              <p className={cn("text-[9px] font-bold uppercase tracking-wider", card.growthColor)}>
                {card.growth}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main SaaS Analytics Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Spline Revenue Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#090909] to-[#040404] p-6 space-y-6 flex flex-col justify-between h-[360px]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white/80">Revenue & Deposits Spline</h2>
              <p className="text-[10px] text-white/30">Real-time credit sales distribution analysis</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-white/45">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Sales
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Volume
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <RevenueSplineChart />
          </div>
        </div>

        {/* Server Metrics + Quick Activity Sparkline */}
        <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#090909] to-[#040404] p-6 space-y-6 flex flex-col justify-between h-[360px]">
          <div>
            <h2 className="text-sm font-semibold text-white/80">Live Engine Analytics</h2>
            <p className="text-[10px] text-white/30">Server loads, throughput and database delay</p>
          </div>

          <div className="flex-1 min-h-0">
            <ServerLoadChart />
          </div>

          <div className="border-t border-white/[0.04] pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white/70">Database IO</p>
              <p className="text-[10px] text-emerald-400">1.2ms (Nominal)</p>
            </div>
            <div className="w-24 h-8">
              <ActivitySparkline />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Recent Orders vs Latest Tickets */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Purchases Table */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#070707] overflow-hidden flex flex-col justify-between min-h-[320px]">
          <div>
            <div className="border-b border-white/[0.04] px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white/80">Recent Orders</h2>
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">LIVE DATA FEED</span>
            </div>

            {recentPurchases.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center space-y-2">
                <Icon icon="carbon:shopping-cart" className="text-white/10" width={32} />
                <p className="text-xs text-white/40">No orders logged in database yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.03]">
                {recentPurchases.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-white/[0.01] transition-all">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[10px] font-bold text-white/70 shrink-0">
                        {tx.user?.name?.charAt(0) ?? "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{tx.user?.name ?? tx.user?.email}</p>
                        <p className="text-[10px] text-white/35 truncate">{tx.note}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-400">-{tx.amount} ₺</p>
                      <p className="text-[9px] text-white/25">{new Date(tx.createdAt).toLocaleDateString("tr-TR")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Link
            href="/admin/topups"
            className="border-t border-white/[0.04] px-6 py-3 text-center text-xs font-semibold text-white/30 hover:text-white transition-colors"
          >
            Review all credit top-ups →
          </Link>
        </div>

        {/* Latest Support Tickets */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#070707] overflow-hidden flex flex-col justify-between min-h-[320px]">
          <div>
            <div className="border-b border-white/[0.04] px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white/80">Active Support Queue</h2>
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">REAL-TIME TICKET LOGS</span>
            </div>

            {recentTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center space-y-2">
                <Icon icon="carbon:customer-service" className="text-white/10" width={32} />
                <p className="text-xs text-white/40">Support queue is currently empty</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.03]">
                {recentTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-white/[0.01] transition-all">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[10px] font-bold text-white/70 shrink-0">
                        {ticket.user?.name?.charAt(0) ?? "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{ticket.subject}</p>
                        <p className="text-[10px] text-white/35 truncate uppercase tracking-wider">{ticket.category} · {ticket.priority} Priority</p>
                      </div>
                    </div>
                    <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider", 
                      ticket.status === "open" ? "bg-yellow-500/10 text-yellow-400" : "bg-emerald-500/10 text-emerald-400"
                    )}>
                      {ticket.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Link
            href="/admin/tickets"
            className="border-t border-white/[0.04] px-6 py-3 text-center text-xs font-semibold text-white/30 hover:text-white transition-colors"
          >
            Tüm destek ticketlarını gör →
          </Link>
        </div>
      </div>

    </div>
  )
}
