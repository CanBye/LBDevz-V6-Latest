import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { db } from "@/lib/db"
import { roles } from "@lbdevz/db"
import { desc } from "drizzle-orm"

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const rows = await db.select().from(roles).orderBy(desc(roles.priority))
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { name, color, priority } = await req.json()
  if (!name) return NextResponse.json({ error: "Rol adı zorunlu" }, { status: 400 })
  const [row] = await db.insert(roles).values({ name, color: color ?? "#6366f1", priority: priority ?? 0 }).returning()
  return NextResponse.json(row, { status: 201 })
}