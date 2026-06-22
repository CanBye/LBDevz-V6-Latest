"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"

interface Developer {
  id: string
  name: string | null
  username: string | null
  image: string | null
}

interface Version {
  id: string
  version: string
  changelog: string | null
  createdAt: string
}

interface Product {
  id: string
  name: string
  description: string | null
  priceCredits: number
  category: string | null
  imageUrl: string | null
  featured: boolean
  type: string
  licenseModel: string
  developers: Developer[]
  versions: Version[]
}

const typeLabels: Record<string, string> = {
  minecraft_plugin: "Minecraft Plugin",
  fivem_script:     "FiveM Script",
  discord_bot:      "Discord Bot",
  website:          "Website",
  launcher:         "Launcher",
}

export default function ProductDetailPage() {
  const { id }    = useParams() as { id: string }
  const { status } = useSession()
  const router    = useRouter()
  const { t }     = useLanguage()

  const [product,    setProduct]    = useState<Product | null>(null)
  const [balance,    setBalance]    = useState(0)
  const [loading,    setLoading]    = useState(true)
  const [alreadyOwned, setAlreadyOwned] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [coupon,     setCoupon]     = useState("")
  const [couponRes,  setCouponRes]  = useState<{ valid: boolean; discount?: number; finalAmount?: number; message?: string; error?: string; couponId?: string } | null>(null)
  const [couponLoad, setCouponLoad] = useState(false)
  const [success,    setSuccess]    = useState<string | null>(null)
  const [error,      setError]      = useState<string | null>(null)

  useEffect(() => {
    if (status === "authenticated") {
      Promise.all([
        fetch(`/api/products/${id}`).then((r) => r.json()),
        fetch("/api/me").then((r) => r.json()),
        fetch("/api/dashboard/licenses").then((r) => r.json()),
      ]).then(([prod, me, licData]) => {
        if (prod.error) { router.push("/dashboard/magaza"); return }
        setProduct(prod)
        setBalance(me.balance ?? 0)
        const owned = (licData.licenses ?? []).some(
          (l: { license: { status: string }; product: { id?: string } | null }) =>
            l.product && (l.product as { id?: string }).id === id && l.license.status === "active"
        )
        setAlreadyOwned(owned)
        setLoading(false)
      }).catch(() => setLoading(false))
    }
  }, [status, id])

  async function applyCoupon() {
    if (!product || !coupon.trim()) return
    setCouponLoad(true)
    const res  = await fetch("/api/dashboard/coupon/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon.trim(), productId: product.id, amount: product.priceCredits }),
    })
    const data = await res.json()
    setCouponLoad(false)
    setCouponRes(data)
  }

  async function handlePurchase() {
    if (!product) return
    setPurchasing(true); setError(null); setSuccess(null)
    const couponCode = couponRes?.valid ? coupon.trim() : undefined
    const res  = await fetch("/api/dashboard/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, couponCode }),
    })
    const data = await res.json()
    setPurchasing(false)
    if (!res.ok) { setError(data.error ?? t("purchaseFailed")); return }
    setSuccess(data.licenseKey)
    const paid = couponRes?.valid ? (couponRes.finalAmount ?? 0) : product.priceCredits
    setBalance((b) => b - paid)
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="h-8 w-48 rounded-xl bg-white/[0.04] animate-pulse" />
        <div className="h-64 rounded-2xl bg-white/[0.03] animate-pulse" />
        <div className="h-96 rounded-2xl bg-white/[0.03] animate-pulse" />
      </div>
    )
  }

  if (!product) return null

  const effectivePrice = couponRes?.valid ? (couponRes.finalAmount ?? product.priceCredits) : product.priceCredits
  const canAfford      = balance >= effectivePrice

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Back */}
      <button
        onClick={() => router.push("/dashboard/magaza")}
        className="flex items-center gap-2 text-sm text-white/35 hover:text-white/70 transition-colors"
      >
        <Icon icon="carbon:arrow-left" width={15} />
        {t("backToStore")}
      </button>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* ── Left column: image + buy ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Cover */}
          <div className="aspect-video w-full rounded-2xl bg-[#0a0a0a] border border-white/[0.07] overflow-hidden">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Icon icon="carbon:cube" className="text-white/10" width={40} />
              </div>
            )}
          </div>

          {/* Purchase card */}
          <div className="rounded-2xl border border-white/[0.07] bg-[#090909] p-5 space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                {couponRes?.valid ? (
                  <>
                    <span className="text-sm text-white/30 line-through">{product.priceCredits === 0 ? t("freeLabel") : `${product.priceCredits.toLocaleString("tr-TR")} ₺`}</span>
                    <span className="ml-2 text-2xl font-bold text-emerald-400">{effectivePrice === 0 ? t("freeLabel") : `${effectivePrice.toLocaleString("tr-TR")} ₺`}</span>
                  </>
                ) : product.priceCredits === 0 ? (
                  <span className="text-2xl font-bold text-emerald-400">{t("freeLabel")}</span>
                ) : (
                  <span className="text-2xl font-bold text-white">{product.priceCredits.toLocaleString("tr-TR")} <span className="text-sm text-white/40">₺</span></span>
                )}
              </div>
              <span className="text-[10px] text-white/25 uppercase tracking-wider">
                {product.licenseModel === "lifetime" ? t("licenseModelLifetime") : product.licenseModel === "subscription" ? t("licenseModelSubscription") : t("licenseModelCustom")}
              </span>
            </div>

            {/* Coupon */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t("couponPlaceholder")}
                value={coupon}
                onChange={(e) => { setCoupon(e.target.value); setCouponRes(null) }}
                className="flex-1 rounded-xl border border-white/[0.07] bg-[#0c0c0c] px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-white/20 transition-all"
              />
              <button
                onClick={applyCoupon}
                disabled={couponLoad || !coupon.trim()}
                className="rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-xs font-bold text-white/50 hover:text-white/80 transition-all disabled:opacity-30"
              >
                {couponLoad ? "..." : t("applyBtn")}
              </button>
            </div>

            {couponRes && (
              <p className={cn("text-xs font-medium", couponRes.valid ? "text-emerald-400" : "text-red-400")}>
                {couponRes.valid ? `✓ ${couponRes.message}` : `✗ ${couponRes.error}`}
              </p>
            )}

            {success ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4 space-y-1">
                <p className="text-xs font-bold text-emerald-400">{t("purchaseSuccess")}</p>
                <p className="text-[10px] text-emerald-400/70">{t("licenseKeyLabel")}</p>
                <p className="font-mono text-xs font-bold text-emerald-300 break-all">{success}</p>
                <button onClick={() => setSuccess(null)} className="text-[10px] text-emerald-500 underline">{t("closeBtn")}</button>
              </div>
            ) : alreadyOwned ? (
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.06] p-3 flex items-center gap-2">
                <Icon icon="carbon:checkmark-filled" className="text-indigo-400 shrink-0" width={16} />
                <div>
                  <p className="text-xs font-bold text-indigo-400">{t("alreadyOwnedLabel")}</p>
                  <p className="text-[10px] text-indigo-400/60">{t("downloadFromLicenses")}</p>
                </div>
              </div>
            ) : (
              <button
                onClick={handlePurchase}
                disabled={purchasing || !canAfford}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-black py-3 text-sm font-bold hover:bg-white/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {purchasing ? t("processing") : !canAfford ? t("insufficientBalance") : t("buyBtn")}
              </button>
            )}

            {error && <p className="text-xs text-red-400">{error}</p>}

            <div className="flex items-center justify-between text-[10px] text-white/20">
              <span className="flex items-center gap-1">
                <Icon icon="carbon:wallet" width={11} />
                {t("balance")} {balance.toLocaleString("tr-TR")} ₺
              </span>
              <span className="flex items-center gap-1">
                <Icon icon="carbon:security" width={11} />
                {t("instantDelivery")}
              </span>
            </div>
          </div>
        </div>

        {/* ── Right column: info + changelog ── */}
        <div className="lg:col-span-3 space-y-6">
          {/* Product info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {product.featured && (
                <span className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/25 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400">
                  <Icon icon="carbon:star-filled" width={9} />
                  {t("featuredLabel")}
                </span>
              )}
              <span className="text-[10px] text-white/25 uppercase tracking-wider">
                {typeLabels[product.type] ?? t("otherLabel")}
                {product.category ? ` · ${product.category}` : ""}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">{product.name}</h1>
            {product.description && (
              <div
                className="mt-3 text-sm text-white/50 leading-relaxed rich-content"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}
          </div>

          {/* Developers */}
          {product.developers.length > 0 && (
            <div className="rounded-2xl border border-white/[0.07] bg-[#090909] p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">
                {t("developersLabel")}
              </p>
              <div className="space-y-3">
                {product.developers.map((dev) => (
                  <div key={dev.id} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#1a1a1a] border border-white/[0.07] overflow-hidden flex items-center justify-center shrink-0">
                      {dev.image ? (
                        <img src={dev.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Icon icon="carbon:user-filled" className="text-white/30" width={14} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white/80">{dev.name ?? dev.username ?? t("unnamed")}</p>
                      {dev.username && <p className="text-[10px] text-white/30">@{dev.username}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Changelog */}
          {product.versions.length > 0 && (
            <div className="rounded-2xl border border-white/[0.07] bg-[#090909] p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-5">
                {t("changelogTitle")}
              </p>
              <div className="relative pl-5">
                {/* timeline line */}
                <div className="absolute left-0 top-0 bottom-0 w-px bg-white/[0.06]" />

                <div className="space-y-6">
                  {product.versions.map((v, i) => (
                    <div key={v.id} className="relative">
                      {/* dot */}
                      <div className={cn(
                        "absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border",
                        i === 0
                          ? "bg-white border-white/40"
                          : "bg-[#0a0a0a] border-white/20"
                      )} />

                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-mono text-sm font-bold text-white">v{v.version}</span>
                        {i === 0 && (
                          <span className="rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                            {t("latestVersionBadge")}
                          </span>
                        )}
                        <span className="text-[10px] text-white/25">
                          {new Date(v.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                      </div>

                      {v.changelog ? (
                        <p className="text-xs text-white/40 leading-relaxed whitespace-pre-line">
                          {v.changelog}
                        </p>
                      ) : (
                        <p className="text-xs text-white/20 italic">{t("noChangelog")}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}