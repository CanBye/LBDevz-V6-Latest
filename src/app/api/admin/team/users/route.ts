import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { users } from "@lbdevz/db"
import { and, or, ilike, sql, desc } from "drizzle-orm"

// Kullanıcı seçici: ekip üyesi oluştururken kayıtlı kullanıcılardan seçip
// ad / profil fotoğrafı / Discord bilgilerini otomatik doldurmak için.
// ?q=arama (ad/email/username/discord), ?discordOnly=1 ile sadece Discord'lular.
//
// NOT: NextAuth Discord girişinde her zaman discord_id kolonunu doldurmuyor, ama
// avatar URL'i cdn.discordapp.com'dan geliyor. Bu yüzden "Discord'lular" filtresi
// hem discord_id'ye hem de Discord avatar URL'ine bakar.
const DISCORD_AVATAR = "%cdn.discordapp.com%"

export async function GET(req: NextRequest) {
  const session = await requirePermission(ADMIN_PERMISSIONS.TEAM)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim()
  const discordOnly = req.nextUrl.searchParams.get("discordOnly") === "1"

  const filters = []

  if (discordOnly) {
    filters.push(
      or(
        sql`${users.discordId} IS NOT NULL`,
        ilike(users.image, DISCORD_AVATAR)
      )!
    )
  }

  if (q) {
    filters.push(
      or(
        ilike(users.name, `%${q}%`),
        ilike(users.email, `%${q}%`),
        ilike(users.username, `%${q}%`),
        // Discord ID hem kolonda hem avatar URL'inde aranır
        ilike(users.discordId, `%${q}%`),
        ilike(users.image, `%${q}%`)
      )!
    )
  }

  const rows = await db
    .select({
      id:        users.id,
      name:      users.name,
      username:  users.username,
      email:     users.email,
      image:     users.image,
      discordId: users.discordId,
    })
    .from(users)
    .where(filters.length === 0 ? undefined : filters.length === 1 ? filters[0] : and(...filters))
    .orderBy(desc(users.createdAt))
    .limit(20)

  // discord_id boşsa avatar URL'inden çıkar (cdn.discordapp.com/avatars/<id>/...)
  const enriched = rows.map((u) => {
    let discordId = u.discordId
    if (!discordId && u.image) {
      const m = u.image.match(/cdn\.discordapp\.com\/avatars\/(\d+)\//)
      if (m) discordId = m[1]
    }
    return { ...u, discordId }
  })

  return NextResponse.json(enriched)
}
