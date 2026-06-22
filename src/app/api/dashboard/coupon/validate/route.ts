import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { coupons } from "@lbdevz/db"
import { eq } from "drizzle-orm"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Kupon kodu enumeration koruması.
  const rl = checkRateLimit(`coupon:${session.user.id}:${getClientIp(req)}`, { limit: 15, windowMs: 60 * 1000 })
  if (!rl.success) {
    return NextResponse.json({ valid: false, error: "Çok fazla deneme" }, { status: 429 })
  }

  const { code, productId, amount } = await req.json()
  if (!code) return NextResponse.json({ valid: false, error: "Kupon kodu gerekli" }, { status: 400 })

  const [coupon] = await db.select().from(coupons)
    .where(eq(coupons.code, code.toUpperCase().trim()))
    .limit(1)

  if (!coupon) return NextResponse.json({ valid: false, error: "Geçersiz kupon kodu" }, { status: 404 })

  const isActive = (coupon as Record<string, unknown>).isActive ?? (coupon as Record<string, unknown>).active ?? true
  if (!isActive) return NextResponse.json({ valid: false, error: "Bu kupon aktif değil" }, { status: 400 })

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return NextResponse.json({ valid: false, error: "Kuponun süresi dolmuş" }, { status: 400 })
  }

  const usesCount = (coupon as Record<string, unknown>).usesCount ?? (coupon as Record<string, unknown>).usedCount ?? 0
  const maxUses = coupon.maxUses

  if (maxUses !== null && maxUses !== undefined && (usesCount as number) >= maxUses) {
    return NextResponse.json({ valid: false, error: "Kupon kullanım limiti dolmuş" }, { status: 400 })
  }

  const minAmount = (coupon as Record<string, unknown>).minAmount as number | undefined
  if (minAmount && amount < minAmount) {
    return NextResponse.json({ valid: false, error: `Minimum tutar: ₺${minAmount}` }, { status: 400 })
  }

  if (coupon.productId && productId && coupon.productId !== productId) {
    return NextResponse.json({ valid: false, error: "Bu kupon bu ürün için geçerli değil" }, { status: 400 })
  }

  const couponType = coupon.type as string
  let discount = 0
  if (couponType === 'percentage' || couponType === 'percent') {
    discount = Math.floor((amount ?? 0) * coupon.value / 100)
  } else if (couponType === 'fixed') {
    discount = Math.min(coupon.value, amount ?? 0)
  } else if (couponType === 'free') {
    discount = amount ?? 0
  }

  return NextResponse.json({
    valid: true,
    couponId: coupon.id,
    type: coupon.type,
    value: coupon.value,
    discount,
    finalAmount: Math.max(0, (amount ?? 0) - discount),
    message: `${couponType === 'percentage' || couponType === 'percent' ? `%${coupon.value}` : couponType === 'fixed' ? `₺${coupon.value}` : 'Ücretsiz'} indirim uygulandı`,
  })
}