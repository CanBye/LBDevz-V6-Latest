import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { ser } from "@/lib/db-util"

export async function POST(req: NextRequest, { params }: { params: Promise<{ categorySlug: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Giriş yapman gerekiyor" }, { status: 401 })

  const { categorySlug } = await params
  const cats = ser(await db.execute(sql`SELECT * FROM forum_categories WHERE slug = ${categorySlug} AND visible = true LIMIT 1`))
  if (!cats[0]) return NextResponse.json({ error: "Kategori bulunamadı" }, { status: 404 })
  const cat = cats[0]

  const { title, content } = await req.json()
  if (cat.require_title && !title?.trim()) return NextResponse.json({ error: "Başlık zorunlu" }, { status: 400 })
  if (!content?.trim()) return NextResponse.json({ error: "İçerik zorunlu" }, { status: 400 })
  if (content.trim().length < cat.min_chars) return NextResponse.json({ error: `İçerik en az ${cat.min_chars} karakter olmalı (şu an: ${content.trim().length})` }, { status: 400 })

  const rows = ser(await db.execute(sql`
    INSERT INTO forum_topics (category_id, author_id, title, content)
    VALUES (${cat.id}, ${session.user.id!}, ${title?.trim() ?? "Konu"}, ${content.trim()})
    RETURNING *
  `))
  return NextResponse.json(rows[0] ?? {}, { status: 201 })
}