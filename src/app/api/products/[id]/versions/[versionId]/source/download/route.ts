import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { requireAdmin } from "@/lib/admin"
import { hasPermission } from "@/lib/rbac"
import { db } from "@/lib/db"
import { productVersions, productDevelopers } from "@lbdevz/db"
import { and, eq } from "drizzle-orm"
import { createReadStream, existsSync } from "fs"
import { join, basename, resolve, sep } from "path"
import { Readable } from "stream"

const SOURCE_DIR = join(process.cwd(), "private", "source-codes")

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş yapmanız gerekiyor" }, { status: 401 })
  }

  const { id: productId, versionId } = await params

  // Yetki: süper admin VEYA (source_code.view izni VE bu ürünün geliştiricisi)
  let authorized = false
  try {
    const adminSession = await requireAdmin()
    if (adminSession) authorized = true
  } catch {}

  if (!authorized) {
    const canViewSource = await hasPermission(session.user.id, "source_code.view")
    if (canViewSource) {
      const [dev] = await db
        .select({ userId: productDevelopers.userId })
        .from(productDevelopers)
        .where(
          and(
            eq(productDevelopers.productId, productId),
            eq(productDevelopers.userId, session.user.id)
          )
        )
        .limit(1)
      authorized = Boolean(dev)
    }
  }

  if (!authorized) {
    return NextResponse.json(
      { error: "Bu kaynağa erişim yetkiniz yok" },
      { status: 403 }
    )
  }

  // IDOR koruması: versiyonun gerçekten bu ürüne ait olduğunu doğrula.
  const [version] = await db
    .select({ sourceCodeKey: productVersions.sourceCodeKey })
    .from(productVersions)
    .where(
      and(
        eq(productVersions.id, versionId),
        eq(productVersions.productId, productId)
      )
    )
    .limit(1)

  if (!version?.sourceCodeKey) {
    return NextResponse.json({ error: "Kaynak kodu bulunamadı" }, { status: 404 })
  }

  // Path traversal koruması: yalnızca dosya adı, SOURCE_DIR sınırları içinde.
  const safeName = basename(version.sourceCodeKey)
  const filePath = resolve(SOURCE_DIR, safeName)
  if (!filePath.startsWith(resolve(SOURCE_DIR) + sep)) {
    return NextResponse.json({ error: "Geçersiz dosya" }, { status: 400 })
  }
  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "Dosya sunucuda bulunamadı" }, { status: 404 })
  }

  const stream = createReadStream(filePath)
  const webStream = Readable.toWeb(stream) as ReadableStream

  const ext = safeName.endsWith(".tar.gz") ? ".tar.gz" : safeName.slice(safeName.lastIndexOf("."))
  const filename = `source-${versionId}${ext}`

  return new NextResponse(webStream, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "application/octet-stream",
      "Cache-Control": "no-store",
    },
  })
}
