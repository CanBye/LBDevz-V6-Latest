import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { teamMembers } from "@lbdevz/db"
import { asc } from "drizzle-orm"

export async function GET() {
  const session = await requirePermission(ADMIN_PERMISSIONS.TEAM)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const rows = await db.select().from(teamMembers).orderBy(asc(teamMembers.order), asc(teamMembers.createdAt))
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await requirePermission(ADMIN_PERMISSIONS.TEAM)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { name, role, bio, image, github, discord, twitter, order, visible } = await req.json()
  if (!name || !role) return NextResponse.json({ error: "Ad ve rol zorunlu" }, { status: 400 })
  const [row] = await db.insert(teamMembers).values({
    name, role, bio: bio ?? null, image: image ?? null,
    github: github ?? null, discord: discord ?? null, twitter: twitter ?? null,
    order: order ?? 0, visible: visible ?? true,
  }).returning()
  return NextResponse.json(row, { status: 201 })
}