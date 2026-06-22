import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { tickets, ticketMessages } from "@lbdevz/db"
import { eq, and, asc } from "drizzle-orm"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const [ticket] = await db
    .select()
    .from(tickets)
    .where(and(eq(tickets.id, id), eq(tickets.userId, session.user.id!)))
    .limit(1)

  if (!ticket) return NextResponse.json({ error: "Ticket bulunamadı" }, { status: 404 })

  const messages = await db
    .select()
    .from(ticketMessages)
    .where(eq(ticketMessages.ticketId, id))
    .orderBy(asc(ticketMessages.createdAt))

  return NextResponse.json({ ticket, messages })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { message } = await req.json()

  if (!message) return NextResponse.json({ error: "Mesaj gerekli" }, { status: 400 })

  const [ticket] = await db
    .select()
    .from(tickets)
    .where(and(eq(tickets.id, id), eq(tickets.userId, session.user.id!)))
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
    .set({ lastActivityAt: new Date(), updatedAt: new Date(), status: "pending" })
    .where(eq(tickets.id, id))

  return NextResponse.json({ message: msg })
}