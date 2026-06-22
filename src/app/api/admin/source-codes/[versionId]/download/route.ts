import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { productVersions } from "@lbdevz/db"
import { eq } from "drizzle-orm"
import { readFile } from "fs/promises"
import { join, basename, resolve, sep } from "path"
import { existsSync } from "fs"

const SOURCE_DIR = join(process.cwd(), "private", "source-codes")

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  const session = await requirePermission(ADMIN_PERMISSIONS.SOURCE_CODES)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const { versionId } = await params
  const [ver] = await db.select({ sourceCodeKey: productVersions.sourceCodeKey })
    .from(productVersions).where(eq(productVersions.id, versionId)).limit(1)

  if (!ver?.sourceCodeKey) return NextResponse.json({ error: "Kaynak kodu bulunamadı" }, { status: 404 })

  // Path traversal koruması: yalnızca dosya adı, SOURCE_DIR sınırları içinde.
  const safeName = basename(ver.sourceCodeKey)
  const filePath = resolve(SOURCE_DIR, safeName)
  if (!filePath.startsWith(resolve(SOURCE_DIR) + sep)) {
    return NextResponse.json({ error: "Geçersiz dosya" }, { status: 400 })
  }
  if (!existsSync(filePath)) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 })

  const file = await readFile(filePath)
  return new NextResponse(file, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${safeName}"`,
    },
  })
}