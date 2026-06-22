import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { ser } from "@/lib/db-util"

export async function GET() {
  const session = await requirePermission(ADMIN_PERMISSIONS.AGREEMENTS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const rows = ser(await db.execute(sql`SELECT id, slug, title, updated_at FROM legal_pages ORDER BY created_at ASC`))
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await requirePermission(ADMIN_PERMISSIONS.AGREEMENTS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { slug, title, content } = await req.json()
  if (!slug || !title) return NextResponse.json({ error: "slug ve title zorunlu" }, { status: 400 })
  await db.execute(sql`INSERT INTO legal_pages (slug, title, content) VALUES (${slug}, ${title}, ${content ?? ""})`)
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest) {
  const session = await requirePermission(ADMIN_PERMISSIONS.AGREEMENTS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { id, title, content } = await req.json()
  if (!id) return NextResponse.json({ error: "id zorunlu" }, { status: 400 })
  await db.execute(sql`UPDATE legal_pages SET title = ${title}, content = ${content}, updated_at = NOW() WHERE id = ${id}`)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await requirePermission(ADMIN_PERMISSIONS.AGREEMENTS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { id } = await req.json()
  await db.execute(sql`DELETE FROM legal_pages WHERE id = ${id}`)
  return NextResponse.json({ ok: true })
}