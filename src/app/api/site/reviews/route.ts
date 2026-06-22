import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { reviews } from "@lbdevz/db"
import { eq, asc } from "drizzle-orm"

export const revalidate = 60

export async function GET() {
  const rows = await db
    .select()
    .from(reviews)
    .where(eq(reviews.visible, true))
    .orderBy(asc(reviews.order), asc(reviews.createdAt))
  return NextResponse.json(rows)
}