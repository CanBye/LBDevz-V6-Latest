"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface Settings {
  authorized_purchase_enabled: string
  authorized_purchase_label: string
  authorized_purchase_color: string
  authorized_purchase_link: string
}

export function AuthorizedPurchaseBanner() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    fetch("/api/site/settings")
      .then(r => r.json())
      .then(d => setSettings(d))
      .catch(() => {})
  }, [])

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard")) return null
  if (!settings || settings.authorized_purchase_enabled !== "true") return null

  const color = settings.authorized_purchase_color || "#a855f7"
  const label = settings.authorized_purchase_label || "Yetkili Alım Açıldı!"
  const link  = settings.authorized_purchase_link

  const inner = (
    <div
      className="flex w-full items-center justify-center gap-2.5 py-2.5 text-xs font-bold tracking-wide cursor-pointer transition-opacity hover:opacity-90"
      style={{ background: `linear-gradient(90deg, ${color}cc 0%, ${color} 50%, ${color}cc 100%)`, color: "#ffffff", borderBottom: `1px solid ${color}` }}
    >
      {/* Animated dot */}
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: color }} />
        <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: color }} />
      </span>
      {label}
      {link && (
        <span className="ml-1 underline underline-offset-2 opacity-70 text-[10px]">Detaylar →</span>
      )}
    </div>
  )

  if (link) {
    return link.startsWith("http") ? (
      <a href={link} target="_blank" rel="noopener noreferrer">{inner}</a>
    ) : (
      <Link href={link}>{inner}</Link>
    )
  }

  return <div>{inner}</div>
}