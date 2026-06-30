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
    const isDiscord = hook.url.includes("discord.com/api/webhooks")
    const payload = isDiscord
      ? {
          username: "LBDevz",
          embeds: [{
            title: "🧪 Test Webhook",
            description: `**Event:** \`${hook.event}\`\nTest mesajı başarıyla alındı!`,
            color: 0x7c3aed,
            footer: { text: "LBDevz Admin" },
            timestamp: new Date().toISOString(),
          }],
        }
      : { event: hook.event, test: true, timestamp: new Date().toISOString(), source: "lbdevz-admin" }

    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (!isDiscord) {
      headers["X-LBDevz-Event"] = hook.event
      headers["X-LBDevz-Test"] = "true"
    }

    const res = await fetch(hook.url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    })
    return NextResponse.json({ ok: res.ok, status: res.status })
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 502 })
  }
}