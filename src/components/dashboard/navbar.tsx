"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"
import { Icon } from "@iconify/react"
import Image from "next/image"
import { LanguageSwitcher, UserMenu, NotificationMenu } from "@/components/layout/navbar/menus"

export function DashboardNavbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const { t } = useLanguage()

  const navItems = [
    { href: "/dashboard",             label: t("home"),            icon: "carbon:dashboard" },
    { href: "/dashboard/magaza",      label: t("hizmetSatinAl"),   icon: "carbon:shopping-cart" },
    { href: "/dashboard/lisanslarim", label: "Lisanslarım",        icon: "carbon:license" },
    { href: "/dashboard/urunlerim",   label: t("myProducts"),      icon: "carbon:cloud-service-management" },
    { href: "/dashboard/destek",      label: t("destekTalepleri"), icon: "carbon:customer-service" },
  ]

  const firstName = session?.user?.name ? session.user.name.split(" ")[0] : "User"

  return (
    <header className="sticky top-5 z-30 border-b border-white/[0.06] bg-black/95 backdrop-blur-sm text-white">
      <div className="mx-auto grid h-16 max-w-[1400px] grid-cols-[auto_1fr_auto] items-center gap-4 px-6 sm:px-10">

        {/* Left — Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image src="/assets/logo/b84c67691b790165f484dc3a5893be55.png" alt="LBDev" width={36} height={36} className="rounded-lg" />
        </Link>

        {/* Center — Nav links */}
        <nav className="hidden items-center justify-center gap-0.5 md:flex overflow-x-auto scrollbar-none">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150 whitespace-nowrap shrink-0",
                  active
                    ? "bg-white/[0.07] text-white"
                    : "text-white/40 hover:bg-white/[0.03] hover:text-white/75"
                )}
              >
                <Icon icon={item.icon} width={14} height={14} className="shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right — User */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="mr-1.5 hidden text-xs text-white/35 whitespace-nowrap lg:block">
            {t("welcomeBack")}, <span className="font-semibold text-white/65">{firstName}</span>
          </span>
          <LanguageSwitcher />
          <NotificationMenu />
          <UserMenu />
        </div>
      </div>

      {/* Mobile nav */}
      <div className="flex overflow-x-auto border-t border-white/[0.04] bg-black/60 px-2 py-1 md:hidden gap-0.5 scrollbar-none">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                active ? "bg-white/[0.06] text-white" : "text-white/40"
              )}
            >
              <Icon icon={item.icon} width={13} height={13} />
              {item.label}
            </Link>
          )
        })}
      </div>
    </header>
  )
}