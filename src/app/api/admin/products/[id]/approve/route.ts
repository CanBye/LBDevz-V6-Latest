import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS, isSuperAdmin } from "@/lib/admin"
import { hasPermission } from "@/lib/rbac"
import { db } from "@/lib/db"
import { products, users, notifications, webhookConfigs } from "@lbdevz/db"
import { eq, and } from "drizzle-orm"

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(ADMIN_PERMISSIONS.PRODUCTS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const canPublish = isSuperAdmin(session.user.email) || await hasPermission(session.user.id!, "products.publish")
  if (!canPublish) {
    return NextResponse.json({ error: "Ürün yayınlama yetkiniz yok" }, { status: 403 })
  }

  const { id } = await params

  const [product] = await db
    .update(products)
    .set({ status: "active", approvedBy: session.user.id!, approvedAt: new Date(), updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning()

  if (!product) {
    return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 })
  }

  broadcastNewProduct(product.name, product.id, product.priceCredits).catch(
    (e) => console.error("[notify] approve broadcast failed:", e)
  )

  return NextResponse.json({ ok: true, product })
}

async function broadcastNewProduct(name: string, productId: string, price: number) {
  const priceText = price === 0 ? "Ücretsiz" : `₺${price.toLocaleString("tr-TR")}`

  const allUsers = await db.select({ id: users.id }).from(users)
  if (allUsers.length > 0) {
    await db.insert(notifications).values(
      allUsers.map(({ id: userId }) => ({
        userId,
        type: "new_product",
        title: `Yeni ürün yayınlandı: ${name}`,
        body: `${name} artık mağazada! ${priceText}`,
        link: `/dashboard/magaza/${productId}`,
        read: false,
      }))
    )
  }

  const hooks = await db
    .select()
    .from(webhookConfigs)
    .where(and(eq(webhookConfigs.event, "new_product"), eq(webhookConfigs.enabled, true)))

  for (const hook of hooks) {
    try {
      const message = hook.template
        .replace("{{product}}", name)
        .replace("{{price}}", priceText)
      await fetch(hook.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
      })
    } catch (e) {
      console.error(`[webhook] new_product send failed to ${hook.url}:`, e)
    }
  }
}