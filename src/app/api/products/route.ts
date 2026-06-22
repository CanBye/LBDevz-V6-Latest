import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { products, productDevelopers, users, productVersions } from "@lbdevz/db"
import { eq, desc, and } from "drizzle-orm"

export async function GET() {
  const items = await db
    .select()
    .from(products)
    .where(eq(products.status, "active"))
    .orderBy(desc(products.createdAt))

  // Fetch latest published version and developer list for each product
  const enriched = await Promise.all(
    items.map(async (p) => {
      const devRows = await db
        .select({
          id:       users.id,
          name:     users.name,
          username: users.username,
          image:    users.image,
        })
        .from(productDevelopers)
        .innerJoin(users, eq(users.id, productDevelopers.userId))
        .where(eq(productDevelopers.productId, p.id))

      const [latestVersion] = await db
        .select({ version: productVersions.version })
        .from(productVersions)
        .where(
          and(
            eq(productVersions.productId, p.id),
            eq(productVersions.published, true)
          )
        )
        .orderBy(desc(productVersions.createdAt))
        .limit(1)

      return {
        ...p,
        developers: devRows,
        latestVersion: latestVersion?.version ?? null,
      }
    })
  )

  return NextResponse.json(enriched)
}