import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { roles } from "@lbdevz/db"
import { eq } from "drizzle-orm"

type Ctx = { params: Promise<{ id: string }> }

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await requirePermission(ADMIN_PERMISSIONS.ROLES)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { id } = await params
  await db.delete(roles).where(eq(roles.id, id))
  return NextResponse.json({ ok: true })
}