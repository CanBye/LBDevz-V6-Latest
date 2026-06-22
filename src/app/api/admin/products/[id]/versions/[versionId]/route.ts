import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { productVersions, products, licenses, notifications, webhookConfigs } from "@lbdevz/db"
import { eq, and } from "drizzle-orm"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  const session = await requirePermission(ADMIN_PERMISSIONS.PRODUCTS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const { id: productId, versionId } = await params
  const body = await req.json()

  const [existing] = await db
    .select()
    .from(productVersions)
    .where(and(eq(productVersions.id, versionId), eq(productVersions.productId, productId)))
    .limit(1)

  if (!existing) return NextResponse.json({ error: "Versiyon bulunamadı" }, { status: 404 })

  const updateData: Partial<typeof productVersions.$inferInsert> = {}

  if (typeof body.published === "boolean") updateData.published = body.published
  if (typeof body.changelog === "string") updateData.changelog = body.changelog
  if (typeof body.blobKey === "string") updateData.blobKey = body.blobKey
  if (typeof body.fileKey === "string") updateData.fileKey = body.fileKey

  const [updated] = await db
    .update(productVersions)
    .set(updateData)
    .where(eq(productVersions.id, versionId))
    .returning()

  // ── Fire-and-forget: send notifications when a version is first published ──
  const justPublished = body.published === true && !existing.published
  if (justPublished) {
    // Don't await — let it run in background so response isn't delayed
    sendUpdateNotifications(productId, updated.version ?? "?", existing.changelog).catch(
      (e) => console.error("[notify] version publish notification failed:", e)
    )
  }

  return NextResponse.json({ version: updated })
}

// ─── Notification helpers ─────────────────────────────────────────────────────

async function sendUpdateNotifications(
  productId: string,
  version: string,
  changelog: string | null
) {
  // Fetch product name
  const [product] = await db
    .select({ name: products.name, slug: products.slug })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1)

  if (!product) return

  const title = `${product.name} güncellendi → v${version}`
  const body  = changelog ? changelog.slice(0, 200) : `Yeni versiyon: v${version}`
  const link  = `/dashboard/magaza/${productId}`

  // Find all active license holders
  const licenseHolders = await db
    .select({ userId: licenses.userId })
    .from(licenses)
    .where(and(eq(licenses.productId, productId), eq(licenses.status, "active")))

  // Bulk insert in-app notifications
  if (licenseHolders.length > 0) {
    await db.insert(notifications).values(
      licenseHolders.map(({ userId }) => ({
        userId,
        type:  "product_update",
        title,
        body,
        link,
        read:  false,
      }))
    )
  }

  // Discord webhook — look for any enabled "product_update" webhook config
  const hooks = await db
    .select()
    .from(webhookConfigs)
    .where(and(eq(webhookConfigs.event, "product_update"), eq(webhookConfigs.enabled, true)))

  for (const hook of hooks) {
    try {
      const message = hook.template
        .replace("{{product}}", product.name)
        .replace("{{version}}", version)
        .replace("{{changelog}}", changelog ?? "")

      await fetch(hook.url, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ content: message }),
      })
    } catch (e) {
      console.error(`[webhook] failed to send to ${hook.url}:`, e)
    }
  }
}