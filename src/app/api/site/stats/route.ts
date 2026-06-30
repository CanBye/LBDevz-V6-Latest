import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { products, users } from "@lbdevz/db"
import { eq, count } from "drizzle-orm"

export async function GET() {
  try {
    const [{ value: productCount }] = await db
      .select({ value: count() })
      .from(products)
      .where(eq(products.status, "active"))

    const [{ value: customerCount }] = await db
      .select({ value: count() })
      .from(users)

    return NextResponse.json({
      products: Number(productCount) || 0,
      customers: Number(customerCount) || 0,
    })
  } catch {
    return NextResponse.json({ products: 0, customers: 0 })
  }
}