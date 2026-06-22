import net from "node:net"
import dns from "node:dns/promises"

/** True if the given IP address is private / loopback / link-local / metadata. */
export function isBlockedIp(address: string): boolean {
  if (net.isIPv4(address)) {
    const [a, b] = address.split(".").map(Number)
    if (a === 127) return true                       // loopback
    if (a === 10) return true                        // private
    if (a === 0) return true                         // "this" network
    if (a === 169 && b === 254) return true          // link-local + cloud metadata (169.254.169.254)
    if (a === 192 && b === 168) return true          // private
    if (a === 172 && b >= 16 && b <= 31) return true // private
    if (a === 100 && b >= 64 && b <= 127) return true// CGNAT
    if (a >= 224) return true                        // multicast / reserved
    return false
  }
  if (net.isIPv6(address)) {
    const lower = address.toLowerCase()
    if (lower === "::1") return true                 // loopback
    if (lower === "::") return true                  // unspecified
    if (lower.startsWith("fe80")) return true        // link-local
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true // unique local
    // IPv4-mapped IPv6
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
    if (mapped) return isBlockedIp(mapped[1])
    return false
  }
  // Not a literal IP — treat as unknown/blocked from this check's perspective.
  return false
}

/**
 * Validates an outbound webhook URL to mitigate SSRF:
 *  - must be https
 *  - host must not resolve to a private/loopback/link-local/metadata address
 * Throws on violation; returns void on success.
 */
export async function assertSafeWebhookUrl(raw: string): Promise<void> {
  let u: URL
  try {
    u = new URL(raw)
  } catch {
    throw new Error("Geçersiz URL")
  }

  if (u.protocol !== "https:") {
    throw new Error("Yalnızca https URL'leri desteklenir")
  }

  // If the host is a literal IP, check it directly.
  if (net.isIP(u.hostname)) {
    if (isBlockedIp(u.hostname)) throw new Error("İç ağ adresi yasak")
    return
  }

  // Resolve all A/AAAA records; reject if ANY resolves to a blocked range.
  const results = await dns.lookup(u.hostname, { all: true })
  if (results.length === 0) throw new Error("Host çözümlenemedi")
  for (const r of results) {
    if (isBlockedIp(r.address)) throw new Error("İç ağ adresi yasak")
  }
}
