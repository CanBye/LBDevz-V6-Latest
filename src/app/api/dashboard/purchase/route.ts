import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { products, licenses, creditTransactions, coupons } from "@lbdevz/db"
import { eq, sql, and } from "drizzle-orm"
import { getUserBalance } from "@/lib/credits"
import { nanoid } from "nanoid"
import { sendEmail, purchaseEmailHtml } from "@/lib/email"
import { notify } from "@/lib/discord"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })

  const { productId, couponCode } = await req.json()
  if (!productId) return NextResponse.json({ error: "Ürün ID gerekli" }, { status: 400 })

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1)

  if (!product || product.status !== "active") {
    return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 })
  }

  // Block re-purchase if user already has an active license
  const [existingLicense] = await db
    .select({ id: licenses.id })
    .from(licenses)
    .where(and(eq(licenses.productId, productId), eq(licenses.userId, session.user.id!), eq(licenses.status, "active")))
    .limit(1)

  if (existingLicense) {
    return NextResponse.json({ error: "Bu ürüne zaten sahipsin." }, { status: 409 })
  }

  const balance = await getUserBalance(session.user.id!)
  let finalPrice = product.priceCredits
  let appliedCouponId: string | null = null

  if (couponCode) {
    const [coupon] = await db.select().from(coupons)
      .where(eq(coupons.code, couponCode.toUpperCase().trim()))
      .limit(1)

    if (coupon) {
      const isActive = (coupon as Record<string, unknown>).isActive ?? (coupon as Record<string, unknown>).active ?? true
      const usesCount = ((coupon as Record<string, unknown>).usesCount ?? (coupon as Record<string, unknown>).usedCount ?? 0) as number
      const maxUses = coupon.maxUses
      const expired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date()
      const limitReached = maxUses !== null && maxUses !== undefined && usesCount >= maxUses

      if (isActive && !expired && !limitReached) {
        const couponType = coupon.type as string
        let discount = 0
        if (couponType === 'percentage' || couponType === 'percent') {
          discount = Math.floor(finalPrice * coupon.value / 100)
        } else if (couponType === 'fixed') {
          discount = Math.min(coupon.value, finalPrice)
        } else if (couponType === 'free') {
          discount = finalPrice
        }
        finalPrice = Math.max(0, finalPrice - discount)
        appliedCouponId = coupon.id
      }
    }
  }

  if (balance < finalPrice) {
    return NextResponse.json({ error: "Yetersiz bakiye" }, { status: 400 })
  }

  const licenseKey = `LBD-${nanoid(8).toUpperCase()}-${nanoid(8).toUpperCase()}`
  const newBalance = balance - finalPrice

  await db.transaction(async (tx) => {
    await tx.insert(creditTransactions).values({
      userId: session.user.id!,
      amount: -finalPrice,
      type: "purchase",
      balanceAfter: newBalance,
      note: `${product.name} satın alındı`,
    })
    await tx.insert(licenses).values({
      userId: session.user.id!,
      productId: product.id,
      licenseKey,
      licenseModel: product.licenseModel,
      periodDays: product.periodDays,
      seatLimit: product.seatLimit,
      autoRenew: product.autoRenewDefault,
      renewalPriceCredits: product.licenseModel === "subscription" ? product.priceCredits : null,
      status: "active",
    })
  })

  if (appliedCouponId) {
    await db.update(coupons)
      .set({ usesCount: sql`uses_count + 1` } as never)
      .where(eq(coupons.id, appliedCouponId))
  }

  sendEmail({
    to: session.user.email!,
    subject: `Satın Alma Onayı — ${product.name}`,
    html: purchaseEmailHtml({
      name: session.user.name ?? session.user.email!,
      productName: product.name,
      licenseKey,
      amount: finalPrice,
    }),
  }).catch(console.error)

  notify.purchase(
    session.user.name ?? session.user.email ?? "Kullanıcı",
    product.name,
    finalPrice,
    licenseKey,
    session.user.image
  ).catch(console.error)

  return NextResponse.json({ success: true, licenseKey })
}