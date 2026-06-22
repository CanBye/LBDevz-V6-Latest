import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { topupRequests } from "@lbdevz/db"
import { notify } from "@/lib/discord"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

const MAX_TOPUP = 100_000

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })

  // Spam/DoS koruması: kullanıcı + IP bazlı.
  const rl = checkRateLimit(`topup:${session.user.id}:${getClientIp(req)}`, { limit: 5, windowMs: 60 * 60 * 1000 })
  if (!rl.success) {
    return NextResponse.json({ error: "Çok fazla talep. Lütfen sonra tekrar deneyin." }, { status: 429 })
  }

  const { amountCredits, ibanReference } = await req.json()
  const amount = Number(amountCredits)
  if (!Number.isInteger(amount) || amount < 10 || amount > MAX_TOPUP) {
    return NextResponse.json({ error: `Geçersiz miktar (10–${MAX_TOPUP} arası tam sayı)` }, { status: 400 })
  }

  await db.insert(topupRequests).values({
    userId: session.user.id,
    amountCredits: amount,
    ibanReference: ibanReference || null,
    status: "pending",
  })

  notify.topupRequest(
    session.user.name ?? session.user.email ?? "Kullanıcı",
    Number(amountCredits),
    ibanReference || "",
    session.user.image
  ).catch(console.error)

  return NextResponse.json({ success: true })
}