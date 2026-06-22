import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { licenses, licenseIps } from "@lbdevz/db"
import { eq, and } from "drizzle-orm"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
import net from "node:net"

type Ctx = { params: Promise<{ licenseKey: string }> }

async function getLicense(licenseKey: string, userId: string) {
  const [row] = await db
    .select()
    .from(licenses)
    .where(and(eq(licenses.licenseKey, licenseKey), eq(licenses.userId, userId)))
    .limit(1)
  return row
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { licenseKey } = await params
  const lic = await getLicense(licenseKey, session.user.id!)
  if (!lic) return NextResponse.json({ error: "Lisans bulunamadı" }, { status: 404 })

  const ips = await db.select().from(licenseIps).where(eq(licenseIps.licenseId, lic.id))
  return NextResponse.json({ ips, seatLimit: lic.seatLimit })
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Spam koruması.
  const rl = checkRateLimit(`license-ip-add:${session.user.id}:${getClientIp(req)}`, { limit: 20, windowMs: 60 * 1000 })
  if (!rl.success) return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 })

  const { licenseKey } = await params
  const lic = await getLicense(licenseKey, session.user.id!)
  if (!lic) return NextResponse.json({ error: "Lisans bulunamadı" }, { status: 404 })
  if (lic.status !== "active") return NextResponse.json({ error: "Lisans aktif değil" }, { status: 403 })

  const { ip, label } = await req.json()
  if (!ip?.trim()) return NextResponse.json({ error: "IP adresi gerekli" }, { status: 400 })
  if (!net.isIP(ip.trim())) return NextResponse.json({ error: "Geçerli bir IP adresi girin" }, { status: 400 })

  const current = await db.select().from(licenseIps).where(eq(licenseIps.licenseId, lic.id))
  if (current.length >= lic.seatLimit) {
    return NextResponse.json({ error: `IP limiti doldu (${lic.seatLimit}/${lic.seatLimit})` }, { status: 409 })
  }
  if (current.some(r => r.ip === ip.trim())) {
    return NextResponse.json({ error: "Bu IP zaten ekli" }, { status: 409 })
  }

  const [added] = await db.insert(licenseIps).values({
    licenseId: lic.id,
    ip:        ip.trim(),
    label:     label?.trim() || null,
  }).returning()

  return NextResponse.json({ ip: added })
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { licenseKey } = await params
  const lic = await getLicense(licenseKey, session.user.id!)
  if (!lic) return NextResponse.json({ error: "Lisans bulunamadı" }, { status: 404 })

  const { ipId } = await req.json()
  if (!ipId) return NextResponse.json({ error: "IP ID gerekli" }, { status: 400 })

  await db.delete(licenseIps)
    .where(and(eq(licenseIps.id, ipId), eq(licenseIps.licenseId, lic.id)))

  return NextResponse.json({ ok: true })
}