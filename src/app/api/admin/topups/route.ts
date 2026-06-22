import { NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { topupRequests } from "@lbdevz/db"
import { desc } from "drizzle-orm"

export async function GET() {
  const session = await requirePermission(ADMIN_PERMISSIONS.TOPUPS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const items = await db
    .select()
    .from(topupRequests)
    .orderBy(desc(topupRequests.createdAt))

  return NextResponse.json(items)
}