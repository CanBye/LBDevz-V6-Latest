import { NextRequest, NextResponse } from "next/server"
import { requireAdminAccess } from "@/lib/admin"
import { db } from "@/lib/db"
import { referenceServers } from "@lbdevz/db"
import { eq } from "drizzle-orm"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireAdminAccess()
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const [row] = await db
    .update(referenceServers)
    .set({
      name:          body.name?.trim(),
      href:          body.href?.trim() || null,
      logoUrl:       body.logoUrl?.trim() || null,
      players:       body.players !== undefined ? Number(body.players) : undefined,
      showInHero:    body.showInHero,
      showInSection: body.showInSection,
      order:         body.order !== undefined ? Number(body.order) : undefined,
      visible:       body.visible,
    })
    .where(eq(referenceServers.id, id))
    .returning()

  return NextResponse.json(row)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireAdminAccess()
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await db.delete(referenceServers).where(eq(referenceServers.id, id))
  return NextResponse.json({ ok: true })
}