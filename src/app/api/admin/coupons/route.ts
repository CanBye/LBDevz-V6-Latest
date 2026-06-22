import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { coupons } from "@lbdevz/db"
import { desc } from "drizzle-orm"

export async function GET() {
  const session = await requirePermission(ADMIN_PERMISSIONS.COUPONS)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const all = await db.select().from(coupons).orderBy(desc(coupons.createdAt))
  return NextResponse.json(all)
}

export async function POST(req: NextRequest) {
  const session = await requirePermission(ADMIN_PERMISSIONS.COUPONS)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const { code, type, value, maxUses, minAmount, productId, expiresAt } = body
  if (!code || !type || value === undefined) {
    return NextResponse.json({ error: "code, type, value gerekli" }, { status: 400 })
  }
  const [coupon] = await db.insert(coupons).values({
    code: code.toUpperCase().trim(),
    type,
    value: Number(value),
    maxUses: maxUses ? Number(maxUses) : null,
    productId: productId || null,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  } as never).returning()
  return NextResponse.json(coupon)
}
