/**
 * Simple in-memory IP-based rate limiter.
 *
 * WARNING: State is per-process. In a multi-instance / serverless deployment each
 * cold-start has its own map. Suitable for basic brute-force protection; use Redis
 * for strict cross-instance enforcement.
 *
 * TODO (security hardening / finding #10): When deploying to more than one
 * instance, replace this in-memory store with a Redis-backed limiter using the
 * already-configured REDIS_URL (e.g. ioredis INCR + PEXPIRE, or @upstash/ratelimit).
 * A Redis client is intentionally NOT added here to avoid introducing a heavy
 * runtime dependency / build risk; do this as a deliberate ops change. The public
 * API below is synchronous; keep call sites tolerant of an async variant when the
 * Redis backend is introduced.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Purge stale entries every 5 minutes to prevent unbounded memory growth.
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) store.delete(key)
    }
  }, 5 * 60 * 1000)
}

export interface RateLimitOptions {
  /** Maximum number of requests allowed within the window. */
  limit: number
  /** Window duration in milliseconds. */
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

/**
 * Check (and increment) the rate-limit counter for a given key (typically an IP).
 *
 * @example
 * const result = checkRateLimit(`login:${ip}`, { limit: 10, windowMs: 60_000 })
 * if (!result.success) return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 })
 */
export function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions
): RateLimitResult {
  const now = Date.now()
  let entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + windowMs }
    store.set(key, entry)
  }

  entry.count += 1

  return {
    success: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt: entry.resetAt,
  }
}

/** Extracts the best-available client IP from a Next.js Request. */
export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  )
}