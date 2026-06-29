import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { teamMembers, products, productDevelopers, users } from "@lbdevz/db"
import { eq, and } from "drizzle-orm"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // Find the team member by slug to get their name
  const [member] = await db
    .select({ id: teamMembers.id, name: teamMembers.name })
    .from(teamMembers)
    .where(eq(teamMembers.slug, slug))
    .limit(1)

  if (!member) return NextResponse.json([])

  // Find a user account that matches this team member's name
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.name, member.name))
    .limit(1)

  if (!user) return NextResponse.json([])

  // Get all active products where this user is a developer
  const rows = await db
    .select({
      id:          products.id,
      name:        products.name,
      imageUrl:    products.imageUrl,
      type:        products.type,
      priceCredits: products.priceCredits,
      status:      products.status,
    })
    .from(productDevelopers)
    .innerJoin(products, and(
      eq(productDevelopers.productId, products.id),
      eq(products.status, "active")
    ))
    .where(eq(productDevelopers.userId, user.id))

  return NextResponse.json(rows)
}