import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { licenses, products } from "@lbdevz/db"
import { eq } from "drizzle-orm"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })

  try {
    const userLicenses = await db
      .select({ license: licenses, product: products })
      .from(licenses)
      .leftJoin(products, eq(licenses.productId, products.id))
      .where(eq(licenses.userId, session.user.id))

    return NextResponse.json({ licenses: userLicenses })
  } catch (err) {
    console.error("Licenses API Error:", err)
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
  }
}
