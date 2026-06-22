import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { randomUUID } from "crypto"

const DOWNLOADS_DIR = join(process.cwd(), "public", "downloads")

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(ADMIN_PERMISSIONS.PRODUCTS)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: productId } = await params

  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 })
  }

  if (!file.name.endsWith(".jar")) {
    return NextResponse.json({ error: "Sadece .jar dosyaları kabul edilir" }, { status: 400 })
  }

  // Ensure downloads directory exists
  if (!existsSync(DOWNLOADS_DIR)) {
    await mkdir(DOWNLOADS_DIR, { recursive: true })
  }

  // Generate unique filename: productId-uuid.jar
  const blobKey = `${productId}-${randomUUID()}.jar`
  const dest    = join(DOWNLOADS_DIR, blobKey)

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(dest, buffer)

  return NextResponse.json({
    blobKey,
    fileKey: blobKey,
    originalName: file.name,
    size: buffer.length,
  })
}