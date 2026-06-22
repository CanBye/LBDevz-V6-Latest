import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { db } from "@/lib/db"
import { userRoles } from "@lbdevz/db"
import { and, eq } from "drizzle-orm"

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { userId, roleId } = await req.json()
  if (!userId || !roleId) return NextResponse.json({ error: "userId ve roleId zorunlu" }, { status: 400 })
  await db.insert(userRoles).values({ userId, roleId, assignedBy: session.user!.id! }).onConflictDoNothing()
  return NextResponse.json({ ok: true })
}