import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { ser } from "@/lib/db-util"

export async function GET() {
  const rows = ser(await db.execute(sql`
    SELECT c.*,
      COUNT(DISTINCT t.id)::int as topic_count
    FROM forum_categories c
    LEFT JOIN forum_topics t ON t.category_id = c.id
    WHERE c.visible = true
    GROUP BY c.id
    ORDER BY c."order", c.created_at
  `))
  return NextResponse.json(rows)
}