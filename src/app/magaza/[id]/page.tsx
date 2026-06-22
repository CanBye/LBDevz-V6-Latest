"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { MiniNavbar } from "@/components/layout/mini-navbar"
import { Footer } from "@/components/layout/footer"
import { SalesAgreementModal } from "@/components/purchase/sales-agreement-modal"
import { useLanguage } from "@/lib/language-context"
import DOMPurify from "isomorphic-dompurify"

interface Developer { id: string; name: string | null; username: string | null; image: string | null }
interface Version   { id: string; version: string; changelog: string | null; createdAt: string; published: boolean }
interface Product {
  id: string; name: string; description: string | null; priceCredits: number
  category: string | null; imageUrl: string | null; featured: boolean
  type: string; licenseModel: string; developers: Developer[]; versions: Version[]
}

const TYPE_LABELS: Record<string, string> = {
  minecraft_plugin: "Minecraft Plugin", fivem_script: "FiveM Script",
  discord_bot: "Discord Bot", website: "Website", launcher: "Launcher",
}
const TYPE_ICONS: Record<string, string> = {
  minecraft_plugin: "simple-icons:minecraft", fivem_script: "simple-icons:fivem",
  discord_bot: "ic:baseline-discord", website: "carbon:globe",
  launcher: "carbon:launch", other: "carbon:cube",
}

