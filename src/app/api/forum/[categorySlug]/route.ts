import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { ser } from "@/lib/db-util"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params
  const cats = ser(await db.execute(sql`SELECT * FROM forum_categories WHERE slug = ${categorySlug} AND visible = true LIMIT 1`))
  if (!cats[0]) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 })
  const cat = cats[0]
  const topics = ser(await db.execute(sql`
    SELECT t.*, u.name as author_name, u.image as author_image,
      COUNT(r.id)::int as reply_count
    FROM forum_topics t
    LEFT JOIN users u ON u.id = t.author_id
    LEFT JOIN forum_replies r ON r.topic_id = t.id
    WHERE t.category_id = ${cat.id}
    GROUP BY t.id, u.name, u.image
    ORDER BY t.pinned DESC, t.created_at DESC
  `))
  return NextResponse.json({ category: cat, topics })
}