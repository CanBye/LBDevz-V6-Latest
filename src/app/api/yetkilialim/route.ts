import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { ser } from "@/lib/db-util"

export async function GET() {
  const settings = ser(await db.execute(sql`SELECT value FROM site_settings WHERE key = 'authorized_purchase_enabled'`))
  const enabled = settings[0]?.value === "true"
  if (!enabled) return NextResponse.json({ enabled: false, categories: [] })

  const cats = ser(await db.execute(sql`SELECT * FROM auth_purchase_categories WHERE visible = true ORDER BY "order", created_at`))
  const categories = await Promise.all(cats.map(async (cat: any) => {
    const fields = ser(await db.execute(sql`SELECT * FROM auth_purchase_fields WHERE category_id = ${cat.id} ORDER BY "order"`))
    return { ...cat, fields }
  }))
  return NextResponse.json({ enabled: true, categories })
}