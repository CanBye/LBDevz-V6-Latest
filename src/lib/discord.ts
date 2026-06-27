export async function sendDiscordNotification(embed: {
  title: string
  description: string
  color?: number
  fields?: Array<{ name: string; value: string; inline?: boolean }>
  author?: { name: string; icon_url?: string }
  thumbnail?: { url: string }
}) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    console.log("[Discord] Webhook URL not configured, skipping:", embed.title)
    return
  }
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [{
          author: embed.author,
          thumbnail: embed.thumbnail,
          title: embed.title,
          description: embed.description,
          color: embed.color ?? 0x7C3AED,
          fields: embed.fields ?? [],
          timestamp: new Date().toISOString(),
          footer: { text: "LBDevz Platform" }
        }]
      })
    })
  } catch (err) {
    console.error("[Discord] Webhook error:", err)
  }
}

export const notify = {
  purchase: (user: string, product: string, amount: number, licenseKey: string, userImage?: string | null) => {
    const fields: Array<{ name: string; value: string; inline?: boolean }> = [
      { name: "🛒 Ürün", value: product, inline: true },
    ]
    if (amount > 0) {
      fields.push({ name: "💰 Tutar", value: `₺${amount}`, inline: true })
    }
    return sendDiscordNotification({
      author: userImage ? { name: user, icon_url: userImage } : { name: user },
      title: "💳 Yeni Satın Alma — Hayırlı Olsun!",
      description: `**${user}**, **${product}** ürününü edindi, hayırlı olsun! 🎉`,
      color: 0x10B981,
      fields,
    })
  },

  topupRequest: (user: string, amount: number, ref: string, userImage?: string | null) =>
    sendDiscordNotification({
      author: userImage
        ? { name: user, icon_url: userImage }
        : { name: user },
      title: "📥 Yeni Kredi Yükleme Talebi",
      description: `**${user}** ₺${amount} kredi yüklemek istiyor, onay bekliyor.`,
      color: 0xF59E0B,
      fields: [
        { name: "💵 Tutar",    value: `₺${amount}`,        inline: true },
        { name: "📋 Referans", value: ref || "Belirtilmedi", inline: true },
      ]
    }),

  topupApproved: (user: string, amount: number, userImage?: string | null) =>
    sendDiscordNotification({
      author: userImage
        ? { name: user, icon_url: userImage }
        : { name: user },
      title: "✅ Kredi Yükleme Onaylandı",
      description: `**${user}** hesabına ₺${amount} kredi yüklendi, iyi harcamalar! 💸`,
      color: 0x10B981,
      fields: [
        { name: "💰 Yüklenen", value: `₺${amount}`, inline: true },
      ]
    }),

  newTicket: (user: string, subject: string, priority: string, userImage?: string | null) =>
    sendDiscordNotification({
      author: userImage
        ? { name: user, icon_url: userImage }
        : { name: user },
      title: "🎫 Yeni Destek Talebi",
      description: `**${user}** destek istiyor: ${subject}`,
      color: 0x6366F1,
      fields: [
        { name: "⚡ Öncelik", value: priority, inline: true },
      ]
    }),
}