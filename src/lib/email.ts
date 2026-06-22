import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail(opts: EmailOptions) {
  if (!process.env.SMTP_USER) {
    console.log("[Email] SMTP not configured, skipping:", opts.subject)
    return
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "noreply@lbdevz.com",
    ...opts,
  })
}

export function purchaseEmailHtml(params: {
  name: string
  productName: string
  licenseKey: string
  amount: number
}) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 40px; border-radius: 12px;">
      <h2 style="color: #fff; margin-bottom: 8px;">Satın Alma Onayı / Purchase Confirmation</h2>
      <p style="color: #888;">Merhaba ${params.name},</p>
      <p style="color: #888;">Satın alman başarıyla tamamlandı. Lisans anahtarın aşağıda:</p>
      <div style="background: #111; border: 1px solid #333; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="color: #888; font-size: 12px; margin: 0 0 8px;">Ürün / Product</p>
        <p style="color: #fff; font-weight: bold; margin: 0 0 16px;">${params.productName}</p>
        <p style="color: #888; font-size: 12px; margin: 0 0 8px;">Lisans Anahtarı / License Key</p>
        <p style="color: #fff; font-family: monospace; font-size: 18px; margin: 0; letter-spacing: 2px;">${params.licenseKey}</p>
      </div>
      <p style="color: #888;">Tutar / Amount: <strong style="color: #fff;">₺${params.amount}</strong></p>
      <p style="color: #888; font-size: 12px;">LBDevz — Professional Software Solutions</p>
    </div>
  `
}

export function topupEmailHtml(params: { name: string; amount: number }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 40px; border-radius: 12px;">
      <h2 style="color: #10b981;">Bakiye Yüklendi / Balance Loaded</h2>
      <p style="color: #888;">Merhaba ${params.name},</p>
      <p style="color: #888;">Hesabına <strong style="color: #fff;">₺${params.amount}</strong> kredi yüklendi.</p>
      <p style="color: #888; font-size: 12px;">LBDevz — Professional Software Solutions</p>
    </div>
  `
}

export function ticketReplyEmailHtml(params: {
  name: string
  subject: string
  reply: string
}) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 40px; border-radius: 12px;">
      <h2 style="color: #fff;">Destek Talebi Güncellendi / Support Ticket Updated</h2>
      <p style="color: #888;">Merhaba ${params.name},</p>
      <p style="color: #888;">Destek talebiniz güncellendi: <strong style="color: #fff;">${params.subject}</strong></p>
      <div style="background: #111; border: 1px solid #333; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="color: #ccc; font-size: 14px; line-height: 1.6;">${params.reply}</p>
      </div>
      <p style="color: #888; font-size: 12px;">LBDevz — Professional Software Solutions</p>
    </div>
  `
}