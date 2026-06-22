import { db } from "@/lib/db"
import { userRoles, rolePermissions } from "@lbdevz/db"
import { eq } from "drizzle-orm"
import type { Permission } from "./permissions"

export async function getUserPermissions(userId: string): Promise<Permission[]> {
  const rows = await db
    .select({ permission: rolePermissions.permissionKey })
    .from(userRoles)
    .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
    .where(eq(userRoles.userId, userId))

  return [...new Set(rows.map((r) => r.permission))] as Permission[]
}

export async function hasPermission(
  userId: string,
  permission: Permission,
): Promise<boolean> {
  const perms = await getUserPermissions(userId)
  return perms.includes(permission)
}

export async function requirePermission(
  userId: string,
  permission: Permission,
): Promise<void> {
  const allowed = await hasPermission(userId, permission)
  if (!allowed) {
    throw new Error(`Forbidden: missing permission '${permission}'`)
  }
}