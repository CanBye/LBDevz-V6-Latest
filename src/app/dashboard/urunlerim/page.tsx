"use client"

import { useLanguage } from "@/lib/language-context"

export default function UrunlerimPage() {
  const { t } = useLanguage()

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">{t("myProducts")}</h1>
        <p className="mt-1 text-sm text-white/40">Satın aldığın ürünler / Purchased products</p>
      </div>
      <div className="rounded-2xl border border-white/[0.08] bg-[#070707] p-12 text-center">
        <p className="text-sm text-white/35">{t("noProducts")}</p>
      </div>
    </div>
  )
}
