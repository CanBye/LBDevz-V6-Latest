import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { licenses, products, productVersions } from "@lbdevz/db"
import { eq, and, desc } from "drizzle-orm"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

// Placeholder baked into the loader at obfuscation time.
// MUST match exactly what's in LoaderPlugin.java LBDEVZ_LIC_BAKED_KEY.
const LIC_SLOT = "LBDEVZ_LIC_KEY_SLOT_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ licenseKey: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { licenseKey } = await params

  const [row] = await db
    .select({ license: licenses, product: products })
    .from(licenses)
    .leftJoin(products, eq(licenses.productId, products.id))
    .where(
      and(
        eq(licenses.licenseKey, licenseKey),
        eq(licenses.userId, session.user.id!)
      )
    )
    .limit(1)

  if (!row || row.license.status !== "active") {
    return NextResponse.json({ error: "License not found or inactive" }, { status: 403 })
  }

  const [version] = await db
    .select()
    .from(productVersions)
    .where(
      and(
        eq(productVersions.productId, row.license.productId),
        eq(productVersions.published, true)
      )
    )
    .orderBy(desc(productVersions.createdAt))
    .limit(1)

  if (!version) {
    return NextResponse.json({ error: "No published version available yet" }, { status: 404 })
  }

  if (!version.blobKey) {
    return NextResponse.json({ error: "File not yet uploaded. Contact support." }, { status: 404 })
  }

  const filePath = join(process.cwd(), "public", "downloads", version.blobKey)
  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "File not found on server." }, { status: 404 })
  }

  let fileBuffer: Buffer = await readFile(filePath)

  // Bake the license key into the JAR for .jar files that have the slot placeholder
  if (version.blobKey.endsWith(".jar")) {
    fileBuffer = patchLicenseKey(fileBuffer, licenseKey)
  }

  const fileName = `${row.product?.name ?? "plugin"}-v${version.version}.jar`

  const body = new Uint8Array(fileBuffer)

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type":        "application/java-archive",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length":      String(body.length),
      "X-Checksum-SHA256":   version.checksum ?? "",
      "X-Plugin-Version":    version.version,
    },
  })
}

/**
 * Patches the LBDEVZ_LIC_KEY_SLOT placeholder in the JAR's constant pool
 * with the real license key, padded to the same byte length with spaces.
 *
 * Java class constant pool CONSTANT_Utf8 format: [0x01][2-byte len][bytes]
 * We do byte-level search-replace preserving the length field so no offsets shift.
 */
function patchLicenseKey(jarBytes: Buffer, licenseKey: string): Buffer {
  const slotBytes = Buffer.from(LIC_SLOT, "utf8")
  const slotLen   = slotBytes.length

  // Pad or truncate the license key to exactly slotLen bytes
  const keyPadded = licenseKey.padEnd(slotLen, " ").slice(0, slotLen)
  const keyBytes  = Buffer.from(keyPadded, "utf8")

  // Build the constant pool search pattern: tag(0x01) + 2-byte len + string bytes
  const pattern = Buffer.alloc(3 + slotLen)
  pattern[0] = 0x01
  pattern[1] = (slotLen >> 8) & 0xff
  pattern[2] = slotLen & 0xff
  slotBytes.copy(pattern, 3)

  const idx = indexOf(jarBytes, pattern)
  if (idx === -1) {
    // Placeholder not found — JAR was not built with baked-key support, serve as-is
    return jarBytes
  }

  // Build replacement: same tag + same length (keyBytes is also slotLen) + key bytes
  const replacement = Buffer.alloc(3 + slotLen)
  replacement[0] = 0x01
  replacement[1] = (slotLen >> 8) & 0xff
  replacement[2] = slotLen & 0xff
  keyBytes.copy(replacement, 3)

  const patched = Buffer.concat([
    jarBytes.subarray(0, idx),
    replacement,
    jarBytes.subarray(idx + pattern.length),
  ])

  return patched
}

function indexOf(haystack: Buffer, needle: Buffer): number {
  for (let i = 0; i <= haystack.length - needle.length; i++) {
    let match = true
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) { match = false; break }
    }
    if (match) return i
  }
  return -1
}