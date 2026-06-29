import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { productReviews, users } from "@lbdevz/db"
import { eq, and, desc } from "drizzle-orm"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params

  const rows = await db
    .select({
      id:        productReviews.id,
      rating:    productReviews.rating,
      comment:   productReviews.comment,
      createdAt: productReviews.createdAt,
      userName:  users.name,
      userImage: users.image,
    })
    .from(productReviews)
    .leftJoin(users, eq(productReviews.userId, users.id))
    .where(
      and(
        eq(productReviews.productId, productId),
        eq(productReviews.visible, true)
      )
    )
    .orderBy(desc(productReviews.createdAt))

  return NextResponse.json(rows)
}