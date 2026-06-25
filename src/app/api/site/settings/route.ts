import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { ser } from "@/lib/db-util"

export const dynamic = "force-dynamic"

export async function GET() {
  const rows = ser(await db.execute(sql`SELECT key, value FROM site_settings`))
  return NextResponse.json(Object.fromEntries(rows.map((r: any) => [r.key, r.value])))
}