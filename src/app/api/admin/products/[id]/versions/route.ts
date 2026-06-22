import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { productVersions, products } from "@lbdevz/db"
import { eq, desc } from "drizzle-orm"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(ADMIN_PERMISSIONS.PRODUCTS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const { id } = await params

  const versions = await db
    .select()
    .from(productVersions)
    .where(eq(productVersions.productId, id))
    .orderBy(desc(productVersions.createdAt))

  return NextResponse.json({ versions })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(ADMIN_PERMISSIONS.PRODUCTS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const { id } = await params
  const { version, changelog, fileKey, blobKey, published } = await req.json()

  if (!version) return NextResponse.json({ error: "Versiyon gerekli" }, { status: 400 })

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1)

  if (!product) return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 })

  const [newVersion] = await db
    .insert(productVersions)
    .values({
      productId: id,
      version,
      changelog: changelog ?? null,
      fileKey: fileKey ?? null,
      blobKey: blobKey ?? null,
      published: published ?? false,
    })
    .returning()

  return NextResponse.json({ version: newVersion })
}