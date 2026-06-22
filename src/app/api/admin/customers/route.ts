import { NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { ser } from "@/lib/db-util"

export async function GET() {
  const session = await requirePermission(ADMIN_PERMISSIONS.CUSTOMERS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  // Single optimized query: users + license count + balance + roles
  const rows = ser(await db.execute(sql`
    SELECT
      u.id,
      u.name,
      u.username,
      u.email,
      u.image,
      u.created_at as "createdAt",
      COUNT(DISTINCT l.id)::int           AS "licenseCount",
      COALESCE(MAX(ct.balance_after), 0)  AS balance,
      COALESCE(
        json_agg(
          json_build_object('id', r.id, 'name', r.name, 'color', r.color, 'priority', r.priority)
          ORDER BY r.priority DESC
        ) FILTER (WHERE r.id IS NOT NULL),
        '[]'::json
      ) AS roles
    FROM users u
    LEFT JOIN licenses          l  ON l.user_id   = u.id
    LEFT JOIN credit_transactions ct ON ct.user_id = u.id
    LEFT JOIN user_roles        ur ON ur.user_id  = u.id
    LEFT JOIN roles             r  ON r.id        = ur.role_id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `))

  return NextResponse.json(rows)
}