import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { tickets, users } from "@lbdevz/db"
import { eq, desc } from "drizzle-orm"

export async function GET(req: NextRequest) {
  const session = await requirePermission(ADMIN_PERMISSIONS.TICKETS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const statusFilter = searchParams.get("status")

  let query = db
    .select({
      ticket: tickets,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(tickets)
    .leftJoin(users, eq(tickets.userId, users.id))
    .orderBy(desc(tickets.lastActivityAt))

  const rows = statusFilter
    ? await db
        .select({
          ticket: tickets,
          user: { id: users.id, name: users.name, email: users.email },
        })
        .from(tickets)
        .leftJoin(users, eq(tickets.userId, users.id))
        .where(eq(tickets.status, statusFilter as "open" | "answered" | "pending" | "closed"))
        .orderBy(desc(tickets.lastActivityAt))
    : await query

  return NextResponse.json({ tickets: rows })
}