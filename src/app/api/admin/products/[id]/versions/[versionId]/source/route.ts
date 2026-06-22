import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { hasPermission } from "@/lib/rbac"
import { db } from "@/lib/db"
import { productVersions } from "@lbdevz/db"
import { eq } from "drizzle-orm"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { randomUUID } from "crypto"

const SOURCE_DIR = join(process.cwd(), "private", "source-codes")

const ALLOWED_EXTS = [".zip", ".tar.gz", ".tar", ".tgz"]

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  const session = await requirePermission(ADMIN_PERMISSIONS.PRODUCTS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const canUpload = await hasPermission(session.user.id!, "source_code.upload")
  if (!canUpload) {
    return NextResponse.json({ error: "Kaynak kodu yükleme yetkiniz yok" }, { status: 403 })
  }

  const { versionId } = await params

  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 })
  }

  const lower = file.name.toLowerCase()
  const allowed = ALLOWED_EXTS.some(ext => lower.endsWith(ext))
  if (!allowed) {
    return NextResponse.json(
      { error: "Sadece .zip, .tar.gz, .tar, .tgz dosyaları kabul edilir" },
      { status: 400 }
    )
  }

  if (!existsSync(SOURCE_DIR)) {
    await mkdir(SOURCE_DIR, { recursive: true })
  }

  const ext = lower.endsWith(".tar.gz") ? ".tar.gz" : lower.slice(lower.lastIndexOf("."))
  const sourceKey = `${versionId}-${randomUUID()}${ext}`
  const dest = join(SOURCE_DIR, sourceKey)

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(dest, buffer)

  await db
    .update(productVersions)
    .set({ sourceCodeKey: sourceKey, sourceCodeUploadedAt: new Date() })
    .where(eq(productVersions.id, versionId))

  return NextResponse.json({ sourceKey, originalName: file.name, size: buffer.length })
}