import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { ser } from "@/lib/db-util"

export async function GET() {
  const session = await requirePermission(ADMIN_PERMISSIONS.SETTINGS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const rows = ser(await db.execute(sql`SELECT key, value FROM site_settings`))
  return NextResponse.json(Object.fromEntries(rows.map((r: any) => [r.key, r.value])))
}

export async function PATCH(req: NextRequest) {
  const session = await requirePermission(ADMIN_PERMISSIONS.SETTINGS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const updates: Record<string, string> = await req.json()
  for (const [key, value] of Object.entries(updates)) {
    await db.execute(sql`
      INSERT INTO site_settings (key, value, updated_at) VALUES (${key}, ${value}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = NOW()
    `)
  }
  return NextResponse.json({ ok: true })
}