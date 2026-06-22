import { NextRequest, NextResponse } from "next/server"
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/admin"
import { db } from "@/lib/db"
import { topupRequests, creditTransactions, users } from "@lbdevz/db"
import { eq } from "drizzle-orm"
import { getUserBalance } from "@/lib/credits"
import { notify } from "@/lib/discord"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(ADMIN_PERMISSIONS.TOPUPS)
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

  const { id } = await params
  const { status } = await req.json()

  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 })
  }

  const [topup] = await db
    .select()
    .from(topupRequests)
    .where(eq(topupRequests.id, id))
    .limit(1)

  if (!topup) return NextResponse.json({ error: "Talep bulunamadı" }, { status: 404 })
  if (topup.status !== "pending") {
    return NextResponse.json({ error: "Bu talep zaten işlenmiş" }, { status: 400 })
  }

  if (status === "approved") {
    const currentBalance = await getUserBalance(topup.userId)
    const newBalance = currentBalance + topup.amountCredits

    await db.transaction(async (tx) => {
      await tx.insert(creditTransactions).values({
        userId: topup.userId,
        amount: topup.amountCredits,
        type: "topup",
        balanceAfter: newBalance,
        note: `Kredi yükleme onaylandı (Talep #${topup.id.slice(0, 8)})`,
        createdBy: session.user.id!,
      })
      await tx
        .update(topupRequests)
        .set({
          status: "approved",
          reviewedBy: session.user.id!,
          reviewedAt: new Date(),
        })
        .where(eq(topupRequests.id, id))
    })
  } else {
    await db
      .update(topupRequests)
      .set({
        status: "rejected",
        reviewedBy: session.user.id!,
        reviewedAt: new Date(),
      })
      .where(eq(topupRequests.id, id))
  }

  if (status === "approved") {
    db.select({ name: users.name, email: users.email, image: users.image })
      .from(users).where(eq(users.id, topup.userId)).limit(1)
      .then(([u]) => notify.topupApproved(
        u?.name ?? u?.email ?? "Kullanıcı",
        topup.amountCredits,
        u?.image
      )).catch(console.error)
  }

  return NextResponse.json({ success: true })
}