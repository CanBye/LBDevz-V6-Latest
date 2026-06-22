"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Icon } from "@iconify/react"
import { useLanguage } from "@/lib/language-context"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions"

interface SidebarItem {
  href: string
  label: string
  icon: string
  badge?: string
  badgeColor?: string
  permission?: string
}

interface SidebarSection {
  title: string
  items: SidebarItem[]
}

interface BadgeCounts { applications: number; tickets: number; topups: number }

interface AdminSidebarProps {
  isSuperAdmin: boolean
  permissions: string[] | null
}

export function AdminSidebar({ isSuperAdmin, permissions }: AdminSidebarProps) {
  const pathname = usePathname()
  const { t } = useLanguage()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)
  const [badges, setBadges] = useState<BadgeCounts>({ applications: 0, tickets: 0, topups: 0 })

  useEffect(() => {
    const saved = localStorage.getItem("admin_sidebar_collapsed")
    if (saved === "true") setCollapsed(true)
  }, [])

  useEffect(() => {
    const load = () => fetch("/api/admin/badges").then(r => r.json()).then(d => setBadges(d)).catch(() => {})
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  const toggleCollapse = () => {
    const nextState = !collapsed
    setCollapsed(nextState)
    localStorage.setItem("admin_sidebar_collapsed", String(nextState))
  }

  // Helper: should a nav item be shown?
  function canSee(perm?: string): boolean {
    if (!perm) return true                         // no permission needed (e.g. separator sections)
    if (isSuperAdmin || permissions === null) return true  // super admin sees everything
    return permissions.includes(perm)
  }

  const sections: SidebarSection[] = [
    {
      title: "Core",
      items: [
        { href: "/admin",           label: t("adminDashboard"), icon: "carbon:dashboard",       permission: ADMIN_PERMISSIONS.DASHBOARD },
        { href: "/admin/orders",    label: t("adminOrders"),    icon: "carbon:receipt",          permission: ADMIN_PERMISSIONS.ORDERS },
        { href: "/admin/products",  label: t("adminProducts"),  icon: "carbon:cube",             permission: ADMIN_PERMISSIONS.PRODUCTS },
        { href: "/admin/customers", label: t("adminCustomers"), icon: "carbon:user-multiple",    permission: ADMIN_PERMISSIONS.CUSTOMERS },
        ...(badges.topups > 0
          ? [{ href: "/admin/topups", label: t("adminTopups"), icon: "carbon:wallet", badge: String(badges.topups), badgeColor: "bg-amber-500/10 text-amber-400 animate-pulse", permission: ADMIN_PERMISSIONS.TOPUPS }]
          : [{ href: "/admin/topups", label: t("adminTopups"), icon: "carbon:wallet", permission: ADMIN_PERMISSIONS.TOPUPS }]),
      ],
    },
    {
      title: "Support",
      items: [
        ...(badges.tickets > 0
          ? [{ href: "/admin/tickets", label: t("adminTickets"), icon: "carbon:customer-service", badge: String(badges.tickets), badgeColor: "bg-red-500/10 text-red-400 animate-pulse", permission: ADMIN_PERMISSIONS.TICKETS }]
          : [{ href: "/admin/tickets", label: t("adminTickets"), icon: "carbon:customer-service", permission: ADMIN_PERMISSIONS.TICKETS }]),
        { href: "/admin/yetkilialim",  label: "Yetkili Alım",    icon: "carbon:badge",            permission: ADMIN_PERMISSIONS.YETKILIALIM },
        { href: "/admin/coupons",      label: "Kuponlar",        icon: "carbon:tag",              permission: ADMIN_PERMISSIONS.COUPONS },
        { href: "/admin/roles",        label: "Rol Yönetimi",    icon: "carbon:user-role",        permission: ADMIN_PERMISSIONS.ROLES },
        { href: "/admin/source-codes", label: "Kaynak Kodları",  icon: "carbon:code",             permission: ADMIN_PERMISSIONS.SOURCE_CODES },
      ],
    },
    {
      title: "Site",
      items: [
        { href: "/admin/agreements",    label: "Sözleşmeler",       icon: "carbon:document-signed",  permission: ADMIN_PERMISSIONS.AGREEMENTS },
        { href: "/admin/reviews",       label: "Yorumlar",           icon: "carbon:star",             permission: ADMIN_PERMISSIONS.REVIEWS },
        { href: "/admin/team",          label: "Takım",              icon: "carbon:group",            permission: ADMIN_PERMISSIONS.TEAM },
        { href: "/admin/blog",          label: "Blog / Duyurular",   icon: "carbon:document",         permission: ADMIN_PERMISSIONS.BLOG },
        { href: "/admin/forum",         label: "Forum",              icon: "carbon:forum",            permission: ADMIN_PERMISSIONS.FORUM },
        { href: "/admin/site-settings", label: "Site Ayarları",      icon: "carbon:settings-adjust",  permission: ADMIN_PERMISSIONS.SITE_SETTINGS },
        { href: "/admin/webhooks",      label: "Webhooks",           icon: "carbon:webhook",          permission: ADMIN_PERMISSIONS.WEBHOOKS },
        { href: "/admin/notifications", label: "Bildirimler",        icon: "carbon:notification",     permission: ADMIN_PERMISSIONS.NOTIFICATIONS },
      ],
    },
    {
      title: "Analytics",
      items: [
        { href: "/admin/analytics", label: "Analizler",        icon: "carbon:analytics", permission: ADMIN_PERMISSIONS.ANALYTICS },
        { href: "/admin/revenue",   label: t("adminRevenue"),  icon: "carbon:finance",   permission: ADMIN_PERMISSIONS.REVENUE },
      ],
    },
    {
      title: "Settings",
      items: [
        { href: "/admin/settings", label: t("adminSettings"), icon: "carbon:settings", permission: ADMIN_PERMISSIONS.SETTINGS },
      ],
    },
  ]

  // Tüm öğeleri göster, yetkisizleri kilit ikonu ile işaretle
  const visibleSections = sections

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "hidden md:flex flex-col h-screen sticky top-0 bg-[#060606] border-r border-white/[0.06] text-white shrink-0 select-none overflow-hidden z-40"
      )}
    >
      {/* Sidebar Header */}
      <div className={cn("flex h-16 items-center px-5 justify-between border-b border-white/[0.04]", collapsed && "justify-center px-0")}>
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2.5"
            >
              <Image src="/assets/logo/b84c67691b790165f484dc3a5893be55.png" alt="LBDev" width={28} height={28} className="rounded-lg" />
              <span className="text-sm font-bold tracking-wider uppercase bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">LBDEV</span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <Image src="/assets/logo/b84c67691b790165f484dc3a5893be55.png" alt="LBDev" width={28} height={28} className="rounded-lg" />
            </motion.div>
          )}
        </AnimatePresence>

        {!collapsed && (
          <button
            onClick={toggleCollapse}
            className="flex size-6 items-center justify-center rounded-md hover:bg-white/[0.06] text-white/40 hover:text-white transition-colors border border-white/[0.04]"
          >
            <Icon icon="carbon:chevron-left" width={14} />
          </button>
        )}
      </div>

      {/* Sidebar Items */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-7 scrollbar-none">
        {visibleSections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold text-white/20 uppercase tracking-[0.25em]">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href
                const locked = !canSee(item.permission)
                const inner = (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        icon={item.icon}
                        width={18}
                        className={cn(
                          "shrink-0",
                          locked ? "text-white/15" : active ? "text-white" : "text-white/45 group-hover:text-white/80 transition-transform group-hover:scale-105 duration-200"
                        )}
                      />
                      {!collapsed && (
                        <span className="transition-all duration-150">{item.label}</span>
                      )}
                    </div>
                    {!collapsed && (
                      locked
                        ? <Icon icon="carbon:locked" width={13} className="text-white/20 shrink-0" />
                        : item.badge
                          ? <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider scale-95", item.badgeColor)}>{item.badge}</span>
                          : null
                    )}

                    {/* Tooltip for collapsed mode */}
                    {collapsed && (
                      <div className="absolute left-14 bg-[#0a0a0a] border border-white/[0.08] text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-2 group-hover:translate-x-0 duration-250 font-medium shadow-xl z-50 whitespace-nowrap">
                        {item.label}{locked ? " 🔒" : item.badge ? ` (${item.badge})` : ""}
                      </div>
                    )}
                  </>
                )

                return (
                  <li key={item.href}>
                    {locked ? (
                      <div className={cn(
                        "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium relative group cursor-not-allowed",
                        "text-white/20"
                      )}>
                        {inner}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 relative group",
                          active
                            ? "bg-white/[0.06] text-white"
                            : "text-white/45 hover:bg-white/[0.02] hover:text-white/80"
                        )}
                      >
                        {inner}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className={cn("p-4 border-t border-white/[0.04] bg-[#040404] flex items-center justify-between", collapsed && "justify-center p-3")}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 text-xs font-bold shrink-0 overflow-hidden">
              {session?.user?.image
                ? <img src={session.user.image} alt="" className="h-full w-full object-cover" />
                : <span>{(session?.user?.name ?? "A")[0].toUpperCase()}</span>}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white/80 truncate">{session?.user?.name ?? "Admin"}</p>
              <p className="text-[10px] text-white/35 truncate">{session?.user?.email ?? ""}</p>
            </div>
          </div>
        )}

        {collapsed ? (
          <button
            onClick={toggleCollapse}
            className="flex size-8 items-center justify-center rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-all border border-white/[0.04]"
          >
            <Icon icon="carbon:chevron-right" width={16} />
          </button>
        ) : (
          <Link
            href="/dashboard"
            className="flex size-7 items-center justify-center rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-all border border-white/[0.04]"
            title="Dashboard'a Dön"
          >
            <Icon icon="carbon:exit" width={15} />
          </Link>
        )}
      </div>
    </motion.aside>
  )
}