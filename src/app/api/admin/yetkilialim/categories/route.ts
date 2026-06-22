import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { ser } from "@/lib/db-util"

export async function GET() {
  const session = await requirePermission(ADMIN_PERMISSIONS.YETKILIALIM)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const cats = ser(await db.execute(sql`SELECT * FROM auth_purchase_categories ORDER BY "order", created_at`))
  const result = await Promise.all(cats.map(async (cat: any) => {
    const fields = ser(await db.execute(sql`SELECT * FROM auth_purchase_fields WHERE category_id = ${cat.id} ORDER BY "order"`))
    return { ...cat, fields }
  }))
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const session = await requirePermission(ADMIN_PERMISSIONS.YETKILIALIM)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { name, description, icon, color, visible, order } = await req.json()
  if (!name) return NextResponse.json({ error: "Ad zorunlu" }, { status: 400 })
  const rows = ser(await db.execute(sql`
    INSERT INTO auth_purchase_categories (name, description, icon, color, visible, "order")
    VALUES (${name}, ${description ?? null}, ${icon ?? "carbon:user-certification"}, ${color ?? "#6366f1"}, ${visible ?? true}, ${order ?? 0})
    RETURNING *
  `))
  return NextResponse.json(rows[0] ?? {}, { status: 201 })
}