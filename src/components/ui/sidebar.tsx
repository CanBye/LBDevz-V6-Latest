"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

/* ─── Constants ─────────────────────────────────── */
const SIDEBAR_WIDTH = 260
const SIDEBAR_WIDTH_COLLAPSED = 56
const SIDEBAR_COOKIE = "sidebar_state"

/* ─── Context ───────────────────────────────────── */
interface SidebarCtx {
  open: boolean
  setOpen: (v: boolean) => void
  toggle: () => void
  isMobile: boolean
}

const SidebarContext = React.createContext<SidebarCtx>({
  open: true, setOpen: () => {}, toggle: () => {}, isMobile: false,
})

export function useSidebar() { return React.useContext(SidebarContext) }

/* ─── Provider ──────────────────────────────────── */
export function SidebarProvider({ children, defaultOpen = true }: { children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpenState] = React.useState(() => {
    if (typeof window === "undefined") return defaultOpen
    try { return localStorage.getItem(SIDEBAR_COOKIE) !== "false" } catch { return defaultOpen }
  })
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  function setOpen(v: boolean) {
    setOpenState(v)
    try { localStorage.setItem(SIDEBAR_COOKIE, String(v)) } catch {}
  }

  return (
    <SidebarContext.Provider value={{ open: isMobile ? false : open, setOpen, toggle: () => setOpen(!open), isMobile }}>
      <div style={{ "--sidebar-width": `${SIDEBAR_WIDTH}px`, "--sidebar-width-collapsed": `${SIDEBAR_WIDTH_COLLAPSED}px` } as React.CSSProperties}>
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

/* ─── Sidebar ───────────────────────────────────── */
export function Sidebar({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open } = useSidebar()
  return (
    <motion.aside
      animate={{ width: open ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_COLLAPSED }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "hidden md:flex flex-col h-screen sticky top-0 bg-[#060606] border-r border-white/[0.06] text-white shrink-0 select-none overflow-hidden z-40",
        className
      )}
    >
      {children}
    </motion.aside>
  )
}

/* ─── Rail ──────────────────────────────────────── */
export function SidebarRail({ className }: { className?: string }) {
  const { toggle } = useSidebar()
  return (
    <button
      onClick={toggle}
      aria-label="Toggle sidebar"
      className={cn("absolute inset-y-0 right-0 w-1 cursor-col-resize hover:bg-white/10 transition-colors z-10", className)}
    />
  )
}

/* ─── Inset (main content wrapper) ─────────────── */
export function SidebarInset({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <main className={cn("flex-1 min-w-0 flex flex-col overflow-hidden", className)}>
      {children}
    </main>
  )
}

/* ─── Trigger ───────────────────────────────────── */
export function SidebarTrigger({ className }: { className?: string }) {
  const { toggle, open } = useSidebar()
  return (
    <button
      onClick={toggle}
      className={cn("flex size-7 items-center justify-center rounded-md hover:bg-white/[0.06] text-white/40 hover:text-white transition-colors border border-white/[0.04]", className)}
    >
      <Icon icon={open ? "carbon:chevron-left" : "carbon:chevron-right"} width={14} />
    </button>
  )
}

/* ─── Header / Footer / Content ─────────────────── */
export function SidebarHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("flex items-center h-16 px-4 border-b border-white/[0.04] shrink-0", className)}>{children}</div>
}

export function SidebarFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-4 border-t border-white/[0.04] bg-[#040404] shrink-0", className)}>{children}</div>
}

export function SidebarContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("flex-1 min-h-0 overflow-y-auto py-4 px-2 space-y-6", className)}>{children}</div>
}

export function SidebarSeparator({ className }: { className?: string }) {
  return <div className={cn("mx-2 h-px bg-white/[0.05]", className)} />
}

/* ─── Group ─────────────────────────────────────── */
export function SidebarGroup({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("space-y-1", className)}>{children}</div>
}

export function SidebarGroupLabel({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open } = useSidebar()
  return (
    <AnimatePresence>
      {open && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={cn("px-3 py-1 text-[10px] font-bold text-white/20 uppercase tracking-[0.25em]", className)}
        >
          {children}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

/* ─── Menu ──────────────────────────────────────── */
export function SidebarMenu({ className, children }: { className?: string; children: React.ReactNode }) {
  return <ul className={cn("space-y-0.5", className)}>{children}</ul>
}

export function SidebarMenuItem({ className, children }: { className?: string; children: React.ReactNode }) {
  return <li className={cn("relative", className)}>{children}</li>
}

interface SidebarMenuButtonProps {
  className?: string
  children: React.ReactNode
  isActive?: boolean
  disabled?: boolean
  tooltip?: string
  asChild?: boolean
  onClick?: () => void
}

export function SidebarMenuButton({
  className, children, isActive, disabled, tooltip, onClick,
}: SidebarMenuButtonProps) {
  const { open } = useSidebar()
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 relative",
        isActive ? "bg-white/[0.07] text-white" : disabled ? "text-white/20 cursor-not-allowed" : "text-white/45 hover:bg-white/[0.03] hover:text-white/80",
        className
      )}
    >
      {children}
      {!open && tooltip && (
        <div className="absolute left-14 bg-[#0a0a0a] border border-white/[0.08] text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-2 group-hover:translate-x-0 duration-200 font-medium shadow-xl z-50 whitespace-nowrap">
          {tooltip}
        </div>
      )}
    </button>
  )
}

export function SidebarMenuBadge({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open } = useSidebar()
  if (!open) return null
  return (
    <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider", className)}>
      {children}
    </span>
  )
}