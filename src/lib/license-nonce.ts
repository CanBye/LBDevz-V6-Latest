/**
 * In-memory replay-protection store for license validation nonces.
 *
 * Each loader request carries a fresh random `nonce`. The server records seen
 * nonces (per license) for a short TTL and rejects repeats — stopping an
 * attacker from capturing one valid response and replaying the request.
 *
 * WARNING: state is per-process (same caveat as src/lib/rate-limit.ts).
 * TODO (ops / multi-instance): back this with Redis using REDIS_URL
 * (e.g. SET key value NX PX <ttl>) for cross-instance replay protection.
 * A Redis client is intentionally not added here to avoid a heavy runtime
 * dependency / build risk; the API below is sync — keep call sites tolerant of
 * an async variant when Redis is introduced.
 */

const NONCE_TTL_MS = 2 * 60 * 1000 // 2 minutes — well above a normal request RTT

interface NonceEntry {
  expiresAt: number
}

const seen = new Map<string, NonceEntry>()

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of seen.entries()) {
      if (entry.expiresAt < now) seen.delete(key)
    }
  }, 60 * 1000)
}

/**
 * Records a nonce for a license. Returns false if this nonce was already used
 * (i.e. a replay) within the TTL, true if it is fresh and now recorded.
 *
 * Empty/blank nonces are treated as "fresh" (the caller decides whether nonce
 * is required) so that older loaders without nonce support still function.
 */
export function registerNonce(licenseKey: string, nonce: string | undefined): boolean {
  if (!nonce || nonce.trim() === "") return true

  const key = `${licenseKey}:${nonce}`
  const now = Date.now()
  const existing = seen.get(key)
  if (existing && existing.expiresAt >= now) {
    return false // replay
  }
  seen.set(key, { expiresAt: now + NONCE_TTL_MS })
  return true
}
