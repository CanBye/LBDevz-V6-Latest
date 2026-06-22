import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { webhookConfigs } from "@lbdevz/db"
import { eq } from "drizzle-orm"

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await requirePermission(ADMIN_PERMISSIONS.WEBHOOKS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { id } = await params
  const body = await req.json()
  const [row] = await db.update(webhookConfigs)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(webhookConfigs.id, id))
    .returning()
  return NextResponse.json(row)
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await requirePermission(ADMIN_PERMISSIONS.WEBHOOKS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { id } = await params
  await db.delete(webhookConfigs).where(eq(webhookConfigs.id, id))
  return NextResponse.json({ ok: true })
}