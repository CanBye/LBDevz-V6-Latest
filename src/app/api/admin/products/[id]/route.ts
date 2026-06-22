import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { products } from "@lbdevz/db"
import { eq } from "drizzle-orm"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(ADMIN_PERMISSIONS.PRODUCTS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const { id } = await params
  const body = await req.json()

  const updateData: Record<string, unknown> = {}
  if (body.name !== undefined) updateData.name = body.name
  if (body.description !== undefined) updateData.description = body.description
  if (body.price !== undefined) updateData.priceCredits = Number(body.price)
  if (body.category !== undefined) updateData.category = body.category
  if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl
  if (body.featured !== undefined) updateData.featured = body.featured
  if (body.active !== undefined) {
    updateData.status = body.active ? "active" : "archived"
  }
  if (body.status !== undefined) updateData.status = body.status
  updateData.updatedAt = new Date()

  const [updated] = await db
    .update(products)
    .set(updateData)
    .where(eq(products.id, id))
    .returning()

  if (!updated) return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(ADMIN_PERMISSIONS.PRODUCTS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const { id } = await params

  const [updated] = await db
    .update(products)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning()

  if (!updated) return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 })
  return NextResponse.json({ success: true })
}