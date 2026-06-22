import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { notifications } from "@lbdevz/db"
import { eq, desc } from "drizzle-orm"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.user.id!))
    .orderBy(desc(notifications.createdAt))
    .limit(30)

  const unreadCount = rows.filter((n) => !n.read).length

  return NextResponse.json({ notifications: rows, unreadCount })
}

export async function PATCH() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.userId, session.user.id!))

  return NextResponse.json({ success: true })
}