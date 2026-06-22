import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { ser } from "@/lib/db-util"

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await requirePermission(ADMIN_PERMISSIONS.YETKILIALIM)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { id } = await params
  const { name, description, icon, color, visible, order } = await req.json()
  const rows = ser(await db.execute(sql`
    UPDATE auth_purchase_categories SET
      name        = COALESCE(${name ?? null}, name),
      description = COALESCE(${description ?? null}, description),
      icon        = COALESCE(${icon ?? null}, icon),
      color       = COALESCE(${color ?? null}, color),
      visible     = COALESCE(${visible ?? null}, visible),
      "order"     = COALESCE(${order ?? null}, "order")
    WHERE id = ${id} RETURNING *
  `))
  return NextResponse.json(rows[0] ?? {})
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await requirePermission(ADMIN_PERMISSIONS.YETKILIALIM)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { id } = await params
  await db.execute(sql`DELETE FROM auth_purchase_categories WHERE id = ${id}`)
  return NextResponse.json({ ok: true })
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await requirePermission(ADMIN_PERMISSIONS.YETKILIALIM)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { id } = await params
  const { fields } = await req.json()
  await db.execute(sql`DELETE FROM auth_purchase_fields WHERE category_id = ${id}`)
  for (const f of fields) {
    await db.execute(sql`
      INSERT INTO auth_purchase_fields (category_id, label, placeholder, field_type, options, required, min_length, max_length, "order")
      VALUES (${id}, ${f.label}, ${f.placeholder ?? null}, ${f.fieldType ?? "text"}, ${f.options ?? null}, ${f.required ?? true}, ${f.minLength ?? 0}, ${f.maxLength ?? 500}, ${f.order ?? 0})
    `)
  }
  const rows = ser(await db.execute(sql`SELECT * FROM auth_purchase_fields WHERE category_id = ${id} ORDER BY "order"`))
  return NextResponse.json(rows)
}