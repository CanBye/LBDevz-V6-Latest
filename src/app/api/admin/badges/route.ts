import { NextResponse } from "next/server"
import { requireAdminAccess } from "@/lib/admin"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { ser } from "@/lib/db-util"

export async function GET() {
  const access = await requireAdminAccess()
  if (!access) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const [apps, tickets, topups] = await Promise.all([
    db.execute(sql`SELECT COUNT(*)::int as count FROM auth_purchase_applications WHERE status = 'pending'`),
    db.execute(sql`SELECT COUNT(*)::int as count FROM tickets WHERE status = 'open'`),
    db.execute(sql`SELECT COUNT(*)::int as count FROM topup_requests WHERE status = 'pending'`),
  ])

  return NextResponse.json({
    applications: (ser(apps)[0] as any)?.count ?? 0,
    tickets:      (ser(tickets)[0] as any)?.count ?? 0,
    topups:       (ser(topups)[0] as any)?.count ?? 0,
  })
}