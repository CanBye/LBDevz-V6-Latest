import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { productReviews, licenses } from "@lbdevz/db"
import { eq, and } from "drizzle-orm"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 })
  }

  const { productId, rating, comment } = await req.json()
  if (!productId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 })
  }

  // Check active license — user must own this product
  const [license] = await db
    .select({ id: licenses.id })
    .from(licenses)
    .where(
      and(
        eq(licenses.userId,    session.user.id),
        eq(licenses.productId, productId),
        eq(licenses.status,    "active")
      )
    )
    .limit(1)

  if (!license) {
    return NextResponse.json(
      { error: "Bu ürüne yorum yapabilmek için aktif lisansınız olmalıdır" },
      { status: 403 }
    )
  }

  // Prevent duplicate review from same user for same product
  const [existing] = await db
    .select({ id: productReviews.id })
    .from(productReviews)
    .where(
      and(
        eq(productReviews.userId,    session.user.id),
        eq(productReviews.productId, productId)
      )
    )
    .limit(1)

  if (existing) {
    // Update existing review
    const [updated] = await db
      .update(productReviews)
      .set({ rating, comment: comment?.trim() || null, updatedAt: new Date() })
      .where(eq(productReviews.id, existing.id))
      .returning()
    return NextResponse.json(updated)
  }

  // Create new review
  const [row] = await db
    .insert(productReviews)
    .values({
      productId,
      userId:  session.user.id,
      rating,
      comment: comment?.trim() || null,
    })
    .returning()

  return NextResponse.json(row, { status: 201 })
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json(null)

  const productId = req.nextUrl.searchParams.get("productId")
  if (!productId) return NextResponse.json(null)

  const [existing] = await db
    .select()
    .from(productReviews)
    .where(
      and(
        eq(productReviews.userId,    session.user.id),
        eq(productReviews.productId, productId)
      )
    )
    .limit(1)

  return NextResponse.json(existing ?? null)
}