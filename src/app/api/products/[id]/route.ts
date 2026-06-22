import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { products, productDevelopers, users, productVersions } from "@lbdevz/db"
import { eq, desc, and } from "drizzle-orm"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.status, "active")))
    .limit(1)

  if (!product) {
    return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 })
  }

  const developers = await db
    .select({
      id:       users.id,
      name:     users.name,
      username: users.username,
      image:    users.image,
    })
    .from(productDevelopers)
    .innerJoin(users, eq(users.id, productDevelopers.userId))
    .where(eq(productDevelopers.productId, id))

  // Only return published versions with changelog (no sensitive keys)
  const versions = await db
    .select({
      id:        productVersions.id,
      version:   productVersions.version,
      changelog: productVersions.changelog,
      createdAt: productVersions.createdAt,
    })
    .from(productVersions)
    .where(
      and(
        eq(productVersions.productId, id),
        eq(productVersions.published, true)
      )
    )
    .orderBy(desc(productVersions.createdAt))

  return NextResponse.json({ ...product, developers, versions })
}