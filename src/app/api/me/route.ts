import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { getUserBalance } from "@/lib/credits"
import { userRoles, roles } from "@lbdevz/db"
import { eq } from "drizzle-orm"

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim()).filter(Boolean)

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })

  const [balance, userRoleRows] = await Promise.all([
    getUserBalance(session.user.id!),
    db.select({ name: roles.name, color: roles.color, priority: roles.priority })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, session.user.id!))
      .orderBy(roles.priority),
  ])

  const isSuperAdmin = ADMIN_EMAILS.includes(session.user.email ?? "")
  const topRole = userRoleRows.length > 0 ? userRoleRows[userRoleRows.length - 1] : null
  // Admin panel linki: süper admin VEYA en az bir rolü olan kullanıcıya göster
  const isAdmin = isSuperAdmin || userRoleRows.length > 0

  return NextResponse.json({
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    balance,
    isAdmin,
    role: topRole ? { name: topRole.name, color: topRole.color } : null,
  })
}