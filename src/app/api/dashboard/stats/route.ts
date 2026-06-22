import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { licenses, tickets, creditTransactions } from "@lbdevz/db"
import { eq, count, desc } from "drizzle-orm"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })

  try {
    const [licenseRes, ticketRes, transactions] = await Promise.all([
      db
        .select({ count: count() })
        .from(licenses)
        .where(eq(licenses.userId, session.user.id)),
      db
        .select({ count: count() })
        .from(tickets)
        .where(eq(tickets.userId, session.user.id)),
      db
        .select()
        .from(creditTransactions)
        .where(eq(creditTransactions.userId, session.user.id))
        .orderBy(desc(creditTransactions.createdAt))
        .limit(5),
    ])

    return NextResponse.json({
      activeLicenses: licenseRes[0]?.count ?? 0,
      activeTickets: ticketRes[0]?.count ?? 0,
      unpaidInvoices: 0, // Şimdilik 0, fatura sistemi eklendiğinde genişletilecek
      transactions,
    })
  } catch (err) {
    console.error("Stats API Error:", err)
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
  }
}
