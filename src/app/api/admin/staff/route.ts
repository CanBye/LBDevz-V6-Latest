import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { db } from "@/lib/db"
import { users, userRoles, roles } from "@lbdevz/db"
import { eq } from "drizzle-orm"

// Returns all users who have at least one role (staff / admin panel access)
export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rows = await db
    .selectDistinct({
      id:       users.id,
      name:     users.name,
      username: users.username,
      email:    users.email,
      image:    users.image,
    })
    .from(users)
    .innerJoin(userRoles, eq(userRoles.userId, users.id))
    .orderBy(users.name)

  return NextResponse.json(rows)
}