import { db } from "@/lib/db"
import { creditTransactions } from "@lbdevz/db"
import { eq, desc, sql } from "drizzle-orm"

export async function getUserBalance(userId: string): Promise<number> {
  const result = await db
    .select({ balance: sql<number>`COALESCE(MAX(balance_after), 0)` })
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId))
  return result[0]?.balance ?? 0
}

export async function getUserTransactions(userId: string, limit = 10) {
  return db
    .select()
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId))
    .orderBy(desc(creditTransactions.createdAt))
    .limit(limit)
}