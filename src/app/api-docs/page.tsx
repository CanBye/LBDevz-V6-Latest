"use client"

import { useState } from "react"
import { Icon } from "@iconify/react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

interface Endpoint {
  method: "GET" | "POST" | "PATCH" | "DELETE"
  url: string
  description: string
  auth: boolean
  requestBody?: string
  response: string
}

const endpoints: Endpoint[] = [
  {
    method: "POST",
    url: "/api/v1/license/validate",
    description:
      "Bir lisans anahtarını doğrular. Geçerli bir lisans için ürün bilgileri döner. Sunucu taraflı entegrasyonlarda kullanın.",
    auth: false,
    requestBody: JSON.stringify(
      {
        licenseKey: "LBD-XXXXXXXX-XXXXXXXX",
        ip: "1.2.3.4",
      },
      null,
      2
    ),
    response: JSON.stringify(
      {
        valid: true,
        licenseKey: "LBD-XXXXXXXX-XXXXXXXX",
        product: "Minecraft Spawn Plugin",
        status: "active",
        expiresAt: null,
        seatLimit: 1,
        nonce: "abc123",
        timestamp: 1718000000000,
      },
      null,
      2
    ),
  },
  {
    method: "GET",
    url: "/api/products",
    description:
      "Aktif ve herkese açık ürünlerin listesini döner. Kimlik doğrulama gerektirmez.",
    auth: false,
    response: JSON.stringify(
      {
        products: [
          {
            id: "uuid",
            name: "Minecraft Spawn Plugin",
            slug: "minecraft-spawn",
            type: "minecraft_plugin",
            priceCredits: 500,
            licenseModel: "lifetime",
            category: "Combat",
            imageUrl: null,
            featured: false,
          },
        ],
      },
      null,
      2
    ),
  },
  {
    method: "GET",
    url: "/api/health",
    description:
      "Sistemin çalışma durumunu ve veritabanı bağlantısını kontrol eder. Uptime monitoring için kullanın.",
    auth: false,
    response: JSON.stringify(
      {
        status: "ok",
        db: "connected",
        uptime: 99.98,
        timestamp: "2024-06-16T14:00:00.000Z",
      },
      null,
      2
    ),
  },
]

const methodColors: Record<string, string> = {
  GET: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  POST: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  PATCH: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  DELETE: "bg-red-500/15 text-red-400 border-red-500/20",
}

function CopyButton({ text }: { text: string }) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-[10px] font-semibold text-white/50 hover:bg-white/[0.08] hover:text-white/80 transition-all"
    >
      <Icon icon={copied ? "carbon:checkmark" : "carbon:copy"} width={12} />
      {copied ? t("copied") : t("copyBtn")}
    </button>
  )
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative rounded-xl border border-white/[0.06] bg-[#040404] overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.04] px-4 py-2">
        <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">JSON</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-4 text-xs text-white/60 font-mono leading-relaxed">
        {code}
      </pre>
    </div>
  )
}

export default function ApiDocsPage() {
  const { t } = useLanguage()
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-[#050505]">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/"
              className="text-white/30 hover:text-white/60 text-xs transition-colors flex items-center gap-1"
            >
              <Icon icon="carbon:arrow-left" width={12} />
              {t("apiDocsBack")}
            </Link>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
              <Icon icon="carbon:api-1" width={22} className="text-white/70" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">{t("apiDocsTitle")}</h1>
              <p className="text-xs text-white/35 mt-0.5">LBDevz Public API — v1</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 max-w-lg">
            {[
              { label: "Base URL", value: "https://lbdevz.com" },
              { label: "Format", value: "JSON" },
              { label: t("apiDocsVersion"), value: "v1" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/[0.06] bg-[#080808] p-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/25">{item.label}</p>
                <p className="mt-1 text-xs font-mono font-semibold text-white/70">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Endpoints */}
      <div className="mx-auto max-w-4xl px-6 py-10 space-y-4">
        <p className="text-xs text-white/30 font-mono uppercase tracking-widest pb-2">Endpoints</p>

        {endpoints.map((ep, i) => {
          const open = expanded === i
          return (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.06] bg-[#070707] overflow-hidden transition-all"
            >
              <button
                onClick={() => setExpanded(open ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors text-left gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`shrink-0 rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${methodColors[ep.method]}`}
                  >
                    {ep.method}
                  </span>
                  <code className="text-sm font-mono text-white/80 truncate">{ep.url}</code>
                  {ep.auth && (
                    <span className="shrink-0 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400">
                      Auth
                    </span>
                  )}
                </div>
                <Icon
                  icon={open ? "carbon:chevron-up" : "carbon:chevron-down"}
                  width={16}
                  className="shrink-0 text-white/30"
                />
              </button>

              {open && (
                <div className="border-t border-white/[0.04] px-6 pb-6 pt-5 space-y-5">
                  <p className="text-sm text-white/55 leading-relaxed">{ep.description}</p>

                  {ep.requestBody && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                        Request Body
                      </p>
                      <CodeBlock code={ep.requestBody} />
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                      Response (200 OK)
                    </p>
                    <CodeBlock code={ep.response} />
                  </div>

                  <div className="rounded-xl border border-white/[0.06] bg-[#040404] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">
                      {t("apiDocsCurl")}
                    </p>
                    <div className="flex items-start justify-between gap-3">
                      <code className="text-xs font-mono text-white/50 leading-relaxed break-all">
                        {ep.method === "POST" || ep.method === "PATCH"
                          ? `curl -X ${ep.method} https://lbdevz.com${ep.url} \\\n  -H "Content-Type: application/json" \\\n  -d '${ep.requestBody ? ep.requestBody.replace(/\n/g, " ").replace(/\s+/g, " ") : "{}"}'`
                          : `curl https://lbdevz.com${ep.url}`}
                      </code>
                      <CopyButton
                        text={
                          ep.method === "POST" || ep.method === "PATCH"
                            ? `curl -X ${ep.method} https://lbdevz.com${ep.url} -H "Content-Type: application/json" -d '${ep.requestBody ?? "{}"}'`
                            : `curl https://lbdevz.com${ep.url}`
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.04] mt-10">
        <div className="mx-auto max-w-4xl px-6 py-8 flex items-center justify-between">
          <p className="text-xs text-white/20">{t("apiDocsFooter")}</p>
          <Link
            href="/sozlesmeler"
            className="text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Sözleşmeler
          </Link>
        </div>
      </div>
    </div>
  )
}