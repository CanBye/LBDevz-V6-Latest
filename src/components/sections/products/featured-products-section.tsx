"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/ui/section-header";
import { siteConfig } from "@/lib/site-content";
import { useLanguage } from "@/lib/language-context";

interface DBProduct {
  id: string; slug: string; name: string; description: string | null;
  priceCredits: number; imageUrl: string | null; category: string | null; type: string;
}

function stripHtml(html: string | null, fallback = ""): string {
  if (!html) return fallback;
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
}

function ProductCover({
  cover,
  icon,
  accent,
  name,
}: {
  cover: string;
  icon: string;
  accent: string;
  name: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative aspect-[16/9.5] w-full overflow-hidden bg-[#0a0a0a]">
      {!failed ? (
        <img
          src={cover}
          alt={name}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 bg-[#090909]">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Minimal glowing background dot behind the icon */}
            <div className="absolute size-20 rounded-full bg-white/[0.01] blur-md group-hover:bg-white/[0.02] transition-colors duration-500" />
            <img
              src={icon}
              alt=""
              aria-hidden
              className="size-11 object-contain opacity-20 transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        </div>
      )}

      {/* Very soft gradient overlay */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-t",
          accent,
        )}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
    </div>
  );
}

interface FeaturedProductsSectionProps {
  className?: string;
}

export function FeaturedProductsSection({ className }: FeaturedProductsSectionProps) {
  const { t } = useLanguage()
  const [dbProducts, setDbProducts] = useState<DBProduct[]>([])

  useEffect(() => {
    fetch("/api/site/featured-products")
      .then(r => r.json())
      .then((d: DBProduct[]) => { if (Array.isArray(d) && d.length > 0) setDbProducts(d) })
      .catch(() => {})
  }, [])

  const products = dbProducts.map(p => ({
    id: p.slug || p.id,
    name: p.name,
    description: stripHtml(p.description, t("productDescFallback")),
    price: `₺${p.priceCredits}`,
    badge: null as string | null,
    icon: "",
    cover: p.imageUrl ?? "",
    accent: "from-indigo-950/80 via-indigo-900/20 to-transparent",
    href: `/dashboard/magaza/${p.id}`,
  }))

  if (products.length === 0) return null

  return (
    <section
      id="urunler"
      className={cn("relative border-t border-white/[0.06] bg-black", className)}
    >
      <div className="mx-auto max-w-6xl px-6 py-24 sm:px-8 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <SectionHeader
            eyebrow={t("magazaTitle")}
            title={t("featuredProductsTitle")}
            description={t("featuredProductsDesc")}
          />
        </motion.div>

        {/* Compact 4-column Grid Layout on Desktop */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, delay: index * 0.06, ease: "easeOut" }}
              className="group flex flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-[#070707] transition-all duration-300 hover:border-white/[0.14] hover:bg-[#0a0a0a]"
            >
              <div className="relative">
                <ProductCover
                  cover={product.cover}
                  icon={product.icon}
                  accent={product.accent}
                  name={product.name}
                />

                {product.badge && (
                  <span className="absolute left-3.5 top-3.5 rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-white/85 backdrop-blur-md">
                    {product.badge}
                  </span>
                )}

                {/* Smaller, more elegant inline icon floating */}
                <div className="absolute bottom-3 left-3.5 flex size-9 items-center justify-center rounded-lg border border-white/10 bg-black/45 backdrop-blur-md">
                  <img
                    src={product.icon}
                    alt=""
                    aria-hidden
                    className="size-5 object-contain"
                  />
                </div>
              </div>

              {/* Compact Padding */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-semibold tracking-tight text-white group-hover:text-white transition-colors duration-200">
                  {product.name}
                </h3>
                
                <p className="mt-2 flex-1 text-xs leading-relaxed text-white/40">
                  {product.description}
                </p>

                {/* Tightened pricing and CTA area */}
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/[0.05] pt-4">
                  <div>
                    <span className="text-[9px] font-medium uppercase tracking-widest text-white/25 block">
                      {t("priceLabel")}
                    </span>
                    <span className="text-base font-bold text-white tracking-tight mt-0.5 block">
                      {product.price}
                    </span>
                  </div>

                  <Link
                    href={product.href}
                    target={product.href.startsWith("http") ? "_blank" : undefined}
                    rel={product.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="inline-flex h-8 items-center gap-1 rounded-full border border-white/10 bg-white/[0.02] px-3.5 text-[11px] font-medium text-white/70 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                  >
                    {t("browseBtn")}
                    <ArrowUpRight className="size-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
