import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { ser } from "@/lib/db-util"

export async function GET(req: NextRequest) {
  const session = await requirePermission(ADMIN_PERMISSIONS.ORDERS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("q") ?? ""
  const limit  = Math.min(200, Number(searchParams.get("limit") ?? "100"))
  const like   = `%${search}%`

  const rows = ser(await db.execute(sql`
    SELECT
      o.id, o.price_paid, o.created_at,
      p.name  AS product_name, p.id AS product_id,
      u.name  AS user_name, u.email AS user_email, u.image AS user_image
    FROM orders o
    JOIN products p ON p.id = o.product_id
    JOIN users   u ON u.id  = o.user_id
    WHERE (
      ${search} = '' OR
      u.email ILIKE ${like} OR
      u.name  ILIKE ${like} OR
      p.name  ILIKE ${like}
    )
    ORDER BY o.created_at DESC
    LIMIT ${limit}
  `))

  return NextResponse.json(rows)
}