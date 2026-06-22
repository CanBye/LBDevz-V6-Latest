import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { ser } from "@/lib/db-util"

export async function GET(req: NextRequest) {
  const session = await requirePermission(ADMIN_PERMISSIONS.REVENUE)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const days = Math.min(365, Math.max(7, Number(searchParams.get("days") ?? "30")))

  const [daily, products, totals, topBuyers] = await Promise.all([
    // Daily revenue
    db.execute(sql`
      SELECT
        DATE(created_at) AS date,
        COUNT(*)::int    AS order_count,
        SUM(price_paid)::int AS revenue
      FROM orders
      WHERE created_at > NOW() - INTERVAL '1 day' * ${days}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `),
    // Per product
    db.execute(sql`
      SELECT
        p.id, p.name,
        COUNT(o.id)::int       AS order_count,
        SUM(o.price_paid)::int AS revenue
      FROM orders o
      JOIN products p ON p.id = o.product_id
      WHERE o.created_at > NOW() - INTERVAL '1 day' * ${days}
      GROUP BY p.id, p.name
      ORDER BY revenue DESC
      LIMIT 10
    `),
    // Totals
    db.execute(sql`
      SELECT
        COUNT(*)::int              AS total_orders,
        COALESCE(SUM(price_paid),0)::int AS total_revenue,
        COALESCE(AVG(price_paid),0)::int AS avg_order,
        COUNT(DISTINCT user_id)::int     AS unique_buyers
      FROM orders
      WHERE created_at > NOW() - INTERVAL '1 day' * ${days}
    `),
    // Top buyers
    db.execute(sql`
      SELECT
        u.name, u.email, u.image,
        COUNT(o.id)::int       AS order_count,
        SUM(o.price_paid)::int AS spent
      FROM orders o
      JOIN users u ON u.id = o.user_id
      WHERE o.created_at > NOW() - INTERVAL '1 day' * ${days}
      GROUP BY u.id, u.name, u.email, u.image
      ORDER BY spent DESC
      LIMIT 5
    `),
  ])

  return NextResponse.json({
    daily:     ser(daily),
    products:  ser(products),
    totals:    ser(totals)[0] ?? {},
    topBuyers: ser(topBuyers),
  })
}