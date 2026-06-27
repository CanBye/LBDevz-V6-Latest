import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { productVersions } from "@lbdevz/db"
import { eq } from "drizzle-orm"
import { spawn } from "child_process"
import { join } from "path"
import { existsSync } from "fs"

const OBF_WORKER_JAR = join(process.cwd(), "apps", "obf-worker", "dist", "obf-worker.jar")
const DOWNLOADS_DIR  = join(process.cwd(), "public", "downloads")
const API_HOST       = process.env.LICENSE_API_HOST ?? "localhost"
const API_PORT       = process.env.LICENSE_API_PORT ?? process.env.PORT ?? "3000"
// http in dev, https in production behind a TLS terminator. Baked into the loader
// so it calls the validate endpoint over the right scheme.
const API_SCHEME     = process.env.LICENSE_API_SCHEME ?? (process.env.NODE_ENV === "production" ? "https" : "http")
// Ed25519 public key (SPKI/DER base64) baked into the loader for anti-MITM
// signature verification. When unset, the loader simply skips the check.
const ED25519_PUB    = process.env.LICENSE_ED25519_PUBLIC_KEY ?? ""

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  const session = await requirePermission(ADMIN_PERMISSIONS.PRODUCTS)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: productId, versionId } = await params

  // Get the version record
  const [version] = await db
    .select()
    .from(productVersions)
    .where(eq(productVersions.id, versionId))
    .limit(1)

  if (!version) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 })
  }

  if (!version.blobKey) {
    return NextResponse.json({ error: "No file uploaded for this version" }, { status: 400 })
  }

  const inputJar = join(DOWNLOADS_DIR, version.blobKey)
  if (!existsSync(inputJar)) {
    return NextResponse.json({ error: "Plugin file not found on server" }, { status: 404 })
  }

  // Mark as processing
  await db.update(productVersions)
    .set({ obfStatus: "processing" })
    .where(eq(productVersions.id, versionId))

  const outputFileName = version.blobKey.replace(/\.jar$/, "") + "-obf.jar"
  const outputJar      = join(DOWNLOADS_DIR, outputFileName)

  // Run Java obf-worker (ASM is bundled inside the fat JAR — no separate classpath needed)
  // Arg order matches ObfWorker.main: input output productId apiHost apiPort licEnv mainClass apiScheme ed25519Pub
  const result = await runObfWorker(OBF_WORKER_JAR, [
    inputJar,
    outputJar,
    productId,
    API_HOST,
    API_PORT,
    "LICENSE_KEY",
    "",            // mainClass: auto-detect from plugin.yml
    API_SCHEME,
    ED25519_PUB,
  ])

  const isDev = process.env.NODE_ENV !== "production"

  if (!result.success) {
    console.error("[obfuscate] failed:", result.stderr)
    await db.update(productVersions)
      .set({ obfStatus: "failed" })
      .where(eq(productVersions.id, versionId))

    return NextResponse.json({
      error: "Obfuscation failed",
      // İç hata ayrıntıları (yol/stack) yalnızca geliştirme ortamında döner.
      ...(isDev ? { detail: result.stderr } : {}),
    }, { status: 500 })
  }

  // Parse output: KSERVER=..., CHECKSUM=..., MAPPINGKEY=..., STATUS=done
  const parsed = parseObfOutput(result.stdout)

  if (parsed.STATUS !== "done") {
    console.error("[obfuscate] did not complete:", result.stdout)
    await db.update(productVersions)
      .set({ obfStatus: "failed" })
      .where(eq(productVersions.id, versionId))

    return NextResponse.json({
      error: "Obfuscation did not complete",
      ...(isDev ? { detail: result.stdout } : {}),
    }, { status: 500 })
  }

  // Update DB with obfuscated file
  await db.update(productVersions)
    .set({
      obfStatus:    "done",
      blobKey:      outputFileName,
      fileKey:      outputFileName,
      checksum:     parsed.CHECKSUM ?? null,
      mappingKey:   parsed.MAPPINGKEY ?? null,
      serverKeyHalf: parsed.KSERVER ?? null,
    })
    .where(eq(productVersions.id, versionId))

  return NextResponse.json({
    success:    true,
    versionId,
    obfStatus:  "done",
    blobKey:    outputFileName,
    checksum:   parsed.CHECKSUM,
    mappingKey: parsed.MAPPINGKEY,
  })
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function runObfWorker(jarPath: string, args: string[]): Promise<{
  success: boolean; stdout: string; stderr: string
}> {
  return new Promise((resolve) => {
    if (!existsSync(OBF_WORKER_JAR)) {
      resolve({
        success: false,
        stdout: "",
        stderr: `obf-worker.jar not found at ${OBF_WORKER_JAR}. Run apps/obf-worker/build.ps1 first.`,
      })
      return
    }

    // Fat JAR with Main-Class manifest — use -jar so no separate classpath needed
    const javaArgs = ["-jar", jarPath, ...args]
    const proc     = spawn("java", javaArgs, { timeout: 120_000 })

    let stdout = ""
    let stderr = ""
    proc.stdout.on("data", (d: Buffer) => { stdout += d.toString() })
    proc.stderr.on("data", (d: Buffer) => { stderr += d.toString() })

    proc.on("close", (code) => {
      console.log("[ObfWorker] exit:", code)
      console.log("[ObfWorker] stdout:", stdout)
      if (stderr) console.log("[ObfWorker] stderr:", stderr)
      resolve({ success: code === 0, stdout, stderr })
    })

    proc.on("error", (err) => {
      resolve({ success: false, stdout, stderr: err.message })
    })
  })
}

function parseObfOutput(stdout: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const line of stdout.split("\n")) {
    const eq = line.indexOf("=")
    if (eq > 0) {
      result[line.slice(0, eq).trim()] = line.slice(eq + 1).trim()
    }
  }
  return result
}