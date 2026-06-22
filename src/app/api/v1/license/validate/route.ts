import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { licenses, products, licenseIps, licenseLogs, productVersions, users } from "@lbdevz/db"
import { eq, and, desc } from "drizzle-orm"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
import { buildSignaturePayload, signLicensePayload } from "@/lib/license-signing"
import { registerNonce } from "@/lib/license-nonce"

// Generic error to avoid acting as a validity/status oracle for attackers.
const GENERIC_INVALID = { valid: false, error: "Invalid license or unauthorized" }

type AuditEvent =
  | "validated"
  | "ip_rejected"
  | "replay_rejected"
  | "revoked"
  | "expired"
  | "error"

/** Best-effort audit log; never let logging failures break validation. */
async function audit(
  event: AuditEvent,
  licenseKey: string,
  ip: string | null,
  licenseId?: string | null,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await db.insert(licenseLogs).values({
      licenseId: licenseId ?? null,
      licenseKey,
      event,
      ip,
      metadata: metadata ?? null,
    })
  } catch (err) {
    console.error("[license-validate] audit log failed:", err)
  }
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit per client IP to stop license-key brute force / enumeration.
    const clientIp = getClientIp(req)
    const rl = checkRateLimit(`license-validate:${clientIp}`, { limit: 30, windowMs: 60 * 1000 })
    if (!rl.success) {
      return NextResponse.json({ valid: false, error: "Rate limited" }, { status: 429 })
    }

    // Optional shared-secret for trusted server-to-server callers. When set, the
    // header is required. NOTE: the public plugin loader is an UNTRUSTED client
    // (it runs on customers' Minecraft servers), so receiving the key half is NOT
    // gated behind this header anymore — gating it there would either break every
    // plugin (key never delivered) or force baking a shared secret into each JAR.
    // The key half is instead protected by: active-status + IP binding + rate
    // limiting + (when configured) an Ed25519 signature that prevents MITM/replay.
    const expectedApiKey = process.env.LICENSE_VALIDATE_API_KEY
    const providedApiKey = req.headers.get("x-license-api-key")
    if (expectedApiKey && providedApiKey !== expectedApiKey) {
      return NextResponse.json(GENERIC_INVALID, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    // SECURITY: never trust a client-supplied `ip`; it would bypass IP binding.
    const { licenseKey, nonce } = body as { licenseKey?: unknown; nonce?: unknown }

    if (!licenseKey || typeof licenseKey !== "string") {
      return NextResponse.json(GENERIC_INVALID, { status: 400 })
    }

    const safeNonce = typeof nonce === "string" ? nonce : undefined

    const [license] = await db
      .select({
        license:   licenses,
        productName: products.name,
        productId:   products.id,
      })
      .from(licenses)
      .leftJoin(products, eq(licenses.productId, products.id))
      .leftJoin(users,    eq(licenses.userId,    users.id))
      .where(eq(licenses.licenseKey, licenseKey))
      .limit(1)

    if (!license) {
      // Unknown key — log under the supplied key for abuse tracking.
      await audit("error", licenseKey, clientIp, null, { reason: "not_found" })
      return NextResponse.json(GENERIC_INVALID, { status: 404 })
    }

    if (license.license.status !== "active") {
      const ev: AuditEvent = license.license.status === "revoked" ? "revoked"
        : license.license.status === "expired" ? "expired"
        : "error"
      await audit(ev, licenseKey, clientIp, license.license.id, { status: license.license.status })
      return NextResponse.json(GENERIC_INVALID, { status: 403 })
    }

    // Replay protection: reject a nonce already seen for this license recently.
    if (!registerNonce(licenseKey, safeNonce)) {
      await audit("replay_rejected", licenseKey, clientIp, license.license.id, { nonce: safeNonce })
      return NextResponse.json(GENERIC_INVALID, { status: 409 })
    }

    // IP binding check
    const allowedIpRows = await db
      .select({ ip: licenseIps.ip })
      .from(licenseIps)
      .where(eq(licenseIps.licenseId, license.license.id))

    // IP binding: boş liste = plugin çalışmaz
    if (allowedIpRows.length === 0) {
      await audit("ip_rejected", licenseKey, clientIp, license.license.id, { reason: "no_allowlist" })
      return NextResponse.json(GENERIC_INVALID, { status: 403 })
    }

    // Only derive the request IP from trusted proxy headers — never from the body.
    const rawIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown"

    // Normalize IPv4-mapped IPv6: ::ffff:1.2.3.4 → 1.2.3.4
    const normIp = rawIp.startsWith("::ffff:") ? rawIp.slice(7) : rawIp

    const allowedList = allowedIpRows.map((r) =>
      r.ip.startsWith("::ffff:") ? r.ip.slice(7) : r.ip
    )
    if (!allowedList.includes(normIp)) {
      await audit("ip_rejected", licenseKey, normIp, license.license.id, { ip: normIp })
      return NextResponse.json(GENERIC_INVALID, { status: 403 })
    }

    // Fetch latest published version — for key half + update check
    const [latestVersion] = await db
      .select({
        serverKeyHalf: productVersions.serverKeyHalf,
        version:       productVersions.version,
        createdAt:     productVersions.createdAt,
      })
      .from(productVersions)
      .where(
        and(
          eq(productVersions.productId, license.license.productId),
          eq(productVersions.published, true)
        )
      )
      .orderBy(desc(productVersions.createdAt))
      .limit(1)

    const keyHalf = latestVersion?.serverKeyHalf ?? null

    // Ed25519 anti-MITM signature over licenseKey:hex(keyHalf):nonce.
    // Only produced when a signing key is configured AND we actually have a key
    // half + nonce to bind. The loader verifies it against its baked public key.
    let signature: string | null = null
    if (keyHalf && safeNonce) {
      const payload = buildSignaturePayload(licenseKey, keyHalf, safeNonce)
      signature = signLicensePayload(payload)
    }

    await audit("validated", licenseKey, normIp, license.license.id, {
      version: latestVersion?.version ?? null,
      signed: Boolean(signature),
    })

    return NextResponse.json({
      valid:        true,
      status:       license.license.status,
      product:      license.productName ?? "Unknown Product",
      expiresAt:    license.license.expiresAt,
      latestVersion: latestVersion?.version ?? null,
      message:      "License is valid and active",
      // Echo the nonce so the loader can confirm the response matches its request.
      ...(safeNonce ? { nonce: safeNonce } : {}),
      // Key half is delivered to any valid+active+IP-bound license. It is useless
      // alone (kBaked is required to reconstruct kFull) and protected from MITM
      // by the Ed25519 signature + nonce when signing is configured.
      ...(keyHalf ? { keyHalf } : {}),
      ...(signature ? { signature } : {}),
    })
  } catch (err) {
    console.error("License validate error:", err)
    return NextResponse.json({ valid: false, error: "Server error" }, { status: 500 })
  }
}
