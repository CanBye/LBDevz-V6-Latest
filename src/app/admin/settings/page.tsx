"use client"

import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions"

import { AdminGuard } from "@/components/admin/admin-guard"

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

const inputCls = "w-full rounded-xl border border-white/[0.07] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-all"

interface SettingField {
  key: string
  label: string
  placeholder: string
  type?: string
  hint?: string
}

const SETTINGS_SCHEMA: { section: string; icon: string; fields: SettingField[] }[] = [
  {
    section: "Ödeme Ayarları",
    icon: "carbon:wallet",
    fields: [
      { key: "site_iban",        label: "IBAN",              placeholder: "TR00 0000 0000 0000 0000 0000 00", hint: "Kredi yükleme sayfasında gösterilir" },
      { key: "site_iban_name",   label: "Hesap Sahibi Adı",  placeholder: "Ad Soyad / Şirket Adı" },
      { key: "site_iban_bank",   label: "Banka Adı",         placeholder: "Ziraat Bankası" },
      { key: "site_min_topup",   label: "Min. Yükleme (₺)",  placeholder: "10", type: "number" },
    ],
  },
  {
    section: "Site Bilgileri",
    icon: "carbon:settings-adjust",
    fields: [
      { key: "site_name",        label: "Site Adı",          placeholder: "LBDevz" },
      { key: "site_description", label: "Site Açıklaması",   placeholder: "Premium yazılım çözümleri" },
      { key: "site_email",       label: "İletişim E-posta",  placeholder: "info@lbdevz.com", type: "email" },
      { key: "site_discord",     label: "Discord Sunucu",    placeholder: "https://discord.gg/..." },
    ],
  },
  {
    section: "Güvenlik & Doğrulama",
    icon: "carbon:security",
    fields: [
      { key: "maintenance_mode", label: "Bakım Modu",        placeholder: "0 (kapalı) / 1 (açık)", hint: "1 girilirse siteye erişim engellenir" },
      { key: "register_enabled", label: "Kayıt Açık",        placeholder: "1 (açık) / 0 (kapalı)" },
    ],
  },
]

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(d => { setSettings(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function change(key: string, value: string) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  async function save() {
    setSaving(true); setMsg(null)
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    })
    setSaving(false)
    setMsg({ ok: res.ok, text: res.ok ? "Ayarlar kaydedildi" : "Hata oluştu" })
  }

  return (
    <AdminGuard permission={ADMIN_PERMISSIONS.SETTINGS}>
      <div className="p-6 sm:p-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white/90">Panel Ayarları</h1>
          <p className="text-xs text-white/30 mt-0.5 uppercase tracking-widest font-mono">Admin · Settings</p>
        </div>

        {msg && (
          <div className={cn("mb-6 rounded-xl border px-4 py-2.5 text-xs font-medium", msg.ok ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400" : "border-red-500/20 bg-red-500/[0.06] text-red-400")}>
            {msg.text}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-white/[0.03] animate-pulse" />)}</div>
        ) : (
          <div className="space-y-8">
            {SETTINGS_SCHEMA.map(({ section, icon, fields }) => (
              <div key={section} className="rounded-2xl border border-white/[0.07] bg-[#090909] overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.05]">
                  <Icon icon={icon} className="text-white/40" width={16} />
                  <p className="text-sm font-semibold text-white/70">{section}</p>
                </div>
                <div className="p-5 space-y-4">
                  {fields.map(field => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium text-white/50 mb-1.5">
                        {field.label}
                        {field.hint && <span className="ml-2 text-white/25 font-normal">{field.hint}</span>}
                      </label>
                      <input
                        type={field.type ?? "text"}
                        className={inputCls}
                        placeholder={field.placeholder}
                        value={settings[field.key] ?? ""}
                        onChange={e => change(field.key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-white text-black px-5 py-2.5 text-sm font-bold hover:bg-white/90 disabled:opacity-40 transition-all"
              >
                <Icon icon="carbon:save" width={15} />
                {saving ? "Kaydediliyor..." : "Tüm Ayarları Kaydet"}
              </button>
            </div>
          </div>
        )}
      </div>
      </AdminGuard>
  )
}