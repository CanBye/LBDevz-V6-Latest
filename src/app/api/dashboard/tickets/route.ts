import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { tickets, ticketMessages } from "@lbdevz/db"
import { eq, desc } from "drizzle-orm"
import { notify } from "@/lib/discord"
import { verifyTurnstile } from "@/lib/turnstile"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rows = await db
    .select()
    .from(tickets)
    .where(eq(tickets.userId, session.user.id!))
    .orderBy(desc(tickets.lastActivityAt))

  return NextResponse.json({ tickets: rows })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const ip = getClientIp(req)
  const rl = checkRateLimit(`ticket:${session.user.id}:${ip}`, { limit: 5, windowMs: 60 * 60 * 1000 })
  if (!rl.success) {
    return NextResponse.json(
      { error: "Çok fazla talep oluşturdunuz. Lütfen 1 saat sonra tekrar deneyin." },
      { status: 429 }
    )
  }

  const { subject, category, priority, message, turnstileToken } = await req.json()

  if (!subject || !category || !message) {
    return NextResponse.json({ error: "Eksik alanlar" }, { status: 400 })
  }

  const valid = await verifyTurnstile(turnstileToken ?? "")
  if (!valid) {
    return NextResponse.json({ error: "Bot doğrulaması başarısız" }, { status: 400 })
  }

  const [ticket] = await db
    .insert(tickets)
    .values({
      userId: session.user.id!,
      subject,
      category,
      priority: priority ?? "normal",
      status: "open",
    })
    .returning()

  await db.insert(ticketMessages).values({
    ticketId: ticket.id,
    authorId: session.user.id!,
    body: message,
    isInternal: false,
  })

  notify.newTicket(
    session.user.name ?? session.user.email ?? "Kullanıcı",
    subject,
    priority ?? "normal",
    session.user.image
  ).catch(console.error)

  return NextResponse.json({ ticket })
}
