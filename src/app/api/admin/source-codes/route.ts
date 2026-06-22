import { NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { productVersions, products } from "@lbdevz/db"
import { eq } from "drizzle-orm"

export async function GET() {
  const session = await requirePermission(ADMIN_PERMISSIONS.SOURCE_CODES)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const rows = await db
    .select({
      versionId:             productVersions.id,
      productName:           products.name,
      version:               productVersions.version,
      sourceCodeKey:         productVersions.sourceCodeKey,
      sourceCodeUploadedAt:  productVersions.sourceCodeUploadedAt,
      obfStatus:             productVersions.obfStatus,
    })
    .from(productVersions)
    .innerJoin(products, eq(productVersions.productId, products.id))
    .orderBy(productVersions.createdAt)

  return NextResponse.json({ rows })
}