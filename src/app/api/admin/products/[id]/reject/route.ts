import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { hasPermission } from "@/lib/rbac"
import { db } from "@/lib/db"
import { products } from "@lbdevz/db"
import { eq } from "drizzle-orm"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(ADMIN_PERMISSIONS.PRODUCTS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const canPublish = await hasPermission(session.user.id!, "products.publish")
  if (!canPublish) {
    return NextResponse.json({ error: "Ürün reddetme yetkiniz yok" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const reason: string | undefined = body.reason

  const [product] = await db
    .update(products)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning()

  if (!product) {
    return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 })
  }

  if (reason) {
    console.info(`[products] rejected id=${id} reason="${reason}"`)
  }

  return NextResponse.json({ ok: true, product })
}