import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { teamMembers } from "@lbdevz/db"
import { and, eq, ne } from "drizzle-orm"
import { slugify } from "@/lib/slug"

type Ctx = { params: Promise<{ id: string }> }

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.map((x) => String(x).trim()).filter(Boolean)
}

/** Ensures a slug is unique excluding the current member; appends -n on clash. */
async function uniqueSlug(base: string, excludeId: string): Promise<string> {
  const root = slugify(base) || "uye"
  let candidate = root
  let n = 1
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const [existing] = await db
      .select({ id: teamMembers.id })
      .from(teamMembers)
      .where(and(eq(teamMembers.slug, candidate), ne(teamMembers.id, excludeId)))
      .limit(1)
    if (!existing) return candidate
    n += 1
    candidate = `${root}-${n}`
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await requirePermission(ADMIN_PERMISSIONS.TEAM)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { id } = await params
  const body = await req.json()

  // Build an explicit update set so we never write unknown/dangerous keys.
  const updates: Record<string, unknown> = { updatedAt: new Date() }

  if ("name" in body) updates.name = body.name
  if ("role" in body) updates.role = body.role
  if ("bio" in body) updates.bio = body.bio || null
  if ("longBio" in body) updates.longBio = body.longBio || null
  if ("image" in body) updates.image = body.image || null
  if ("github" in body) updates.github = body.github || null
  if ("discord" in body) updates.discord = body.discord || null
  if ("twitter" in body) updates.twitter = body.twitter || null
  if ("yearsExperience" in body)
    updates.yearsExperience =
      body.yearsExperience != null && body.yearsExperience !== "" ? Number(body.yearsExperience) : null
  if ("languages" in body) updates.languages = asStringArray(body.languages)
  if ("servers" in body) updates.servers = Array.isArray(body.servers) ? body.servers : []
  if ("projects" in body) updates.projects = Array.isArray(body.projects) ? body.projects : []
  if ("order" in body) updates.order = Number(body.order) || 0
  if ("visible" in body) updates.visible = Boolean(body.visible)

  // Slug: explicit value, or regenerate from a changed name. Keep it unique.
  if ("slug" in body && typeof body.slug === "string" && body.slug.trim()) {
    updates.slug = await uniqueSlug(body.slug, id)
  } else if ("name" in body && body.name) {
    // Only (re)generate from name if the member has no slug yet.
    const [current] = await db.select({ slug: teamMembers.slug }).from(teamMembers).where(eq(teamMembers.id, id)).limit(1)
    if (current && !current.slug) updates.slug = await uniqueSlug(body.name, id)
  }

  const [row] = await db.update(teamMembers).set(updates).where(eq(teamMembers.id, id)).returning()
  return NextResponse.json(row)
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await requirePermission(ADMIN_PERMISSIONS.TEAM)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { id } = await params
  await db.delete(teamMembers).where(eq(teamMembers.id, id))
  return NextResponse.json({ ok: true })
}
