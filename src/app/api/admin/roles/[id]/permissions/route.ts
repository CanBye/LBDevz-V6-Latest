import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { rolePermissions, permissions } from "@lbdevz/db"
import { eq } from "drizzle-orm"

type Ctx = { params: Promise<{ id: string }> }

// GET /api/admin/roles/[id]/permissions — list all permissions with assigned flag
export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await requirePermission(ADMIN_PERMISSIONS.ROLES)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const { id: roleId } = await params

  const [allPerms, assigned] = await Promise.all([
    db.select().from(permissions).orderBy(permissions.key),
    db.select({ key: rolePermissions.permissionKey })
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId)),
  ])

  const assignedKeys = new Set(assigned.map(r => r.key))

  return NextResponse.json(
    allPerms.map(p => ({ ...p, assigned: assignedKeys.has(p.key) }))
  )
}

// POST /api/admin/roles/[id]/permissions — set permissions for a role (replace all)
export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await requirePermission(ADMIN_PERMISSIONS.ROLES)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const { id: roleId } = await params
  const { keys }: { keys: string[] } = await req.json()

  if (!Array.isArray(keys)) {
    return NextResponse.json({ error: "keys array zorunlu" }, { status: 400 })
  }

  await db.transaction(async tx => {
    // Remove all existing permissions for this role
    await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId))

    // Insert new ones
    if (keys.length > 0) {
      await tx.insert(rolePermissions).values(
        keys.map(key => ({ roleId, permissionKey: key }))
      )
    }
  })

  return NextResponse.json({ ok: true })
}