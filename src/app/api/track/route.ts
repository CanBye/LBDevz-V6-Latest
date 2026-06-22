import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { auth } from "@/auth"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
import crypto from "crypto"
import net from "node:net"

// Skip internal/bot paths
const SKIP = ["/api/", "/_next/", "/favicon", ".ico", ".png", ".jpg", ".svg", ".webp", ".css", ".js"]

export async function POST(req: NextRequest) {
  try {
    // Analytics spam/flood koruması.
    const rl = checkRateLimit(`track:${getClientIp(req)}`, { limit: 60, windowMs: 60 * 1000 })
    if (!rl.success) return NextResponse.json({ ok: true })

    const { path, referrer } = await req.json()
    if (!path || SKIP.some(s => path.startsWith(s))) return NextResponse.json({ ok: true })

    const session = await auth()
    const userId = session?.user?.id ?? null

    // Hash IP for privacy
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown"
    const ipHash = crypto.createHash("sha256").update(ip + (process.env.NEXTAUTH_SECRET ?? "salt")).digest("hex").slice(0, 16)

    let country: string | null = null
    let countryCode: string | null = null
    let city: string | null = null

    // Geolocation via ip-api — yalnızca geçerli, public IP'ler için (header injection/SSRF-lite koruması).
    if (net.isIP(ip) && ip !== "127.0.0.1" && ip !== "::1") {
      try {
        const geo = await fetch(`https://ip-api.com/json/${encodeURIComponent(ip)}?fields=country,countryCode,city,status`, {
          signal: AbortSignal.timeout(2000),
        }).then(r => r.json())
        if (geo.status === "success") {
          country = geo.country
          countryCode = geo.countryCode
          city = geo.city
        }
      } catch {}
    }

    const ua = req.headers.get("user-agent") ?? null
    // Skip bots
    if (ua && /bot|crawler|spider|crawling|prerender|headless/i.test(ua)) return NextResponse.json({ ok: true })

    await db.execute(sql`
      INSERT INTO page_views (path, referrer, country, country_code, city, ip_hash, user_agent, user_id)
      VALUES (${path}, ${referrer ?? null}, ${country}, ${countryCode}, ${city}, ${ipHash}, ${ua?.slice(0, 200) ?? null}, ${userId})
    `)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}