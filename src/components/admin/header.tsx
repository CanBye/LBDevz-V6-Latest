"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Icon } from "@iconify/react"
import { NotificationMenu } from "@/components/layout/navbar/menus"

export function AdminHeader() {
  const pathname = usePathname()
  const [searchFocused, setSearchFocused] = useState(false)

  // Generate breadcrumbs from path
  const paths = pathname.split("/").filter(Boolean)
  const breadcrumbs = paths.map((path, idx) => {
    const href = "/" + paths.slice(0, idx + 1).join("/")
    return {
      href,
      label: path.charAt(0).toUpperCase() + path.slice(1),
    }
  })

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/[0.04] bg-[#030303]/80 backdrop-blur-md px-6 sm:px-8 select-none">
      {/* Left - Breadcrumbs & Search */}
      <div className="flex items-center gap-6">
        {/* Breadcrumbs */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium">
          <Link
            href="/admin"
            className="text-white/40 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <img src="/assets/logo/b84c67691b790165f484dc3a5893be55.png" alt="LBDev" width={16} height={16} className="rounded-sm opacity-60 hover:opacity-100 transition-opacity" />
            Console
          </Link>
          {breadcrumbs.map((b, idx) => (
            <div key={b.href} className="flex items-center gap-2">
              <Icon icon="carbon:chevron-right" width={12} className="text-white/20" />
              <Link
                href={b.href}
                className={cn(
                  "transition-colors",
                  idx === breadcrumbs.length - 1
                    ? "text-white/95 pointer-events-none font-semibold"
                    : "text-white/40 hover:text-white"
                )}
              >
                {b.label}
              </Link>
            </div>
          ))}
        </div>

        {/* Quick Search Bar */}
        <div
          className={cn(
            "relative hidden lg:flex items-center w-64 rounded-xl border border-white/[0.06] bg-[#080808] px-3.5 py-1.5 transition-all duration-200",
            searchFocused && "border-white/20 w-80 shadow-[0_0_20px_rgba(255,255,255,0.02)]"
          )}
        >
          <Icon icon="carbon:search" className="text-white/30" width={15} />
          <input
            type="text"
            placeholder="Command / Search..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="ml-2 w-full bg-transparent text-xs text-white placeholder-white/25 outline-none"
          />
          <div className="flex items-center gap-0.5 rounded border border-white/[0.08] bg-white/[0.02] px-1.5 py-0.5 font-mono text-[9px] text-white/30 shrink-0">
            <span className="scale-90 font-sans">⌘</span>K
          </div>
        </div>
      </div>

      {/* Right - Notification, Lang, Profile, Return */}
      <div className="flex items-center gap-3">
        {/* System Status Indicator */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-white/[0.04] bg-white/[0.01] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400 border-emerald-500/10">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          SECURE ENGINE ON
        </div>

        <NotificationMenu />

        {/* Admin Quick Action Portal Link */}
        <Link
          href="/dashboard"
          className="flex h-9 items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.06] px-4 text-xs font-semibold text-white/80 hover:text-white transition-all duration-200"
        >
          <Icon icon="carbon:home" width={14} />
          <span className="hidden sm:inline">Store Portal</span>
        </Link>
      </div>
    </header>
  )
}
