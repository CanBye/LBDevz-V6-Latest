import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { products, productDevelopers, users } from "@lbdevz/db"
import { desc, eq } from "drizzle-orm"

export async function GET() {
  const session = await requirePermission(ADMIN_PERMISSIONS.PRODUCTS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const items = await db
    .select({
      id: products.id, slug: products.slug, name: products.name,
      description: products.description, type: products.type,
      priceCredits: products.priceCredits, status: products.status,
      category: products.category, imageUrl: products.imageUrl,
      featured: products.featured, visibility: products.visibility,
      enableLicense: products.enableLicense, enableObf: products.enableObf,
      createdAt: products.createdAt, updatedAt: products.updatedAt,
      approvedAt: products.approvedAt,
      approvedByName: users.name,
      approvedByEmail: users.email,
    })
    .from(products)
    .leftJoin(users, eq(products.approvedBy, users.id))
    .orderBy(desc(products.createdAt))
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const session = await requirePermission(ADMIN_PERMISSIONS.PRODUCTS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const body = await req.json()
  const { name, description, price, category, imageUrl, featured, type, licenseModel, enableLicense, enableObf, developerIds } = body

  if (!name || price == null) {
    return NextResponse.json({ error: "Ad ve fiyat zorunlu" }, { status: 400 })
  }

  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  const slug = `${baseSlug}-${Date.now()}`

  const [created] = await db.insert(products).values({
    slug,
    name,
    description: description ?? null,
    type: type ?? "other",
    priceCredits: Number(price),
    ownerId: session.user.id!,
    licenseModel: licenseModel ?? "lifetime",
    category: category ?? null,
    imageUrl: imageUrl ?? null,
    featured: featured ?? false,
    enableLicense: enableLicense ?? true,
    enableObf: enableObf ?? false,
    status: "draft",
    visibility: "public",
  }).returning()

  if (Array.isArray(developerIds) && developerIds.length > 0) {
    await db.insert(productDevelopers).values(
      developerIds.map((userId: string) => ({ productId: created.id, userId }))
    )
  }

  return NextResponse.json(created, { status: 201 })
}