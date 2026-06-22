import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { ser } from "@/lib/db-util"

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await requirePermission(ADMIN_PERMISSIONS.FORUM)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { id } = await params
  const { name, description, icon, color, minChars, requireTitle, rules, order, visible } = await req.json()
  const rows = ser(await db.execute(sql`
    UPDATE forum_categories SET
      name          = COALESCE(${name ?? null}, name),
      description   = COALESCE(${description ?? null}, description),
      icon          = COALESCE(${icon ?? null}, icon),
      color         = COALESCE(${color ?? null}, color),
      min_chars     = COALESCE(${minChars ?? null}, min_chars),
      require_title = COALESCE(${requireTitle ?? null}, require_title),
      rules         = COALESCE(${rules ?? null}, rules),
      "order"       = COALESCE(${order ?? null}, "order"),
      visible       = COALESCE(${visible ?? null}, visible)
    WHERE id = ${id} RETURNING *
  `))
  return NextResponse.json(rows[0] ?? {})
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await requirePermission(ADMIN_PERMISSIONS.FORUM)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { id } = await params
  await db.execute(sql`DELETE FROM forum_categories WHERE id = ${id}`)
  return NextResponse.json({ ok: true })
}