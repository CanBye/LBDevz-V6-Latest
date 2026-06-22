import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { ser } from "@/lib/db-util"

export async function GET(req: NextRequest) {
  const session = await requirePermission(ADMIN_PERMISSIONS.ANALYTICS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const days = Math.min(90, Math.max(1, Number(searchParams.get("days") ?? "30")))
  const d = String(days)

  const [
    totalViews, uniqueVisitors, topPages, topCountries,
    dailyViews, topReferrers, recentViews
  ] = await Promise.all([
    db.execute(sql`SELECT COUNT(*)::int as count FROM page_views WHERE created_at > NOW() - INTERVAL '1 day' * ${days}`),
    db.execute(sql`SELECT COUNT(DISTINCT ip_hash)::int as count FROM page_views WHERE created_at > NOW() - INTERVAL '1 day' * ${days}`),
    db.execute(sql`SELECT path, COUNT(*)::int as views FROM page_views WHERE created_at > NOW() - INTERVAL '1 day' * ${days} GROUP BY path ORDER BY views DESC LIMIT 15`),
    db.execute(sql`SELECT country, country_code, COUNT(*)::int as views FROM page_views WHERE created_at > NOW() - INTERVAL '1 day' * ${days} AND country IS NOT NULL GROUP BY country, country_code ORDER BY views DESC LIMIT 20`),
    db.execute(sql`SELECT DATE(created_at) as date, COUNT(*)::int as views, COUNT(DISTINCT ip_hash)::int as unique_visitors FROM page_views WHERE created_at > NOW() - INTERVAL '1 day' * ${days} GROUP BY DATE(created_at) ORDER BY date ASC`),
    db.execute(sql`SELECT COALESCE(referrer, 'Direkt') as referrer, COUNT(*)::int as count FROM page_views WHERE created_at > NOW() - INTERVAL '1 day' * ${days} GROUP BY referrer ORDER BY count DESC LIMIT 10`),
    db.execute(sql`SELECT path, country, created_at FROM page_views ORDER BY created_at DESC LIMIT 20`),
  ])

  return NextResponse.json({
    totalViews:    (ser(totalViews)[0] as any)?.count ?? 0,
    uniqueVisitors: (ser(uniqueVisitors)[0] as any)?.count ?? 0,
    topPages:      ser(topPages),
    topCountries:  ser(topCountries),
    dailyViews:    ser(dailyViews),
    topReferrers:  ser(topReferrers),
    recentViews:   ser(recentViews),
  })
}