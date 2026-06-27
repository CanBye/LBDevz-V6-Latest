import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { products } from "@lbdevz/db"

interface BulkProduct {
  name: string
  price: number
  type?: string
  licenseModel?: string
  enableLicense?: boolean
  enableObf?: boolean
  description?: string
  category?: string
}

export async function POST(req: NextRequest) {
  const session = await requirePermission(ADMIN_PERMISSIONS.PRODUCTS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const body = await req.json()
  const items: BulkProduct[] = body.products

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Ürün listesi boş olamaz" }, { status: 400 })
  }

  if (items.length > 100) {
    return NextResponse.json({ error: "Tek seferde en fazla 100 ürün eklenebilir" }, { status: 400 })
  }

  const created: string[] = []
  const errors: string[] = []

  for (const item of items) {
    if (!item.name || item.price == null) {
      errors.push(`"${item.name ?? "(adsız)"}" atlandı: ad ve fiyat zorunlu`)
      continue
    }
    try {
      const baseSlug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      const slug = `${baseSlug}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

      await db.insert(products).values({
        slug,
        name: item.name.trim(),
        description: item.description ?? null,
        type: (item.type ?? "other") as never,
        priceCredits: Number(item.price),
        ownerId: session.user!.id!,
        licenseModel: (item.licenseModel ?? "lifetime") as never,
        category: item.category ?? null,
        imageUrl: null,
        featured: false,
        enableLicense: item.enableLicense ?? true,
        enableObf: item.enableObf ?? false,
        status: "draft" as never,
        visibility: "public" as never,
      })
      created.push(item.name)
    } catch (err: unknown) {
      errors.push(`"${item.name}" eklenemedi: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return NextResponse.json({ created: created.length, errors }, { status: 201 })
}
