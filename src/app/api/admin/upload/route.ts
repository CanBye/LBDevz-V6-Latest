import { NextRequest, NextResponse } from "next/server"
import { requireAdminAccess } from "@/lib/admin"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/svg+xml"]

const EXT: Record<string, string> = {
  "image/png": "png", "image/jpeg": "jpg", "image/jpg": "jpg",
  "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg",
}

export async function POST(req: NextRequest) {
  const access = await requireAdminAccess()
  if (!access) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })

  try {
    const form = await req.formData()
    const file = form.get("file") as File | null
    if (!file) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 })
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "Dosya 5MB'den büyük olamaz" }, { status: 400 })
    if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Desteklenmeyen dosya türü" }, { status: 400 })

    const ext = EXT[file.type] ?? "bin"
    const filename = `${randomUUID()}.${ext}`
    const uploadDir = join(process.cwd(), "public", "uploads")
    await mkdir(uploadDir, { recursive: true })
    const bytes = await file.arrayBuffer()
    await writeFile(join(uploadDir, filename), Buffer.from(bytes))

    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "Yükleme başarısız" }, { status: 500 })
  }
}