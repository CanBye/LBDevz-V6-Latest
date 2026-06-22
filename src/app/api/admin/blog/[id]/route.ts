import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { ser } from "@/lib/db-util"

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await requirePermission(ADMIN_PERMISSIONS.BLOG)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { id } = await params
  const { title, excerpt, content, coverUrl, published } = await req.json()
  const rows = ser(await db.execute(sql`
    UPDATE blog_posts SET
      title       = COALESCE(${title ?? null}, title),
      excerpt     = COALESCE(${excerpt ?? null}, excerpt),
      content     = COALESCE(${content ?? null}, content),
      cover_url   = COALESCE(${coverUrl ?? null}, cover_url),
      published   = COALESCE(${published ?? null}, published),
      published_at = CASE WHEN ${published} = true AND published = false THEN NOW() ELSE published_at END,
      updated_at  = NOW()
    WHERE id = ${id} RETURNING *
  `))
  const post = rows[0]
  if (published && post && !post.webhook_sent) {
    void fireWebhook(post)
    await db.execute(sql`UPDATE blog_posts SET webhook_sent = true WHERE id = ${id}`)
  }
  return NextResponse.json(post ?? {})
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await requirePermission(ADMIN_PERMISSIONS.BLOG)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { id } = await params
  await db.execute(sql`DELETE FROM blog_posts WHERE id = ${id}`)
  return NextResponse.json({ ok: true })
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