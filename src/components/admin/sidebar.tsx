"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Icon } from "@iconify/react"
import { useLanguage } from "@/lib/language-context"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions"
import {
  Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarRail,
  SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem,
  SidebarMenuButton, SidebarMenuBadge, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar"

interface SidebarItem {
  href: string; label: string; icon: string
  badge?: string; badgeColor?: string; permission?: string
}
interface SidebarSection { title: string; items: SidebarItem[] }
interface BadgeCounts { applications: number; tickets: number; topups: number }

interface AdminSidebarProps { isSuperAdmin: boolean; permissions: string[] | null }

function SidebarLogo() {
  const { open } = useSidebar()
  return (
    <div className="flex flex-1 items-center gap-2.5 overflow-hidden">
      <Image src="/assets/logo/b84c67691b790165f484dc3a5893be55.png" alt="LBDev" width={26} height={26} className="rounded-lg shrink-0" />
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
            className="text-sm font-bold tracking-wider uppercase bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent whitespace-nowrap"
          >
            LBDEV
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

function NavItem({ item, active, locked }: { item: SidebarItem; active: boolean; locked: boolean }) {
  const { open } = useSidebar()

  const inner = (
    <>
      <div className="flex items-center gap-3">
        <Icon
          icon={item.icon}
          width={18}
          className={
            locked ? "text-white/15 shrink-0" :
            active ? "text-white shrink-0" :
            "text-white/45 group-hover:text-white/80 shrink-0 transition-colors"
          }
        />
        <AnimatePresence>
          {open && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="truncate"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      {open && (
        locked
          ? <Icon icon="carbon:locked" width={12} className="text-white/20 shrink-0" />
          : item.badge
            ? <SidebarMenuBadge className={item.badgeColor}>{item.badge}</SidebarMenuBadge>
            : null
      )}
      {!open && (
        <div className="absolute left-14 bg-[#0a0a0a] border border-white/[0.08] text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-2 group-hover:translate-x-0 duration-200 font-medium shadow-xl z-50 whitespace-nowrap">
          {item.label}{locked ? " 🔒" : item.badge ? ` (${item.badge})` : ""}
        </div>
      )}
    </>
  )

  if (locked) {
    return (
      <SidebarMenuButton disabled tooltip={item.label + " 🔒"} className="flex items-center justify-between">
        {inner}
      </SidebarMenuButton>
    )
  }

  return (
    <Link
      href={item.href}
      className={
        `group flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 relative ` +
        (active ? "bg-white/[0.07] text-white" : "text-white/45 hover:bg-white/[0.03] hover:text-white/80")
      }
    >
      {inner}
    </Link>
  )
}

export function AdminSidebar({ isSuperAdmin, permissions }: AdminSidebarProps) {
  const pathname = usePathname()
  const { t } = useLanguage()
  const { data: session } = useSession()
  const { open } = useSidebar()
  const [badges, setBadges] = useState<BadgeCounts>({ applications: 0, tickets: 0, topups: 0 })

  useEffect(() => {
    const load = () => fetch("/api/admin/badges").then(r => r.json()).then(d => setBadges(d)).catch(() => {})
    load()
    const iv = setInterval(load, 30000)
    return () => clearInterval(iv)
  }, [])

  function canSee(perm?: string) {
    if (!perm) return true
    if (isSuperAdmin || permissions === null) return true
    return permissions.includes(perm)
  }

  const sections: SidebarSection[] = [
    {
      title: "Core",
      items: [
        { href: "/admin",           label: t("adminDashboard"), icon: "carbon:dashboard",    permission: ADMIN_PERMISSIONS.DASHBOARD },
        { href: "/admin/orders",    label: t("adminOrders"),    icon: "carbon:receipt",      permission: ADMIN_PERMISSIONS.ORDERS },
        { href: "/admin/products",  label: t("adminProducts"),  icon: "carbon:cube",         permission: ADMIN_PERMISSIONS.PRODUCTS },
        { href: "/admin/customers", label: t("adminCustomers"), icon: "carbon:user-multiple", permission: ADMIN_PERMISSIONS.CUSTOMERS },
        { href: "/admin/topups",    label: t("adminTopups"),    icon: "carbon:wallet",       permission: ADMIN_PERMISSIONS.TOPUPS,
          ...(badges.topups > 0 ? { badge: String(badges.topups), badgeColor: "bg-amber-500/10 text-amber-400 animate-pulse" } : {}) },
      ],
    },
    {
      title: "Support",
      items: [
        { href: "/admin/tickets",      label: t("adminTickets"), icon: "carbon:customer-service", permission: ADMIN_PERMISSIONS.TICKETS,
          ...(badges.tickets > 0 ? { badge: String(badges.tickets), badgeColor: "bg-red-500/10 text-red-400 animate-pulse" } : {}) },
        { href: "/admin/yetkilialim",  label: "Yetkili Alım",   icon: "carbon:badge",            permission: ADMIN_PERMISSIONS.YETKILIALIM },
        { href: "/admin/coupons",      label: "Kuponlar",        icon: "carbon:tag",              permission: ADMIN_PERMISSIONS.COUPONS },
        { href: "/admin/roles",        label: "Rol Yönetimi",   icon: "carbon:user-role",        permission: ADMIN_PERMISSIONS.ROLES },
        { href: "/admin/source-codes", label: "Kaynak Kodları", icon: "carbon:code",             permission: ADMIN_PERMISSIONS.SOURCE_CODES },
      ],
    },
    {
      title: "Site",
      items: [
        { href: "/admin/references",    label: "Referanslar",      icon: "carbon:star",            permission: ADMIN_PERMISSIONS.SITE_SETTINGS },
        { href: "/admin/agreements",    label: "Sözleşmeler",      icon: "carbon:document-signed", permission: ADMIN_PERMISSIONS.AGREEMENTS },
        { href: "/admin/reviews",       label: "Yorumlar",         icon: "carbon:chat",            permission: ADMIN_PERMISSIONS.REVIEWS },
        { href: "/admin/team",          label: "Takım",            icon: "carbon:group",           permission: ADMIN_PERMISSIONS.TEAM },
        { href: "/admin/blog",          label: "Blog / Duyurular", icon: "carbon:document",        permission: ADMIN_PERMISSIONS.BLOG },
        { href: "/admin/forum",         label: "Forum",            icon: "carbon:forum",           permission: ADMIN_PERMISSIONS.FORUM },
        { href: "/admin/site-settings", label: "Site Ayarları",   icon: "carbon:settings-adjust", permission: ADMIN_PERMISSIONS.SITE_SETTINGS },
        { href: "/admin/webhooks",      label: "Webhooks",         icon: "carbon:webhook",         permission: ADMIN_PERMISSIONS.WEBHOOKS },
        { href: "/admin/notifications", label: "Bildirimler",      icon: "carbon:notification",    permission: ADMIN_PERMISSIONS.NOTIFICATIONS },
      ],
    },
    {
      title: "Analytics",
      items: [
        { href: "/admin/analytics", label: "Analizler",       icon: "carbon:analytics", permission: ADMIN_PERMISSIONS.ANALYTICS },
        { href: "/admin/revenue",   label: t("adminRevenue"), icon: "carbon:finance",   permission: ADMIN_PERMISSIONS.REVENUE },
      ],
    },
    {
      title: "Settings",
      items: [
        { href: "/admin/settings", label: t("adminSettings"), icon: "carbon:settings", permission: ADMIN_PERMISSIONS.SETTINGS },
      ],
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="justify-between">
        <SidebarLogo />
        {open && <SidebarTrigger />}
      </SidebarHeader>

      <SidebarContent>
        {sections.map(section => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarMenu>
              {section.items.map(item => (
                <SidebarMenuItem key={item.href}>
                  <NavItem
                    item={item}
                    active={pathname === item.href}
                    locked={!canSee(item.permission)}
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className={`flex items-center ${open ? "justify-between gap-2" : "justify-center"}`}>
          {open && (
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
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
          {!open && (
            <button
              onClick={() => {}}
              className="flex size-8 items-center justify-center rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-all border border-white/[0.04]"
            >
              <SidebarTrigger />
            </button>
          )}
          {open && (
            <Link
              href="/dashboard"
              className="flex size-7 items-center justify-center rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-all border border-white/[0.04]"
              title="Dashboard'a Dön"
            >
              <Icon icon="carbon:exit" width={15} />
            </Link>
          )}
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}