import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { teamMembers } from "@lbdevz/db"
import { and, eq } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [member] = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.slug, slug), eq(teamMembers.visible, true)))
    .limit(1)

  if (!member) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 })
  return NextResponse.json(member)
}
