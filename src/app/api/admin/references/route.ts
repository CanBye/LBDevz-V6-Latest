import { NextRequest, NextResponse } from "next/server"
import { requireAdminAccess } from "@/lib/admin"
import { db } from "@/lib/db"
import { referenceServers } from "@lbdevz/db"
import { asc } from "drizzle-orm"

export async function GET() {
  const access = await requireAdminAccess()
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rows = await db
    .select()
    .from(referenceServers)
    .orderBy(asc(referenceServers.order), asc(referenceServers.createdAt))

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const access = await requireAdminAccess()
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name, href, logoUrl, players, showInHero, showInSection, order } = body

  if (!name?.trim()) return NextResponse.json({ error: "İsim gerekli" }, { status: 400 })

  const [row] = await db
    .insert(referenceServers)
    .values({
      name:          name.trim(),
      href:          href?.trim() || null,
      logoUrl:       logoUrl?.trim() || null,
      players:       Number(players) || 0,
      showInHero:    showInHero ?? true,
      showInSection: showInSection ?? true,
      order:         Number(order) || 0,
    })
    .returning()

  return NextResponse.json(row, { status: 201 })
}