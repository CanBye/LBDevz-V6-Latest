"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Skip admin and api routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return

    const ref = document.referrer || null
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, referrer: ref }),
    }).catch(() => {})
  }, [pathname])

  return null
}