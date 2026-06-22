import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { ser } from "@/lib/db-util"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const rows = ser(await db.execute(sql`
    SELECT b.*, u.name as author_name, u.image as author_image
    FROM blog_posts b
    LEFT JOIN users u ON u.id = b.author_id
    WHERE b.slug = ${slug} AND b.published = true
    LIMIT 1
  `))
  if (!rows[0]) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 })
  return NextResponse.json(rows[0])
}