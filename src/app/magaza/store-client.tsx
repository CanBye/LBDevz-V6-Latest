"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { MiniNavbar } from "@/components/layout/mini-navbar"
import { Footer } from "@/components/layout/footer"
import { useLanguage } from "@/lib/language-context"

interface Developer { id: string; name: string | null; username: string | null; image: string | null }
interface Product {
  id: string; name: string; description: string | null; priceCredits: number
  category: string | null; imageUrl: string | null; featured: boolean
  type: string; licenseModel: string; developers: Developer[]; latestVersion: string | null
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
const FILTER_KEYS = ["all", "minecraft_plugin", "fivem_script", "discord_bot", "website", "launcher"]

function stripHtml(html: string | null): string {
  if (!html) return ""
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const { t } = useLanguage()
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col rounded-2xl border border-white/[0.07] bg-[#070707] overflow-hidden transition-all duration-300 hover:border-white/[0.14] hover:bg-[#0a0a0a] hover:-translate-y-0.5"
    >
      {/* Cover */}
      <div className="relative aspect-[16/9] bg-[#0c0c0c] overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon icon={TYPE_ICONS[product.type] ?? "carbon:cube"} className="text-white/10 transition-transform duration-300 group-hover:scale-110" width={40} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {product.featured && (
            <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400">
              {t("featuredLabel")}
            </span>
          )}
          <span className="rounded-full border border-white/10 bg-black/50 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-white/60 backdrop-blur-sm">
            {TYPE_LABELS[product.type] ?? t("otherLabel")}
          </span>
        </div>

        {product.latestVersion && (
          <span className="absolute bottom-3 right-3 rounded-full border border-white/10 bg-black/50 px-2 py-0.5 text-[9px] font-mono text-white/50 backdrop-blur-sm">
            v{product.latestVersion}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold text-white group-hover:text-white transition-colors">{product.name}</h3>

        {product.description && (
          <p className="mt-2 flex-1 text-xs leading-relaxed text-white/40 line-clamp-3">
            {stripHtml(product.description)}
          </p>
        )}

        {/* Developers */}
        {product.developers.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {product.developers.slice(0, 3).map(dev => (
                <div key={dev.id} className="h-5 w-5 rounded-full border border-black overflow-hidden bg-[#1a1a1a] flex items-center justify-center">
                  {dev.image ? (
                    <img src={dev.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[8px] font-bold text-white/40">{(dev.name ?? dev.username ?? "?").charAt(0)}</span>
                  )}
                </div>
              ))}
            </div>
            <span className="text-[10px] text-white/25">
              {product.developers.map(d => d.name ?? d.username).filter(Boolean).join(", ")}
            </span>
          </div>
        )}

        {/* Price + CTA */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[0.05] pt-4">
          <div>
            <span className="text-[9px] font-medium uppercase tracking-widest text-white/25 block">{t("priceLabel")}</span>
            <span className="text-lg font-bold text-white tracking-tight mt-0.5 block">
              {product.priceCredits === 0 ? t("freeLabel") : `₺${product.priceCredits}`}
            </span>
          </div>
          <Link
            href={`/magaza/${product.id}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-4 text-[11px] font-semibold text-white/70 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
          >
            {t("browseBtn")}
            <Icon icon="carbon:arrow-up-right" width={12} />
          </Link>
        </div>
      </div>
    </motion.article>
  )
}

export function StoreClient() {
  const { t } = useLanguage()
  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState("all")
  const [search,   setSearch]   = useState("")

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then(d => { setProducts(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = products.filter(p => {
    const matchType = filter === "all" || p.type === filter
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
      stripHtml(p.description).toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sticky navbar wrapper — MiniNavbar is absolute-positioned inside hero, here we give it a fixed height container */}
      <div className="relative h-24 border-b border-white/[0.05]">
        <MiniNavbar />
      </div>

      {/* Hero */}
      <section className="border-b border-white/[0.06] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/30 mb-4">{t("storeEyebrow")}</p>
            <h1 className="text-4xl font-light tracking-tight text-white sm:text-5xl leading-[1.1]">
              {t("storeHeroLine1")}<br />
              <span className="font-semibold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                {t("storeHeroLine2")}
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-sm text-white/45 leading-relaxed">
              {t("storeDesc")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters + Search */}
      <div className="sticky top-16 z-20 border-b border-white/[0.05] bg-black/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 py-3 flex flex-wrap items-center gap-3">
          <div className="flex gap-1.5 flex-wrap">
            {FILTER_KEYS.map(key => (
              <button key={key} onClick={() => setFilter(key)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-[11px] font-semibold transition-all",
                  filter === key
                    ? "border-white/25 bg-white/[0.08] text-white"
                    : "border-white/[0.07] text-white/35 hover:text-white/70 hover:border-white/15"
                )}>
                {key === "all" ? t("allFilter") : TYPE_LABELS[key] ?? key}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 rounded-xl border border-white/[0.07] bg-[#0a0a0a] px-3.5 py-2 w-48 sm:w-64">
            <Icon icon="carbon:search" className="text-white/25 shrink-0" width={14} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full bg-transparent text-xs text-white placeholder-white/25 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="mx-auto max-w-6xl px-6 sm:px-8 py-12">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="rounded-2xl border border-white/[0.06] bg-[#080808] overflow-hidden animate-pulse">
                <div className="aspect-[16/9] bg-white/[0.03]" />
                <div className="p-5 space-y-3">
                  <div className="h-4 rounded bg-white/[0.04] w-3/4" />
                  <div className="h-3 rounded bg-white/[0.03] w-full" />
                  <div className="h-3 rounded bg-white/[0.03] w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <Icon icon="carbon:store" className="mx-auto text-white/10 mb-4" width={48} />
            <p className="text-white/30 text-sm">{search || filter !== "all" ? t("noMatchingProducts") : t("noProductsYet")}</p>
          </div>
        ) : (
          <>
            <p className="mb-6 text-[11px] text-white/25 font-mono">{filtered.length} {t("productCountSuffix")}</p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}