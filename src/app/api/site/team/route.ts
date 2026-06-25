import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { teamMembers } from "@lbdevz/db"
import { eq, asc } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET() {
  const rows = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.visible, true))
    .orderBy(asc(teamMembers.order), asc(teamMembers.createdAt))
  return NextResponse.json(rows)
}