import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { ser } from "@/lib/db-util"

export async function GET() {
  const session = await requirePermission(ADMIN_PERMISSIONS.YETKILIALIM)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const rows = ser(await db.execute(sql`
    SELECT a.*, c.name as category_name,
           u.name as user_name, u.email as user_email, u.image as user_image
    FROM auth_purchase_applications a
    JOIN auth_purchase_categories c ON c.id = a.category_id
    LEFT JOIN users u ON u.id = a.user_id
    ORDER BY a.created_at DESC
  `))
  return NextResponse.json(rows)
}

export async function PATCH(req: NextRequest) {
  const session = await requirePermission(ADMIN_PERMISSIONS.YETKILIALIM)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { id, status, adminNote } = await req.json()
  if (!id || !status) return NextResponse.json({ error: "Eksik veri" }, { status: 400 })

  // Update application
  await db.execute(sql`
    UPDATE auth_purchase_applications SET
      status = ${status}, admin_note = ${adminNote ?? null},
      reviewed_at = NOW(), reviewed_by = ${session.user!.id!}
    WHERE id = ${id}
  `)

  // Send notification to applicant
  try {
    const apps = ser(await db.execute(sql`
      SELECT a.user_id, c.name as category_name
      FROM auth_purchase_applications a
      JOIN auth_purchase_categories c ON c.id = a.category_id
      WHERE a.id = ${id} AND a.user_id IS NOT NULL
      LIMIT 1
    `))
    const app = apps[0]
    if (app?.user_id) {
      const isApproved = status === "approved"
      const title = isApproved
        ? `Başvurunuz Onaylandı 🎉`
        : `Başvurunuz Reddedildi`
      const body = isApproved
        ? `"${app.category_name}" kategorisindeki başvurunuz onaylandı. Ekibimize hoş geldiniz!`
        : `"${app.category_name}" kategorisindeki başvurunuz bu sefer kabul edilemedi.${adminNote ? ` Not: ${adminNote}` : ""}`

      await db.execute(sql`
        INSERT INTO notifications (user_id, title, body, type, link)
        VALUES (${app.user_id}, ${title}, ${body}, ${"application"}, ${"/dashboard/basvurularim"})
      `)
    }
  } catch {}

  return NextResponse.json({ ok: true })
}