import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { webhookConfigs } from "@lbdevz/db"
import { desc } from "drizzle-orm"
import { assertSafeWebhookUrl } from "@/lib/ssrf"

export async function GET() {
  const session = await requirePermission(ADMIN_PERMISSIONS.WEBHOOKS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const rows = await db.select().from(webhookConfigs).orderBy(desc(webhookConfigs.createdAt))
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await requirePermission(ADMIN_PERMISSIONS.WEBHOOKS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { event, url, template } = await req.json()
  if (!event || !url) return NextResponse.json({ error: "Event ve URL zorunlu" }, { status: 400 })

  // SSRF koruması: yalnızca https + public adresler.
  try {
    await assertSafeWebhookUrl(url)
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Geçersiz URL" }, { status: 400 })
  }

  const [row] = await db.insert(webhookConfigs).values({
    event,
    url,
    template: template ?? "",
    enabled: true,
    createdBy: session.user!.id!,
  }).returning()
  return NextResponse.json(row, { status: 201 })
}