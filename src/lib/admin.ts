import { auth } from "@/auth"
import { db } from "@/lib/db"
import { roles, rolePermissions, userRoles, permissions } from "@lbdevz/db"
import { eq, inArray } from "drizzle-orm"
import type { AdminPermissionKey } from "@/lib/admin-permissions"

export { ADMIN_PERMISSIONS } from "@/lib/admin-permissions"
export type { AdminPermissionKey } from "@/lib/admin-permissions"

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim()).filter(Boolean)

// ─── Super admin check (email-based) ─────────────────────────────────────────
export async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return null
  if (!ADMIN_EMAILS.includes(session.user.email ?? "")) return null
  return session
}

export function isSuperAdmin(email: string | null | undefined) {
  return ADMIN_EMAILS.includes(email ?? "")
}

// ─── Get all permission keys for a user via their roles ──────────────────────
export async function getAdminPermissions(userId: string): Promise<string[]> {
  // Get all roles the user has
  const userRoleRows = await db
    .select({ roleId: userRoles.roleId })
    .from(userRoles)
    .where(eq(userRoles.userId, userId))

  if (userRoleRows.length === 0) return []

  const roleIds = userRoleRows.map(r => r.roleId)

  // Get all permission keys for those roles
  const permRows = await db
    .select({ key: rolePermissions.permissionKey })
    .from(rolePermissions)
    .where(inArray(rolePermissions.roleId, roleIds))

  return [...new Set(permRows.map(p => p.key))]
}

// ─── Combined access check ────────────────────────────────────────────────────
// Returns { session, isSuperAdmin, permissions } or null if no access at all
export async function requireAdminAccess() {
  const session = await auth()
  if (!session?.user) return null

  const superAdmin = isSuperAdmin(session.user.email)
  if (superAdmin) {
    return { session, isSuperAdmin: true, permissions: null as null }
  }

  // Not a super admin — check if they have any admin permissions via roles
  const perms = await getAdminPermissions(session.user.id!)
  if (perms.length === 0) return null

  return { session, isSuperAdmin: false, permissions: perms }
}

// ─── Permission-aware guard for API routes ───────────────────────────────────
// Super admin always passes. Role-based users pass only if they have the key.
export async function requirePermission(key: AdminPermissionKey) {
  const session = await auth()
  if (!session?.user) return null

  if (isSuperAdmin(session.user.email)) return session

  const perms = await getAdminPermissions(session.user.id!)
  if (!perms.includes(key)) return null

  return session
}
