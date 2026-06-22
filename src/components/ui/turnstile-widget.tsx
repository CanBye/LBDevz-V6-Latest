"use client"

import { useEffect, useRef } from "react"

interface TurnstileWidgetProps {
  onVerify: (token: string) => void
  className?: string
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement | string, options: Record<string, unknown>) => string
      remove: (widgetId: string) => void
      reset: (widgetId: string) => void
    }
    onTurnstileLoad?: () => void
    _turnstilePending?: Array<() => void>
  }
}

export function TurnstileWidget({ onVerify, className }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!siteKey || !containerRef.current) return

    function renderWidget() {
      if (!window.turnstile || !containerRef.current) return
      if (widgetIdRef.current) {
        try { window.turnstile?.remove(widgetIdRef.current) } catch {}
        widgetIdRef.current = null
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "dark",
        appearance: "always",
        "refresh-expired": "auto",
        callback: onVerify,
      })
    }

    if (window.turnstile) {
      // Script zaten yüklendi
      renderWidget()
    } else {
      // onTurnstileLoad global callback kuyruğuna ekle
      if (!window._turnstilePending) window._turnstilePending = []
      window._turnstilePending.push(renderWidget)

      // Cloudflare'nin onload callback'ini ayarla
      const prev = window.onTurnstileLoad
      window.onTurnstileLoad = () => {
        prev?.()
        const pending = window._turnstilePending ?? []
        window._turnstilePending = []
        pending.forEach((fn) => fn())
      }
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current) } catch {}
        widgetIdRef.current = null
      }
    }
  }, [siteKey, onVerify])

  if (!siteKey) {
    return (
      <p className="text-xs text-white/25">
        Turnstile key ayarlanmamış
      </p>
    )
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ minHeight: 65 }}
    />
  )
}