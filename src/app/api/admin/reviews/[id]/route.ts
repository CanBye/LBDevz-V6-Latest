import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { reviews } from "@lbdevz/db"
import { eq } from "drizzle-orm"

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await requirePermission(ADMIN_PERMISSIONS.REVIEWS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { id } = await params
  const body = await req.json()
  const { name, role, quote, image, rating, visible, order } = body
  const [row] = await db.update(reviews).set({
    ...(name !== undefined && { name }),
    ...(role !== undefined && { role }),
    ...(quote !== undefined && { quote }),
    ...(image !== undefined && { image }),
    ...(rating !== undefined && { rating }),
    ...(visible !== undefined && { visible }),
    ...(order !== undefined && { order }),
  }).where(eq(reviews.id, id)).returning()
  return NextResponse.json(row)
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await requirePermission(ADMIN_PERMISSIONS.REVIEWS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { id } = await params
  await db.delete(reviews).where(eq(reviews.id, id))
  return NextResponse.json({ ok: true })
}