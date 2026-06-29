import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { referenceServers } from "@lbdevz/db"
import { eq, asc, and } from "drizzle-orm"

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") // "hero" | "section"

  const where =
    type === "hero"
      ? and(eq(referenceServers.visible, true), eq(referenceServers.showInHero, true))
      : type === "section"
      ? and(eq(referenceServers.visible, true), eq(referenceServers.showInSection, true))
      : eq(referenceServers.visible, true)

  const rows = await db
    .select()
    .from(referenceServers)
    .where(where)
    .orderBy(asc(referenceServers.order), asc(referenceServers.createdAt))

  return NextResponse.json(rows)
}