export default function PublicProductPage() {
  const { id }             = useParams() as { id: string }
  const { data: session, status } = useSession()
  const router             = useRouter()
  const { t }              = useLanguage()

  const FEATURES = [
    { icon: "carbon:delivery", label: t("featureInstantDelivery") },
    { icon: "carbon:headset",  label: t("feature247Support") },
    { icon: "carbon:renew",    label: t("featureFreeUpdates") },
    { icon: "carbon:security", label: t("featureSecurePayment") },
  ]

  const [product,      setProduct]      = useState<Product | null>(null)
  const [balance,      setBalance]      = useState(0)
  const [loading,      setLoading]      = useState(true)
  const [alreadyOwned, setAlreadyOwned] = useState(false)
  const [purchasing,   setPurchasing]   = useState(false)
  const [coupon,       setCoupon]       = useState("")
  const [couponRes,    setCouponRes]    = useState<{ valid: boolean; discount?: number; finalAmount?: number; message?: string; error?: string } | null>(null)
  const [couponLoad,   setCouponLoad]   = useState(false)
  const [success,      setSuccess]      = useState<string | null>(null)
  const [error,        setError]        = useState<string | null>(null)
  const [activeTab,    setActiveTab]    = useState<"description" | "changelog">("description")
  const [showAgreement, setShowAgreement] = useState(false)
  const [agreed,        setAgreed]       = useState(false)

  useEffect(() => {
    // Load product (public)
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(prod => {
        if (prod.error) { router.push("/magaza"); return }
        setProduct(prod)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    // Load user data if logged in
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/me").then(r => r.json()),
        fetch("/api/dashboard/licenses").then(r => r.json()),
      ]).then(([me, licData]) => {
        setBalance(me.balance ?? 0)
        const owned = (licData.licenses ?? []).some(
          (l: { license: { status: string }; product: { id?: string } | null }) =>
            l.product?.id === id && l.license.status === "active"
        )
        setAlreadyOwned(owned)
      }).catch(() => {})
    }
  }, [id, status])

  async function applyCoupon() {
    if (!product || !coupon.trim()) return
    setCouponLoad(true)
    const res  = await fetch("/api/dashboard/coupon/validate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon.trim(), productId: product.id, amount: product.priceCredits }),
    })
    setCouponRes(await res.json())
    setCouponLoad(false)
  }

  async function handlePurchase() {
    if (!product) return
    setPurchasing(true); setError(null); setSuccess(null)
    const res  = await fetch("/api/dashboard/purchase", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, couponCode: couponRes?.valid ? coupon.trim() : undefined }),
    })
    const data = await res.json()
    setPurchasing(false)
    if (!res.ok) { setError(data.error ?? t("purchaseFailed")); return }
    setSuccess(data.licenseKey)
    setBalance(b => b - (couponRes?.valid ? (couponRes.finalAmount ?? 0) : product.priceCredits))
    setAlreadyOwned(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="relative h-24 border-b border-white/[0.05]"><MiniNavbar /></div>
        <div className="mx-auto max-w-6xl px-6 py-16 space-y-6">
          <div className="h-72 rounded-2xl bg-white/[0.03] animate-pulse" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 w-56 rounded-xl bg-white/[0.04] animate-pulse" />
              <div className="h-4 rounded-xl bg-white/[0.03] animate-pulse" />
              <div className="h-4 rounded-xl bg-white/[0.03] animate-pulse w-3/4" />
            </div>
            <div className="h-48 rounded-2xl bg-white/[0.03] animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  const effectivePrice = couponRes?.valid ? (couponRes.finalAmount ?? product.priceCredits) : product.priceCredits
  const canAfford = balance >= effectivePrice
  const publishedVersions = product.versions.filter(v => v.published)
  const latestVersion = publishedVersions[0]

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative h-24 border-b border-white/[0.05]"><MiniNavbar /></div>

      {/* ── Hero banner ── */}
      <div className="relative h-[320px] sm:h-[400px] overflow-hidden">
        {product.imageUrl ? (
          <>
            <img src={product.imageUrl} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[#050505] flex items-center justify-center">
            <Icon icon={TYPE_ICONS[product.type] ?? "carbon:cube"} className="text-white/[0.04]" width={180} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </div>
        )}

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-6xl px-6 sm:px-8 pb-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="rounded-full border border-white/[0.12] bg-black/50 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/50 backdrop-blur-sm">
                {TYPE_LABELS[product.type] ?? product.type}
              </span>
              {product.featured && (
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-400 backdrop-blur-sm">
                  ⭐ {t("featuredLabel")}
                </span>
              )}
              {latestVersion && (
                <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-0.5 text-[10px] font-mono font-bold text-emerald-400 backdrop-blur-sm">
                  v{latestVersion.version}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">{product.name}</h1>
            {product.category && <p className="mt-2 text-sm text-white/40">{product.category}</p>}
          </motion.div>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="border-b border-white/[0.05] bg-[#030303]">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 py-3 flex items-center gap-2 text-[11px] text-white/30">
          <Link href="/magaza" className="hover:text-white/60 transition-colors">{t("magazaTitle")}</Link>
          <Icon icon="carbon:chevron-right" width={10} />
          <span className="text-white/60">{product.name}</span>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="mx-auto max-w-6xl px-6 sm:px-8 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">

          {/* Left: Description + Changelog + Developers */}
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-1 border-b border-white/[0.06]">
              {(["description", "changelog"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 -mb-px",
                    activeTab === tab
                      ? "border-white text-white"
                      : "border-transparent text-white/30 hover:text-white/60"
                  )}>
                  {tab === "description" ? t("descriptionTab") : `${t("versionsTab")} (${publishedVersions.length})`}
                </button>
              ))}
            </div>

            {activeTab === "description" ? (
              <motion.div key="description" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                {product.description ? (
                  <div className="rich-content text-white/60 leading-relaxed" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description, { USE_PROFILES: { html: true } }) }} />
                ) : (
                  <p className="text-sm text-white/30 italic">{t("noDescription")}</p>
                )}
              </motion.div>
            ) : (
              <motion.div key="changelog" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                {publishedVersions.length === 0 ? (
                  <p className="text-sm text-white/30 italic">{t("noVersionsPublished")}</p>
                ) : (
                  <div className="relative pl-6 space-y-8">
                    <div className="absolute left-0 top-2 bottom-2 w-px bg-white/[0.06]" />
                    {publishedVersions.map((v, i) => (
                      <div key={v.id} className="relative">
                        <div className={cn(
                          "absolute -left-[25px] top-1.5 h-3 w-3 rounded-full border-2",
                          i === 0 ? "bg-white border-white" : "bg-black border-white/20"
                        )} />
                        <div className="flex flex-wrap items-center gap-2 mb-2">
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
                          <p className="text-xs text-white/45 leading-relaxed whitespace-pre-line">{v.changelog}</p>
                        ) : (
                          <p className="text-xs text-white/20 italic">{t("noChangelog")}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Developers */}
            {product.developers.length > 0 && (
              <div className="rounded-2xl border border-white/[0.07] bg-[#060606] p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 mb-4">{t("developersLabel")}</p>
                <div className="flex flex-wrap gap-3">
                  {product.developers.map(dev => (
                    <div key={dev.id} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-[#0a0a0a] px-4 py-2.5">
                      <div className="h-8 w-8 rounded-full bg-[#1a1a1a] border border-white/[0.07] overflow-hidden flex items-center justify-center shrink-0">
                        {dev.image ? (
                          <img src={dev.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-white/30">{(dev.name ?? dev.username ?? "?").charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white/80">{dev.name ?? dev.username ?? t("unnamed")}</p>
                        {dev.username && <p className="text-[10px] text-white/30">@{dev.username}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feature badges */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {FEATURES.map(f => (
                <div key={f.label} className="flex flex-col items-center gap-2 rounded-xl border border-white/[0.06] bg-[#060606] p-4 text-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03]">
                    <Icon icon={f.icon} className="text-white/50" width={16} />
                  </div>
                  <span className="text-[10px] font-semibold text-white/40">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Sticky purchase card */}
          <div>
            <div className="sticky top-6 space-y-3">
              {/* Price card */}
              <div className="rounded-2xl border border-white/[0.09] bg-[#060606] overflow-hidden">
                {/* Cover thumbnail */}
                {product.imageUrl && (
                  <div className="h-36 overflow-hidden relative">
                    <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-transparent to-transparent" />
                  </div>
                )}

                <div className="p-5 space-y-4">
                  {/* Price */}
                  <div className="flex items-end justify-between">
                    <div>
                      {couponRes?.valid ? (
                        <>
                          <span className="text-xs text-white/30 line-through block">{product.priceCredits} ₺</span>
                          <span className="text-3xl font-bold text-emerald-400">{effectivePrice === 0 ? t("freeLabel") : `${effectivePrice} ₺`}</span>
                        </>
                      ) : (
                        <span className="text-3xl font-bold text-white">
                          {product.priceCredits === 0 ? <span className="text-emerald-400">{t("freeLabel")}</span> : `${product.priceCredits} ₺`}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-white/25 uppercase tracking-wider pb-1">
                      {product.licenseModel === "lifetime" ? t("licenseModelLifetimeLong") : product.licenseModel === "subscription" ? t("licenseModelSubscription") : t("licenseModelCustom")}
                    </span>
                  </div>

                  {/* Success */}
                  {success && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon icon="carbon:checkmark-filled" className="text-emerald-400" width={16} />
                        <p className="text-xs font-bold text-emerald-400">{t("purchaseSuccessTitle")}</p>
                      </div>
                      <p className="text-[10px] text-emerald-400/60">{t("licenseKey")}</p>
                      <p className="font-mono text-xs font-bold text-emerald-300 break-all bg-black/30 rounded-lg p-2">{success}</p>
                      <Link href="/dashboard/lisanslarim" className="text-[10px] text-emerald-500 underline">{t("viewMyLicenses")}</Link>
                    </div>
                  )}

                  {/* CTA */}
                  {!success && (
                    <>
                      {status !== "authenticated" ? (
                        <Link href={`/giris?callbackUrl=/magaza/${id}`}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white text-black py-3 text-sm font-bold hover:bg-white/90 transition-all">
                          <Icon icon="carbon:user" width={15} />
                          {t("loginAndBuy")}
                        </Link>
                      ) : alreadyOwned ? (
                        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.06] p-3 flex items-center gap-2">
                          <Icon icon="carbon:checkmark-filled" className="text-indigo-400 shrink-0" width={16} />
                          <div>
                            <p className="text-xs font-bold text-indigo-400">{t("alreadyOwnedLabel")}</p>
                            <Link href="/dashboard/lisanslarim" className="text-[10px] text-indigo-400/60 underline">{t("goToLicenses")}</Link>
                          </div>
                        </div>
                      ) : (
                        <>
                          {!agreed && (
                            <button onClick={() => setShowAgreement(true)}
                              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-black py-3 text-sm font-bold hover:bg-white/90 transition-all disabled:opacity-40">
                              <Icon icon="carbon:document-signed" width={15} />
                              {t("readAndBuy")}
                            </button>
                          )}
                          {agreed && (
                            <button onClick={handlePurchase} disabled={purchasing || !canAfford}
                              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-black py-3 text-sm font-bold hover:bg-white/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                              <Icon icon={purchasing ? "carbon:circle-dash" : "carbon:shopping-cart"} width={15} className={purchasing ? "animate-spin" : ""} />
                              {purchasing ? t("processing") : !canAfford ? `${t("insufficientBalance")} (${balance} ₺)` : t("buyBtn")}
                            </button>
                          )}
                        </>
                      )}

                      {error && <p className="text-xs text-red-400">{error}</p>}

                      {/* Coupon */}
                      {status === "authenticated" && !alreadyOwned && !success && (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              placeholder={t("couponPlaceholder")}
                              value={coupon}
                              onChange={e => { setCoupon(e.target.value); setCouponRes(null) }}
                              className="flex-1 rounded-xl border border-white/[0.07] bg-[#0d0d0d] px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-white/20 transition-all"
                            />
                            <button onClick={applyCoupon} disabled={couponLoad || !coupon.trim()}
                              className="rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-xs font-bold text-white/50 hover:text-white/80 transition-all disabled:opacity-30">
                              {couponLoad ? "..." : t("applyBtn")}
                            </button>
                          </div>
                          {couponRes && (
                            <p className={cn("text-[10px] font-medium", couponRes.valid ? "text-emerald-400" : "text-red-400")}>
                              {couponRes.valid ? `✓ ${couponRes.message}` : `✗ ${couponRes.error}`}
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* Balance info */}
                  {status === "authenticated" && (
                    <div className="flex items-center justify-between text-[10px] text-white/20 pt-1 border-t border-white/[0.05]">
                      <span className="flex items-center gap-1">
                        <Icon icon="carbon:wallet" width={11} />
                        {t("walletBalance")} {balance.toLocaleString("tr-TR")} ₺
                      </span>
                      <Link href="/dashboard/kredi" className="hover:text-white/40 transition-colors underline">{t("addBalance")}</Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Info list */}
              <div className="rounded-2xl border border-white/[0.07] bg-[#060606] divide-y divide-white/[0.05]">
                {[
                  { icon: "carbon:cube", label: t("typeLabel"), value: TYPE_LABELS[product.type] ?? t("otherLabel") },
                  { icon: "carbon:tag", label: t("licenseLabel"), value: product.licenseModel === "lifetime" ? t("licenseModelLifetimeLong") : product.licenseModel === "subscription" ? t("licenseModelSubscription") : t("licenseModelCustom") },
                  ...(latestVersion ? [{ icon: "carbon:version", label: t("versionLabel"), value: `v${latestVersion.version}` }] : []),
                  ...(product.category ? [{ icon: "carbon:folder", label: t("categoryLabel"), value: product.category }] : []),
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between px-4 py-3">
                    <span className="flex items-center gap-2 text-[11px] text-white/35">
                      <Icon icon={item.icon} width={12} />
                      {item.label}
                    </span>
                    <span className="text-[11px] font-semibold text-white/60">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {showAgreement && product && (
        <SalesAgreementModal
          productName={product.name}
          onAccept={() => setAgreed(true)}
          onClose={() => setShowAgreement(false)}
        />
      )}
    </div>
  )
}