import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { notifications, users } from "@lbdevz/db"
import { eq } from "drizzle-orm"

export async function POST(req: NextRequest) {
  const session = await requirePermission(ADMIN_PERMISSIONS.NOTIFICATIONS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const { target, userId, type, title, body, link } = await req.json()
  if (!title || !body) return NextResponse.json({ error: "Başlık ve mesaj zorunlu" }, { status: 400 })

  let targetUsers: { id: string }[] = []

  if (target === "all") {
    targetUsers = await db.select({ id: users.id }).from(users)
  } else if (target === "user" && userId) {
    targetUsers = [{ id: userId }]
  } else {
    return NextResponse.json({ error: "Geçersiz hedef" }, { status: 400 })
  }

  if (targetUsers.length === 0) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 })

  await db.insert(notifications).values(
    targetUsers.map(u => ({
      userId: u.id,
      type: type ?? "info",
      title,
      body,
      link: link ?? null,
    }))
  )

  return NextResponse.json({ ok: true, count: targetUsers.length })
}