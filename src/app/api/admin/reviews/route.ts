import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { reviews } from "@lbdevz/db"
import { eq, asc } from "drizzle-orm"

export async function GET() {
  const session = await requirePermission(ADMIN_PERMISSIONS.REVIEWS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const rows = await db.select().from(reviews).orderBy(asc(reviews.order), asc(reviews.createdAt))
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await requirePermission(ADMIN_PERMISSIONS.REVIEWS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { name, role, quote, image, rating, visible, order } = await req.json()
  if (!name || !role || !quote) return NextResponse.json({ error: "Ad, rol ve yorum zorunlu" }, { status: 400 })
  const [row] = await db.insert(reviews).values({ name, role, quote, image: image ?? null, rating: rating ?? 5, visible: visible ?? true, order: order ?? 0 }).returning()
  return NextResponse.json(row, { status: 201 })
}