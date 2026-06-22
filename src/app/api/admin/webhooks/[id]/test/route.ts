import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { webhookConfigs } from "@lbdevz/db"
import { eq } from "drizzle-orm"
import { assertSafeWebhookUrl } from "@/lib/ssrf"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requirePermission(ADMIN_PERMISSIONS.WEBHOOKS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { id } = await params

  const [hook] = await db.select().from(webhookConfigs).where(eq(webhookConfigs.id, id)).limit(1)
  if (!hook) return NextResponse.json({ error: "Webhook bulunamadı" }, { status: 404 })

  // SSRF koruması: yalnızca https + public adresler (DB'deki eski kayıtlar için de doğrula).
  try {
    await assertSafeWebhookUrl(hook.url)
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Geçersiz URL" }, { status: 400 })
  }

  try {
    const payload = { event: hook.event, test: true, timestamp: new Date().toISOString(), source: "lbdevz-admin" }
    const res = await fetch(hook.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-LBDevz-Event": hook.event, "X-LBDevz-Test": "true" },
      body: JSON.stringify(payload),
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    })
    return NextResponse.json({ ok: res.ok, status: res.status })
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 502 })
  }
}