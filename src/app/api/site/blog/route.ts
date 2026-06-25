import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { ser } from "@/lib/db-util"

export const dynamic = "force-dynamic"

export async function GET() {
  const rows = ser(await db.execute(sql`
    SELECT b.id, b.title, b.slug, b.excerpt, b.cover_url, b.published_at, b.created_at,
           u.name as author_name, u.image as author_image
    FROM blog_posts b
    LEFT JOIN users u ON u.id = b.author_id
    WHERE b.published = true
    ORDER BY COALESCE(b.published_at, b.created_at) DESC
    LIMIT 20
  `))
  return NextResponse.json(rows)
}