import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { users, licenses, creditTransactions } from "@lbdevz/db"
import { eq, count, sql } from "drizzle-orm"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id!))
    .limit(1)

  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 })

  const [licenseCount] = await db
    .select({ count: count() })
    .from(licenses)
    .where(eq(licenses.userId, session.user.id!))

  const [spending] = await db
    .select({ total: sql<number>`COALESCE(ABS(SUM(amount)), 0)` })
    .from(creditTransactions)
    .where(
      sql`user_id = ${session.user.id!} AND type = 'purchase'`
    )

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    image: user.image,
    createdAt: user.createdAt,
    totalLicenses: licenseCount?.count ?? 0,
    totalSpending: spending?.total ?? 0,
  })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { username } = await req.json()

  if (!username || typeof username !== "string") {
    return NextResponse.json({ error: "Geçerli bir kullanıcı adı girin" }, { status: 400 })
  }

  const clean = username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "")
  if (clean.length < 3 || clean.length > 32) {
    return NextResponse.json(
      { error: "Kullanıcı adı 3-32 karakter arasında olmalı" },
      { status: 400 }
    )
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, clean))
    .limit(1)

  if (existing && existing.id !== session.user.id) {
    return NextResponse.json({ error: "Bu kullanıcı adı zaten kullanılıyor" }, { status: 409 })
  }

  await db
    .update(users)
    .set({ username: clean, updatedAt: new Date() })
    .where(eq(users.id, session.user.id!))

  return NextResponse.json({ success: true, username: clean })
}