import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import {
  users, licenses, licenseIps, products,
  creditTransactions, productDevelopers,
} from "@lbdevz/db"
import { eq, and, desc } from "drizzle-orm"
import { getUserBalance } from "@/lib/credits"
import { nanoid } from "nanoid"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await requirePermission(ADMIN_PERMISSIONS.CUSTOMERS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { id } = await params

  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 })

  const balance = await getUserBalance(id)

  const userLicenses = await db
    .select({ license: licenses, product: products })
    .from(licenses)
    .leftJoin(products, eq(licenses.productId, products.id))
    .where(eq(licenses.userId, id))
    .orderBy(desc(licenses.createdAt))

  // Attach IPs to each license
  const licWithIps = await Promise.all(
    userLicenses.map(async row => {
      const ips = await db.select().from(licenseIps).where(eq(licenseIps.licenseId, row.license.id))
      return { ...row, ips }
    })
  )

  const transactions = await db
    .select()
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, id))
    .orderBy(desc(creditTransactions.createdAt))
    .limit(20)

  return NextResponse.json({ user, balance, licenses: licWithIps, transactions })
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await requirePermission(ADMIN_PERMISSIONS.CUSTOMERS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
  const { id } = await params

  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 })

  const body = await req.json()
  const { action } = body

  // ── Add balance ──────────────────────────────────────────────────────────
  if (action === "addBalance") {
    const { amount, note } = body
    if (!amount || amount <= 0) return NextResponse.json({ error: "Geçersiz miktar" }, { status: 400 })
    const current = await getUserBalance(id)
    const newBalance = current + Number(amount)
    await db.insert(creditTransactions).values({
      userId:       id,
      amount:       Number(amount),
      type:         "admin_adjust",
      balanceAfter: newBalance,
      note:         note ?? `Admin tarafından ${amount} ₺ eklendi`,
    })
    return NextResponse.json({ ok: true, balance: newBalance })
  }

  // ── Grant license ────────────────────────────────────────────────────────
  if (action === "grantLicense") {
    const { productId, seatLimit } = body
    if (!productId) return NextResponse.json({ error: "Ürün ID gerekli" }, { status: 400 })

    const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1)
    if (!product) return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 })

    const licenseKey = `LBD-${nanoid(8).toUpperCase()}-${nanoid(8).toUpperCase()}`
    const [lic] = await db.insert(licenses).values({
      userId:              id,
      productId,
      licenseKey,
      licenseModel:        product.licenseModel,
      periodDays:          product.periodDays,
      seatLimit:           seatLimit ?? product.seatLimit ?? 1,
      autoRenew:           false,
      renewalPriceCredits: null,
      status:              "active",
    }).returning()

    return NextResponse.json({ ok: true, licenseKey: lic.licenseKey })
  }

  // ── Add IP slots to a license ────────────────────────────────────────────
  if (action === "addIpSlots") {
    const { licenseId, slots } = body
    if (!licenseId || !slots || slots <= 0) return NextResponse.json({ error: "Geçersiz parametreler" }, { status: 400 })

    const [lic] = await db.select().from(licenses)
      .where(and(eq(licenses.id, licenseId), eq(licenses.userId, id)))
      .limit(1)
    if (!lic) return NextResponse.json({ error: "Lisans bulunamadı" }, { status: 404 })

    const newLimit = lic.seatLimit + Number(slots)
    await db.update(licenses).set({ seatLimit: newLimit }).where(eq(licenses.id, licenseId))

    return NextResponse.json({ ok: true, seatLimit: newLimit })
  }

  // ── Revoke license ───────────────────────────────────────────────────────
  if (action === "revokeLicense") {
    const { licenseId } = body
    if (!licenseId) return NextResponse.json({ error: "Lisans ID gerekli" }, { status: 400 })
    await db.update(licenses).set({ status: "revoked" })
      .where(and(eq(licenses.id, licenseId), eq(licenses.userId, id)))
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: "Geçersiz action" }, { status: 400 })
}