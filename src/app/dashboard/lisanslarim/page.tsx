"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Icon } from "@iconify/react"
import { useLanguage } from "@/lib/language-context"

interface LicenseData {
  license: {
    id: string
    licenseKey: string
    status: "active" | "expired" | "revoked" | "suspended"
    licenseModel: "lifetime" | "subscription" | "custom"
    expiresAt: string | null
    periodDays: number | null
    renewalPriceCredits: number | null
  }
  product: {
    name: string
    priceCredits: number
    licenseModel: "lifetime" | "subscription" | "custom"
    periodDays: number | null
  } | null
}

interface DownloadInfo {
  downloadUrl?: string
  version?: string
  product?: string
  checksum?: string
  message?: string
  error?: string
}

function getDaysUntilExpiry(expiresAt: string | null): number | null {
  if (!expiresAt) return null
  const diff = new Date(expiresAt).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function LisanslarimPage() {
  const { status } = useSession()
  const { t } = useLanguage()
  const [licenses, setLicenses] = useState<LicenseData[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [renewing, setRenewing] = useState<string | null>(null)
  const [renewMsg, setRenewMsg] = useState<Record<string, { ok: boolean; text: string }>>({})
  const [downloadInfo, setDownloadInfo] = useState<Record<string, DownloadInfo>>({})

  // IP management
  type IpRow = { id: string; ip: string; label: string | null; addedAt: string }
  const [ipPanels,  setIpPanels]  = useState<Record<string, boolean>>({})
  const [ipData,    setIpData]    = useState<Record<string, { ips: IpRow[]; seatLimit: number }>>({})
  const [ipLoading, setIpLoading] = useState<Record<string, boolean>>({})
  const [newIp,     setNewIp]     = useState<Record<string, string>>({})
  const [newLabel,  setNewLabel]  = useState<Record<string, string>>({})
  const [ipMsg,     setIpMsg]     = useState<Record<string, { ok: boolean; text: string }>>({})

  async function loadIps(licenseKey: string) {
    setIpLoading(p => ({ ...p, [licenseKey]: true }))
    const res = await fetch(`/api/dashboard/licenses/${licenseKey}/ip`)
    const data = await res.json()
    setIpData(p => ({ ...p, [licenseKey]: { ips: data.ips ?? [], seatLimit: data.seatLimit ?? 1 } }))
    setIpLoading(p => ({ ...p, [licenseKey]: false }))
  }

  function toggleIpPanel(licenseKey: string) {
    const next = !ipPanels[licenseKey]
    setIpPanels(p => ({ ...p, [licenseKey]: next }))
    if (next && !ipData[licenseKey]) loadIps(licenseKey)
  }

  async function addIp(licenseKey: string) {
    const ip = newIp[licenseKey]?.trim()
    if (!ip) return
    setIpLoading(p => ({ ...p, [licenseKey]: true }))
    setIpMsg(p => ({ ...p, [licenseKey]: { ok: true, text: "" } }))
    const res = await fetch(`/api/dashboard/licenses/${licenseKey}/ip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip, label: newLabel[licenseKey]?.trim() || undefined }),
    })
    const data = await res.json()
    if (!res.ok) {
      setIpMsg(p => ({ ...p, [licenseKey]: { ok: false, text: data.error ?? "Hata" } }))
    } else {
      setNewIp(p => ({ ...p, [licenseKey]: "" }))
      setNewLabel(p => ({ ...p, [licenseKey]: "" }))
      loadIps(licenseKey)
    }
    setIpLoading(p => ({ ...p, [licenseKey]: false }))
  }

  async function removeIp(licenseKey: string, ipId: string) {
    await fetch(`/api/dashboard/licenses/${licenseKey}/ip`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ipId }),
    })
    loadIps(licenseKey)
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/dashboard/licenses")
        .then((r) => r.json())
        .then((d) => {
          setLicenses(d.licenses ?? [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [status])

  async function handleDownload(licenseKey: string) {
    setDownloading(licenseKey)
    try {
      const res = await fetch(`/api/dashboard/download/${licenseKey}`)
      const contentType = res.headers.get("content-type") ?? ""

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "İndirme başarısız" }))
        setDownloadInfo((prev) => ({ ...prev, [licenseKey]: { error: err.error } }))
        setDownloading(null)
        return
      }

      // Binary dosya (JAR, ZIP, JS vb.) — blob olarak indir
      if (
        contentType.includes("java-archive") ||
        contentType.includes("octet-stream") ||
        contentType.includes("zip")
      ) {
        const blob = await res.blob()
        const disposition = res.headers.get("content-disposition") ?? ""
        const match = disposition.match(/filename="?([^"]+)"?/)
        const fileName = match?.[1] ?? `plugin-${licenseKey}.jar`
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
        setDownloadInfo((prev) => ({ ...prev, [licenseKey]: { version: res.headers.get("x-plugin-version") ?? undefined } }))
      } else {
        // JSON yanıt (eski davranış — downloadUrl)
        const data: DownloadInfo = await res.json()
        setDownloadInfo((prev) => ({ ...prev, [licenseKey]: data }))
        if (data.downloadUrl) window.open(data.downloadUrl, "_blank")
      }
    } catch {
      setDownloadInfo((prev) => ({ ...prev, [licenseKey]: { error: "İndirme başarısız" } }))
    }
    setDownloading(null)
  }

  async function handleRenew(licenseKey: string) {
    setRenewing(licenseKey)
    setRenewMsg((prev) => {
      const next = { ...prev }
      delete next[licenseKey]
      return next
    })
    const res = await fetch("/api/dashboard/licenses/renew", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseKey }),
    })
    const data = await res.json()
    setRenewing(null)
    if (res.ok) {
      setRenewMsg((prev) => ({
        ...prev,
        [licenseKey]: { ok: true, text: data.message ?? "Lisans yenilendi!" },
      }))
      // Refresh licenses list
      fetch("/api/dashboard/licenses")
        .then((r) => r.json())
        .then((d) => setLicenses(d.licenses ?? []))
        .catch(() => {})
    } else {
      setRenewMsg((prev) => ({
        ...prev,
        [licenseKey]: { ok: false, text: data.error ?? "Bir hata oluştu." },
      }))
    }
  }

  const statusBadge = (s: string) => {
    if (s === "active") return "bg-emerald-500/10 text-emerald-400"
    if (s === "expired") return "bg-red-500/10 text-red-400"
    return "bg-yellow-500/10 text-yellow-400"
  }

  const statusLabel = (s: string) => {
    if (s === "active") return "Aktif"
    if (s === "expired") return "Süresi Dolmuş"
    if (s === "revoked") return "İptal Edildi"
    return "Askıya Alındı"
  }

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-4xl">
        <div className="h-8 w-48 rounded bg-white/5" />
        <div className="h-24 rounded-2xl bg-white/5" />
        <div className="h-24 rounded-2xl bg-white/5" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">{t("myLicenses")}</h1>
        <p className="mt-1 text-sm text-white/40">
          Aktif lisansların, indirme erişimi ve IP yönetimi
        </p>
      </div>

      {licenses.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#070707] p-12 text-center">
          <Icon icon="carbon:purchase" width={36} className="mx-auto text-white/15" />
          <p className="mt-4 text-sm text-white/35">{t("noLicenses")}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {licenses.map(({ license, product }) => {
            const info = downloadInfo[license.licenseKey]
            const msg = renewMsg[license.licenseKey]
            const daysLeft = getDaysUntilExpiry(license.expiresAt)
            const isSubscription =
              license.licenseModel === "subscription" ||
              product?.licenseModel === "subscription"
            const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7
            const isExpired = daysLeft !== null && daysLeft < 0
            const renewCost =
              license.renewalPriceCredits ?? product?.priceCredits ?? 0

            return (
              <div
                key={license.id}
                className="rounded-2xl border border-white/[0.08] bg-[#070707] p-6 transition-all hover:border-white/10"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-white">{product?.name ?? "Ürün"}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                          isSubscription
                            ? "border-indigo-500/20 bg-indigo-500/10 text-indigo-400"
                            : "border-white/10 bg-white/[0.04] text-white/30"
                        }`}
                      >
                        {isSubscription ? "Abonelik" : "Ömür Boyu"}
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-xs text-white/40 select-all bg-black/40 px-3 py-1.5 rounded-lg border border-white/[0.04] w-fit">
                      {license.licenseKey}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(license.status)}`}
                    >
                      {statusLabel(license.status)}
                    </span>

                    {/* Expiry badges */}
                    {isExpired && (
                      <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                        Süresi Dolmuş
                      </span>
                    )}
                    {isExpiringSoon && !isExpired && (
                      <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                        {daysLeft === 0 ? "Bugün bitiyor!" : `${daysLeft} gün kaldı`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Expiry date display */}
                {license.expiresAt && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-white/30">
                    <Icon icon="carbon:calendar" width={12} />
                    Bitiş:{" "}
                    <span className={isExpired ? "text-red-400" : isExpiringSoon ? "text-amber-400" : "text-white/50"}>
                      {new Date(license.expiresAt).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}

                {license.status === "active" && (
                  <div className="mt-5 flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => handleDownload(license.licenseKey)}
                      disabled={downloading === license.licenseKey}
                      className="flex items-center gap-2 rounded-xl bg-white/[0.06] border border-white/[0.08] px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/[0.10] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      {downloading === license.licenseKey ? (
                        <>
                          <Icon icon="carbon:circle-dash" width={14} className="animate-spin" />
                          Kontrol ediliyor...
                        </>
                      ) : (
                        <>
                          <Icon icon="carbon:download" width={14} />
                          {t("downloadBtn")}
                        </>
                      )}
                    </button>

                    {/* Renewal button for subscription licenses */}
                    {isSubscription && (
                      <button
                        onClick={() => handleRenew(license.licenseKey)}
                        disabled={renewing === license.licenseKey}
                        className="flex items-center gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        {renewing === license.licenseKey ? (
                          <>
                            <Icon icon="carbon:circle-dash" width={14} className="animate-spin" />
                            Yenileniyor...
                          </>
                        ) : (
                          <>
                            <Icon icon="carbon:renew" width={14} />
                            Yenile {renewCost > 0 ? `(${renewCost} ₺)` : ""}
                          </>
                        )}
                      </button>
                    )}

                    {info && (
                      <div className="text-xs">
                        {info.downloadUrl ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Icon icon="carbon:checkmark-filled" width={12} />
                            v{info.version} hazır
                          </span>
                        ) : (
                          <span className="text-white/35">
                            {info.message ?? info.error ?? t("noVersionAvailable")}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Expired license renewal button */}
                {(license.status === "expired" || isExpired) && isSubscription && (
                  <div className="mt-4 flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => handleRenew(license.licenseKey)}
                      disabled={renewing === license.licenseKey}
                      className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 hover:text-red-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      {renewing === license.licenseKey ? (
                        <>
                          <Icon icon="carbon:circle-dash" width={14} className="animate-spin" />
                          Yenileniyor...
                        </>
                      ) : (
                        <>
                          <Icon icon="carbon:renew" width={14} />
                          Yenile {renewCost > 0 ? `(${renewCost} ₺)` : ""}
                        </>
                      )}
                    </button>
                  </div>
                )}

                {msg && (
                  <p
                    className={`mt-3 text-xs font-medium ${msg.ok ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {msg.text}
                  </p>
                )}

                {/* IP Management */}
                {license.status === "active" && (
                  <div className="mt-4 border-t border-white/[0.05] pt-4">
                    <button
                      onClick={() => toggleIpPanel(license.licenseKey)}
                      className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors"
                    >
                      <Icon icon="carbon:network-4" width={13} />
                      IP Koruması
                      {ipData[license.licenseKey] && (
                        <span className="rounded-full bg-white/[0.06] border border-white/[0.07] px-1.5 py-0.5 text-[9px] text-white/40">
                          {ipData[license.licenseKey].ips.length}/{ipData[license.licenseKey].seatLimit}
                        </span>
                      )}
                      <Icon icon={ipPanels[license.licenseKey] ? "carbon:chevron-up" : "carbon:chevron-down"} width={11} />
                    </button>

                    {ipPanels[license.licenseKey] && (
                      <div className="mt-3 space-y-3">
                        {ipLoading[license.licenseKey] ? (
                          <div className="h-8 rounded-lg bg-white/[0.03] animate-pulse" />
                        ) : (
                          <>
                            {/* IP list */}
                            {(ipData[license.licenseKey]?.ips ?? []).length === 0 ? (
                              <p className="text-[10px] text-white/25 italic">IP eklenmemiş — plugin IP ekleyene kadar çalışmaz. Sunucu IP'ni ekle.</p>
                            ) : (
                              <div className="space-y-1.5">
                                {(ipData[license.licenseKey]?.ips ?? []).map(ip => (
                                  <div key={ip.id} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[#111] px-3 py-2">
                                    <Icon icon="carbon:server" width={11} className="text-white/30 shrink-0" />
                                    <span className="flex-1 font-mono text-[11px] text-white/60">{ip.ip}</span>
                                    {ip.label && <span className="text-[10px] text-white/25">{ip.label}</span>}
                                    <button
                                      onClick={() => removeIp(license.licenseKey, ip.id)}
                                      className="text-white/25 hover:text-red-400 transition-colors"
                                    >
                                      <Icon icon="carbon:close" width={12} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add IP form */}
                            {(ipData[license.licenseKey]?.ips.length ?? 0) < (ipData[license.licenseKey]?.seatLimit ?? 1) ? (
                              <div className="flex gap-2">
                                <input
                                  className="flex-1 rounded-lg border border-white/[0.07] bg-[#0d0d0d] px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-white/20 font-mono transition-all"
                                  placeholder="IP adresi (örn: 1.2.3.4)"
                                  value={newIp[license.licenseKey] ?? ""}
                                  onChange={e => setNewIp(p => ({ ...p, [license.licenseKey]: e.target.value }))}
                                  onKeyDown={e => e.key === "Enter" && addIp(license.licenseKey)}
                                />
                                <input
                                  className="w-24 rounded-lg border border-white/[0.07] bg-[#0d0d0d] px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-white/20 transition-all"
                                  placeholder="Etiket"
                                  value={newLabel[license.licenseKey] ?? ""}
                                  onChange={e => setNewLabel(p => ({ ...p, [license.licenseKey]: e.target.value }))}
                                />
                                <button
                                  onClick={() => addIp(license.licenseKey)}
                                  className="rounded-lg bg-white/[0.06] border border-white/[0.08] px-3 py-2 text-xs font-bold text-white/60 hover:text-white hover:bg-white/[0.1] transition-all"
                                >
                                  <Icon icon="carbon:add" width={13} />
                                </button>
                              </div>
                            ) : (
                              <p className="text-[10px] text-amber-400/70">IP limiti doldu ({ipData[license.licenseKey]?.seatLimit ?? 1}/{ipData[license.licenseKey]?.seatLimit ?? 1})</p>
                            )}

                            {ipMsg[license.licenseKey]?.text && (
                              <p className={`text-[10px] font-medium ${ipMsg[license.licenseKey].ok ? "text-emerald-400" : "text-red-400"}`}>
                                {ipMsg[license.licenseKey].text}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}