import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { licenses, products, users, creditTransactions, notifications } from "@lbdevz/db"
import { eq, and } from "drizzle-orm"
import { getUserBalance } from "@/lib/credits"
import { sendEmail } from "@/lib/email"
import { notify } from "@/lib/discord"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { licenseKey } = await req.json()
  if (!licenseKey) return NextResponse.json({ error: "licenseKey gerekli" }, { status: 400 })

  const [row] = await db
    .select({ license: licenses, product: products, user: users })
    .from(licenses)
    .leftJoin(products, eq(licenses.productId, products.id))
    .leftJoin(users, eq(licenses.userId, users.id))
    .where(and(eq(licenses.licenseKey, licenseKey), eq(licenses.userId, session.user.id!)))
    .limit(1)

  if (!row) return NextResponse.json({ error: "Lisans bulunamadı" }, { status: 404 })

  if (row.product?.licenseModel !== "subscription") {
    return NextResponse.json({ error: "Bu lisans yenilenemez (lifetime lisans)" }, { status: 400 })
  }

  const periodDays = row.license.periodDays ?? row.product?.periodDays ?? 30
  const renewalCost = row.license.renewalPriceCredits ?? row.product?.priceCredits ?? 0

  const balance = await getUserBalance(session.user.id!)
  if (balance < renewalCost) {
    return NextResponse.json(
      { error: `Yetersiz bakiye. Gereken: ${renewalCost} ₺, Mevcut: ${balance} ₺` },
      { status: 400 }
    )
  }

  const base = row.license.expiresAt && row.license.expiresAt > new Date()
    ? new Date(row.license.expiresAt)
    : new Date()
  const newExpiry = new Date(base)
  newExpiry.setDate(newExpiry.getDate() + periodDays)

  const newBalance = balance - renewalCost

  await db.transaction(async (tx) => {
    await tx.update(licenses)
      .set({ expiresAt: newExpiry, status: "active", updatedAt: new Date() })
      .where(eq(licenses.id, row.license.id))

    await tx.insert(creditTransactions).values({
      userId: session.user.id!,
      amount: -renewalCost,
      type: "renewal",
      balanceAfter: newBalance,
      note: `${row.product?.name ?? "Ürün"} lisans yenileme`,
    })

    await tx.insert(notifications).values({
      userId: session.user.id!,
      type: "license_renewed",
      title: "Lisans Yenilendi",
      body: `${row.product?.name ?? "Ürün"} lisansınız ${periodDays} gün uzatıldı. Bitiş: ${newExpiry.toLocaleDateString("tr-TR")}`,
      link: "/dashboard/lisanslarim",
    })
  })

  sendEmail({
    to: session.user.email!,
    subject: `Lisans Yenileme Onayı — ${row.product?.name ?? "Ürün"}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#000;color:#fff;border-radius:12px;padding:32px">
        <h2 style="margin:0 0 8px">Lisans Yenilendi ✓</h2>
        <p style="color:#aaa">Merhaba ${row.user?.name ?? "Kullanıcı"},</p>
        <p>${row.product?.name ?? "Ürün"} lisansınız başarıyla yenilendi.</p>
        <div style="background:#111;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:4px 0;font-family:monospace;color:#888">Lisans Anahtarı</p>
          <p style="margin:4px 0;font-family:monospace;font-size:14px">${licenseKey}</p>
          <p style="margin:12px 0 4px;color:#888">Yeni Bitiş Tarihi</p>
          <p style="margin:4px 0;font-weight:bold">${newExpiry.toLocaleDateString("tr-TR")}</p>
          <p style="margin:12px 0 4px;color:#888">Ödenen Tutar</p>
          <p style="margin:4px 0;font-weight:bold">${renewalCost} ₺</p>
        </div>
        <a href="https://lbdevz.com/dashboard/lisanslarim" style="display:inline-block;background:#fff;color:#000;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px">Lisanslarımı Gör</a>
      </div>
    `,
  }).catch(console.error)

  notify.purchase(
    row.user?.name ?? session.user.email ?? "Kullanıcı",
    `${row.product?.name ?? "Ürün"} (Yenileme)`,
    renewalCost,
    licenseKey
  ).catch(console.error)

  return NextResponse.json({
    success: true,
    licenseKey,
    newExpiresAt: newExpiry,
    message: `Lisans ${periodDays} gün uzatıldı`,
    newBalance,
  })
}