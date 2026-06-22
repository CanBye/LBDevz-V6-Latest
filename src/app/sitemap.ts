import type { MetadataRoute } from "next"
import { db } from "@/lib/db"
import { products } from "@lbdevz/db"
import { eq } from "drizzle-orm"

const BASE = "https://lbdevz.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const activeProducts = await db
    .select({ id: products.id, updatedAt: products.updatedAt })
    .from(products)
    .where(eq(products.status, "active"))
    .catch(() => [])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                    lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/auth/login`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/auth/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/dashboard/magaza`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/sozlesmeler`,          lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/sozlesmeler/gizlilik-politikasi`,       lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/sozlesmeler/kullanim-sartlari`,         lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/sozlesmeler/mesafeli-satis-sozlesmesi`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/sozlesmeler/kvkk-aydinlatma`,           lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/sozlesmeler/cerez-politikasi`,          lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ]

  const productRoutes: MetadataRoute.Sitemap = activeProducts.map(p => ({
    url:              `${BASE}/dashboard/magaza/${p.id}`,
    lastModified:     p.updatedAt ?? new Date(),
    changeFrequency:  "weekly" as const,
    priority:         0.8,
  }))

  return [...staticRoutes, ...productRoutes]
}