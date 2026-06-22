import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { ser } from "@/lib/db-util"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Giriş yapman gerekiyor" }, { status: 401 })

  const { categoryId, answers, agreementSignedAt, agreementVersion } = await req.json()
  if (!categoryId || !answers) return NextResponse.json({ error: "Eksik veri" }, { status: 400 })
  if (!agreementSignedAt) return NextResponse.json({ error: "Sözleşmeyi kabul etmeniz zorunludur" }, { status: 400 })

  const existing = ser(await db.execute(sql`
    SELECT id FROM auth_purchase_applications
    WHERE user_id = ${session.user.id!} AND category_id = ${categoryId} AND status = 'pending'
    LIMIT 1
  `))
  if (existing.length > 0) return NextResponse.json({ error: "Bu kategori için bekleyen başvurunuz var" }, { status: 409 })

  await db.execute(sql`
    INSERT INTO auth_purchase_applications (category_id, user_id, answers, agreement_signed_at, agreement_version)
    VALUES (
      ${categoryId},
      ${session.user.id!},
      ${JSON.stringify(answers)}::jsonb,
      ${agreementSignedAt}::timestamptz,
      ${agreementVersion ?? null}
    )
  `)
  return NextResponse.json({ ok: true })
}