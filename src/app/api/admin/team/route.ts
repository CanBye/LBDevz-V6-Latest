import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { teamMembers } from "@lbdevz/db"
import { asc, eq } from "drizzle-orm"
import { slugify } from "@/lib/slug"

/** Generates a slug unique within team_members (appends -2, -3, ... on clash). */
async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || "uye"
  let candidate = root
  let n = 1
  // Loop until we find a free slug. Bounded by the number of existing clashes.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const [existing] = await db
      .select({ id: teamMembers.id })
      .from(teamMembers)
      .where(eq(teamMembers.slug, candidate))
      .limit(1)
    if (!existing) return candidate
    n += 1
    candidate = `${root}-${n}`
  }
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.map((x) => String(x).trim()).filter(Boolean)
}

export async function GET() {
  const session = await requirePermission(ADMIN_PERMISSIONS.TEAM)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const rows = await db.select().from(teamMembers).orderBy(asc(teamMembers.order), asc(teamMembers.createdAt))
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await requirePermission(ADMIN_PERMISSIONS.TEAM)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const body = await req.json()
  const {
    name, role, bio, longBio, image, github, discord, twitter,
    yearsExperience, languages, servers, projects, order, visible, slug,
  } = body

  if (!name || !role) return NextResponse.json({ error: "Ad ve rol zorunlu" }, { status: 400 })

  const finalSlug = await uniqueSlug(typeof slug === "string" && slug.trim() ? slug : name)

  const [row] = await db.insert(teamMembers).values({
    slug: finalSlug,
    name,
    role,
    bio: bio ?? null,
    longBio: longBio ?? null,
    image: image ?? null,
    github: github ?? null,
    discord: discord ?? null,
    twitter: twitter ?? null,
    yearsExperience: yearsExperience != null && yearsExperience !== "" ? Number(yearsExperience) : null,
    languages: asStringArray(languages),
    servers: Array.isArray(servers) ? servers : [],
    projects: Array.isArray(projects) ? projects : [],
    order: order ?? 0,
    visible: visible ?? true,
  }).returning()

  return NextResponse.json(row, { status: 201 })
}
