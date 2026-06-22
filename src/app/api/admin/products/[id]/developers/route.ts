import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { productDevelopers, products } from "@lbdevz/db"
import { eq } from "drizzle-orm"

// PUT  /api/admin/products/[id]/developers
// Body: { developerIds: string[] }
// Replaces the full developer list for a product.
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(ADMIN_PERMISSIONS.PRODUCTS)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: productId } = await params
  const { developerIds } = await req.json() as { developerIds: string[] }

  if (!Array.isArray(developerIds)) {
    return NextResponse.json({ error: "developerIds must be an array" }, { status: 400 })
  }

  // Delete existing, then insert new set in a transaction
  await db.transaction(async (tx) => {
    await tx.delete(productDevelopers).where(eq(productDevelopers.productId, productId))
    if (developerIds.length > 0) {
      await tx.insert(productDevelopers).values(
        developerIds.map((userId) => ({ productId, userId }))
      )
    }
  })

  return NextResponse.json({ success: true })
}

// GET /api/admin/products/[id]/developers
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(ADMIN_PERMISSIONS.PRODUCTS)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: productId } = await params

  const rows = await db
    .select({ userId: productDevelopers.userId })
    .from(productDevelopers)
    .where(eq(productDevelopers.productId, productId))

  return NextResponse.json(rows.map((r) => r.userId))
}