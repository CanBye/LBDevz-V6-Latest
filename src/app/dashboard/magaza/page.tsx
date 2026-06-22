"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"

interface Developer {
  id: string
  name: string | null
  username: string | null
  image: string | null
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
  latestVersion: string | null
}

const typeLabels: Record<string, string> = {
  minecraft_plugin: "Minecraft Plugin",
  fivem_script:     "FiveM Script",
  discord_bot:      "Discord Bot",
  website:          "Website",
  launcher:         "Launcher",
}

const typeIcons: Record<string, string> = {
  minecraft_plugin: "simple-icons:minecraft",
  fivem_script:     "simple-icons:fivem",
  discord_bot:      "ic:baseline-discord",
  website:          "carbon:globe",
  launcher:         "carbon:launch",
  other:            "carbon:cube",
}

export default function MagazaPage() {
  const { status } = useSession()
  const router     = useRouter()
  const { t }      = useLanguage()
  const [products, setProducts] = useState<Product[]>([])
  const [balance,  setBalance]  = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState<string>("all")

  useEffect(() => {
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/products").then((r) => r.json()),
        fetch("/api/me").then((r) => r.json()),
      ]).then(([prods, me]) => {
        setProducts(Array.isArray(prods) ? prods : [])
        setBalance(me.balance ?? 0)
        setLoading(false)
      }).catch(() => setLoading(false))
    }
  }, [status])

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.type)))]

  const filtered = filter === "all" ? products : products.filter((p) => p.type === filter)
  const featured  = filtered.filter((p) => p.featured)
  const regular   = filtered.filter((p) => !p.featured)

  return (
    <div className="space-y-10 max-w-6xl">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{t("magazaTitle")}</h1>
          <p className="mt-1.5 text-sm text-white/40">{t("magazaSubtitle")}</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-white/[0.07] bg-[#090909] px-5 py-3">
          <Icon icon="carbon:wallet" className="text-white/40" width={16} />
          <span className="text-sm text-white/40">{t("balance")}</span>
          <span className="ml-1 font-bold text-white">{balance.toLocaleString("tr-TR")} ₺</span>
        </div>
      </div>

      {/* ── Category filter ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap border transition-all duration-200",
              filter === cat
                ? "bg-white text-black border-white"
                : "bg-white/[0.04] text-white/40 border-white/[0.07] hover:border-white/20 hover:text-white/70"
            )}
          >
            {cat !== "all" && <Icon icon={typeIcons[cat] ?? "carbon:cube"} width={11} />}
            {cat === "all" ? t("allFilter") : typeLabels[cat] ?? t("otherLabel")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[280px] rounded-2xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-[#080808] p-20 text-center">
          <Icon icon="carbon:shopping-cart" width={48} className="text-white/10" />
          <p className="mt-5 text-sm text-white/30">{t("noProductsInCategory")}</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Featured */}
          {featured.length > 0 && (
            <section>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/25">
                {t("featuredLabel")}
              </p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((p) => (
                  <ProductCard key={p.id} product={p} onOpen={() => router.push(`/dashboard/magaza/${p.id}`)} />
                ))}
              </div>
            </section>
          )}

          {/* All products */}
          {regular.length > 0 && (
            <section>
              {featured.length > 0 && (
                <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/25">
                  {t("allProductsLabel")}
                </p>
              )}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {regular.map((p) => (
                  <ProductCard key={p.id} product={p} onOpen={() => router.push(`/dashboard/magaza/${p.id}`)} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function ProductCard({ product: p, onOpen }: { product: Product; onOpen: () => void }) {
  const { t } = useLanguage()
  return (
    <button
      onClick={onOpen}
      className="group text-left rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#0f0f0f] to-[#070707] overflow-hidden transition-all duration-300 hover:border-white/[0.14] hover:shadow-[0_0_30px_rgba(255,255,255,0.02)] flex flex-col"
    >
      {/* Image */}
      <div className="relative h-36 w-full bg-[#0a0a0a] overflow-hidden">
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt={p.name}
            className="h-full w-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Icon icon={typeIcons[p.type] ?? "carbon:cube"} className="text-white/10" width={36} />
          </div>
        )}
        {p.featured && (
          <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400">
            <Icon icon="carbon:star-filled" width={9} />
            {t("featuredLabel")}
          </span>
        )}
        {p.latestVersion && (
          <span className="absolute top-3 right-3 rounded-full bg-black/60 border border-white/10 px-2 py-0.5 text-[9px] font-mono text-white/50">
            v{p.latestVersion}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/25">
              {typeLabels[p.type] ?? t("otherLabel")}
            </span>
            {p.category && (
              <>
                <span className="text-white/15">·</span>
                <span className="text-[10px] text-white/20 uppercase tracking-wider">{p.category}</span>
              </>
            )}
          </div>
          <h3 className="text-base font-bold text-white/90 group-hover:text-white transition-colors">
            {p.name}
          </h3>
          {p.description && (
            <p className="mt-1.5 text-xs text-white/35 leading-relaxed line-clamp-2">
              {p.description}
            </p>
          )}
        </div>

        {/* Developers */}
        {p.developers.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {p.developers.slice(0, 3).map((dev) => (
                <div
                  key={dev.id}
                  className="h-5 w-5 rounded-full border border-black bg-[#1a1a1a] overflow-hidden flex items-center justify-center"
                  title={dev.name ?? dev.username ?? ""}
                >
                  {dev.image ? (
                    <img src={dev.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Icon icon="carbon:user-filled" className="text-white/30" width={10} />
                  )}
                </div>
              ))}
            </div>
            <span className="text-[10px] text-white/25">
              {p.developers.slice(0, 2).map((d) => d.name ?? d.username).join(", ")}
              {p.developers.length > 2 && ` +${p.developers.length - 2}`}
            </span>
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
          <div>
            <span className="text-xl font-bold text-white">{p.priceCredits.toLocaleString("tr-TR")}</span>
            <span className="ml-1 text-xs text-white/35">₺</span>
          </div>
          <span className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-1.5 text-xs font-bold text-black group-hover:bg-white/90 transition-colors">
            <Icon icon="carbon:arrow-right" width={13} />
            {t("browseBtn")}
          </span>
        </div>
      </div>
    </button>
  )
}