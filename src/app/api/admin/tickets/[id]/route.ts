import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { tickets, ticketMessages, users } from "@lbdevz/db"
import { eq, asc } from "drizzle-orm"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(ADMIN_PERMISSIONS.TICKETS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const { id } = await params

  const [ticket] = await db
    .select()
    .from(tickets)
    .where(eq(tickets.id, id))
    .limit(1)

  if (!ticket) return NextResponse.json({ error: "Ticket bulunamadı" }, { status: 404 })

  const messages = await db
    .select({
      message: ticketMessages,
      author: { id: users.id, name: users.name, email: users.email },
    })
    .from(ticketMessages)
    .leftJoin(users, eq(ticketMessages.authorId, users.id))
    .where(eq(ticketMessages.ticketId, id))
    .orderBy(asc(ticketMessages.createdAt))

  return NextResponse.json({ ticket, messages })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(ADMIN_PERMISSIONS.TICKETS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const { id } = await params
  const { status } = await req.json()

  const validStatuses = ["open", "answered", "pending", "closed"]
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 })
  }

  await db
    .update(tickets)
    .set({
      status: status as "open" | "answered" | "pending" | "closed",
      updatedAt: new Date(),
      lastActivityAt: new Date(),
    })
    .where(eq(tickets.id, id))

  return NextResponse.json({ success: true })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(ADMIN_PERMISSIONS.TICKETS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const { id } = await params
  const { message } = await req.json()

  if (!message) return NextResponse.json({ error: "Mesaj gerekli" }, { status: 400 })

  const [ticket] = await db
    .select()
    .from(tickets)
    .where(eq(tickets.id, id))
    .limit(1)

  if (!ticket) return NextResponse.json({ error: "Ticket bulunamadı" }, { status: 404 })

  const [msg] = await db
    .insert(ticketMessages)
    .values({
      ticketId: id,
      authorId: session.user.id!,
      body: message,
      isInternal: false,
    })
    .returning()

  await db
    .update(tickets)
    .set({
      status: "answered",
      lastActivityAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(tickets.id, id))

  return NextResponse.json({ message: msg })
}