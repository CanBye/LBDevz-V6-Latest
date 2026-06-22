import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { ser } from "@/lib/db-util"

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const rows = ser(await db.execute(sql`SELECT id, slug, title, content, updated_at FROM legal_pages WHERE slug = ${slug} LIMIT 1`))
  if (!rows[0]) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 })
  return NextResponse.json(rows[0])
}

export async function GET_ALL(_: NextRequest) {
  const rows = ser(await db.execute(sql`SELECT slug, title, updated_at FROM legal_pages ORDER BY created_at ASC`))
  return NextResponse.json(rows)
}