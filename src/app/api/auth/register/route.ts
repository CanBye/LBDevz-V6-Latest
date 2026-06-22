import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"
import { users } from "@lbdevz/db"
import { eq, or } from "drizzle-orm"
import { verifyTurnstile } from "@/lib/turnstile"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    const rl = checkRateLimit(`register:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 })
    if (!rl.success) {
      return NextResponse.json(
        { error: "Çok fazla kayıt denemesi. Lütfen 15 dakika sonra tekrar deneyin." },
        { status: 429 }
      )
    }

    const { name, username, email, password, turnstileToken } = await req.json()

    if (!name || !username || !email || !password) {
      return NextResponse.json({ error: "Tüm alanlar zorunlu" }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Şifre en az 8 karakter olmalı" }, { status: 400 })
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json(
        { error: "Kullanıcı adı 3-20 karakter, sadece harf/rakam/_" },
        { status: 400 }
      )
    }

    const valid = await verifyTurnstile(turnstileToken ?? "")
    if (!valid) {
      return NextResponse.json({ error: "Bot doğrulaması başarısız" }, { status: 400 })
    }

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, username)))
      .limit(1)

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Bu email veya kullanıcı adı zaten kullanılıyor" },
        { status: 409 }
      )
    }

    const passwordHash = await hash(password, 12)

    const [user] = await db
      .insert(users)
      .values({ name, username, email, passwordHash })
      .returning({ id: users.id, email: users.email })

    return NextResponse.json({ success: true, userId: user.id })
  } catch (err) {
    console.error("Register error:", err)
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
  }
}