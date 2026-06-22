import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { ser } from "@/lib/db-util"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })

  const rows = ser(await db.execute(sql`
    SELECT a.id, a.status, a.admin_note, a.created_at, a.reviewed_at, a.answers,
           c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM auth_purchase_applications a
    JOIN auth_purchase_categories c ON c.id = a.category_id
    WHERE a.user_id = ${session.user.id!}
    ORDER BY a.created_at DESC
  `))
  return NextResponse.json(rows)
}