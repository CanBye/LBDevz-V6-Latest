import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { products } from "@lbdevz/db"
import { eq, and, asc } from "drizzle-orm"

export const revalidate = 300

export async function GET() {
  const rows = await db
    .select({
      id:          products.id,
      slug:        products.slug,
      name:        products.name,
      description: products.description,
      priceCredits: products.priceCredits,
      imageUrl:    products.imageUrl,
      category:    products.category,
      type:        products.type,
      licenseModel: products.licenseModel,
    })
    .from(products)
    .where(and(eq(products.featured, true), eq(products.status, "active")))
    .orderBy(asc(products.createdAt))
    .limit(8)

  return NextResponse.json(rows)
}