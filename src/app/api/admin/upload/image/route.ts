import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { randomUUID } from "crypto"
import sharp from "sharp"

const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "products")
const ALLOWED    = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_BYTES  = 10 * 1024 * 1024 // 10 MB

// Map the *verified* image format (from sharp) to a safe extension.
// SVG is intentionally excluded (script-bearing / XSS vector).
const EXT_BY_FORMAT: Record<string, string> = {
  jpeg: "jpg",
  png:  "png",
  webp: "webp",
  gif:  "gif",
}

export async function POST(req: NextRequest) {
  const session = await requirePermission(ADMIN_PERMISSIONS.PRODUCTS)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const file     = formData.get("file") as File | null

  if (!file) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 })
  // İlk kontrol: client-controlled MIME (yalnızca hızlı eleme; gerçek doğrulama aşağıda).
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Sadece JPEG, PNG, WEBP, GIF desteklenir" }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Maksimum dosya boyutu 10 MB" }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  // Gerçek içerik doğrulaması: sharp ile formatı tespit et. Uzantı dosya
  // adından DEĞİL, doğrulanmış formattan türetilir. SVG/HTML vb. reddedilir.
  let detectedFormat: string | undefined
  try {
    detectedFormat = (await sharp(buffer).metadata()).format
  } catch {
    return NextResponse.json({ error: "Geçersiz görsel dosyası" }, { status: 400 })
  }

  const ext = detectedFormat ? EXT_BY_FORMAT[detectedFormat] : undefined
  if (!ext) {
    return NextResponse.json({ error: "Desteklenmeyen görsel formatı" }, { status: 400 })
  }

  if (!existsSync(UPLOAD_DIR)) await mkdir(UPLOAD_DIR, { recursive: true })

  const filename = `${randomUUID()}.${ext}`
  const dest     = join(UPLOAD_DIR, filename)

  await writeFile(dest, buffer)

  return NextResponse.json({ url: `/uploads/products/${filename}` })
}
