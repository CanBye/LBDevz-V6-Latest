import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { topupRequests, creditTransactions } from "@lbdevz/db"
import { eq, desc } from "drizzle-orm"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })

  try {
    const [transactions, pendingTopups] = await Promise.all([
      db
        .select()
        .from(creditTransactions)
        .where(eq(creditTransactions.userId, session.user.id))
        .orderBy(desc(creditTransactions.createdAt))
        .limit(20),
      db
        .select()
        .from(topupRequests)
        .where(eq(topupRequests.userId, session.user.id))
        .orderBy(desc(topupRequests.createdAt))
        .limit(5),
    ])

    return NextResponse.json({
      transactions,
      pendingTopups,
    })
  } catch (err) {
    console.error("Kredi Data API Error:", err)
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
  }
}
