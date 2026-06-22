import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { ser } from "@/lib/db-util"

export async function GET() {
  const session = await requirePermission(ADMIN_PERMISSIONS.BLOG)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const rows = ser(await db.execute(sql`
    SELECT b.*, u.name as author_name
    FROM blog_posts b LEFT JOIN users u ON u.id = b.author_id
    ORDER BY b.created_at DESC
  `))
  return NextResponse.json(rows)
}

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim()
}

export async function POST(req: NextRequest) {
  const session = await requirePermission(ADMIN_PERMISSIONS.BLOG)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { title, excerpt, content, coverUrl, published } = await req.json()
  if (!title) return NextResponse.json({ error: "Başlık zorunlu" }, { status: 400 })
  const slug = toSlug(title) + "-" + Date.now().toString(36)
  const rows = ser(await db.execute(sql`
    INSERT INTO blog_posts (title, slug, excerpt, content, cover_url, published, author_id, published_at)
    VALUES (${title}, ${slug}, ${excerpt ?? null}, ${content ?? null}, ${coverUrl ?? null},
            ${published ?? false}, ${session.user!.id!},
            ${published ? new Date().toISOString() : null})
    RETURNING *
  `))
  const post = rows[0]
  if (published) void fireWebhook(post)
  return NextResponse.json(post, { status: 201 })
}

async function fireWebhook(post: any) {
  try {
    const hooks = ser(await db.execute(sql`SELECT url, template FROM webhook_configs WHERE event = 'blog.published' AND enabled = true`))
    for (const h of hooks) {
      const payload = h.template ? JSON.parse(h.template.replace(/\{\{title\}\}/g, post.title).replace(/\{\{slug\}\}/g, post.slug))
        : { event: "blog.published", title: post.title, slug: post.slug, url: `https://lbdevz.com/blog/${post.slug}` }
      fetch(h.url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: AbortSignal.timeout(8000) }).catch(() => {})
    }
  } catch {}
}