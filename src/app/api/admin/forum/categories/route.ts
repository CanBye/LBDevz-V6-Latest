import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { ser } from "@/lib/db-util"

export async function GET() {
  const session = await requirePermission(ADMIN_PERMISSIONS.FORUM)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const rows = ser(await db.execute(sql`SELECT * FROM forum_categories ORDER BY "order", created_at`))
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await requirePermission(ADMIN_PERMISSIONS.FORUM)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { name, description, icon, color, minChars, requireTitle, rules, order, visible } = await req.json()
  if (!name) return NextResponse.json({ error: "Ad zorunlu" }, { status: 400 })
  const slug = name.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 40) + "-" + Date.now().toString(36)
  const rows = ser(await db.execute(sql`
    INSERT INTO forum_categories (name, slug, description, icon, color, min_chars, require_title, rules, "order", visible)
    VALUES (${name}, ${slug}, ${description ?? null}, ${icon ?? "carbon:forum"}, ${color ?? "#6366f1"},
            ${minChars ?? 50}, ${requireTitle ?? true}, ${rules ?? null}, ${order ?? 0}, ${visible ?? true})
    RETURNING *
  `))
  return NextResponse.json(rows[0] ?? {}, { status: 201 })
}