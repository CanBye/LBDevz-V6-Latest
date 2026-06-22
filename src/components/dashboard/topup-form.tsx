"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"

const TOPUP_OPTIONS = [50, 100, 200, 500, 1000]

interface TopupFormProps {
  onSuccess?: () => void
}

export function TopupForm({ onSuccess }: TopupFormProps) {
  const { t } = useLanguage()
  const [amount, setAmount] = useState<number | "">("")
  const [reference, setReference] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [iban, setIban] = useState("Yükleniyor...")
  const [ibanName, setIbanName] = useState("")
  const [ibanBank, setIbanBank] = useState("")

  useEffect(() => {
    fetch("/api/site/settings")
      .then(r => r.json())
      .then(d => {
        setIban(d.site_iban || d.NEXT_PUBLIC_SITE_IBAN || "IBAN ayarlanmamış")
        if (d.site_iban_name) setIbanName(d.site_iban_name)
        if (d.site_iban_bank) setIbanBank(d.site_iban_bank)
      })
      .catch(() => setIban("IBAN ayarlanmamış"))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || amount < 10) {
      setError(t("minAmount"))
      return
    }
    setLoading(true)
    setError("")
    const res = await fetch("/api/dashboard/kredi/topup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountCredits: amount, ibanReference: reference }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error ?? "Hata / Error")
      return
    }
    setSuccess(true)
    setAmount("")
    setReference("")
    onSuccess?.()
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#070707] p-6 max-w-2xl">
      <h2 className="text-sm font-semibold text-white/70">{t("topupIban")}</h2>
      <p className="mt-1 text-xs text-white/35">
        {t("topupIbanDesc")}
      </p>

      <div className="mt-4 rounded-xl border border-white/[0.08] bg-black/40 p-4 space-y-2">
        {ibanBank && <p className="text-[10px] text-white/30 uppercase tracking-wider font-mono">{ibanBank}</p>}
        <div>
          <p className="text-xs text-white/40">IBAN</p>
          <p className="mt-0.5 select-all font-mono text-sm font-semibold text-white">{iban}</p>
        </div>
        {ibanName && (
          <div>
            <p className="text-xs text-white/40">Hesap Sahibi</p>
            <p className="mt-0.5 text-sm text-white/80">{ibanName}</p>
          </div>
        )}
      </div>

      {success ? (
        <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
          <p className="text-sm text-emerald-400">
            {t("topupSuccess")}
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-2 text-xs font-semibold text-emerald-400 underline underline-offset-2 hover:text-emerald-300"
          >
            Yeni talep oluştur / New request
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-xs text-white/40">{t("chooseAmount")}</p>
            <div className="flex flex-wrap gap-2">
              {TOPUP_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setAmount(opt)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    amount === opt
                      ? "border-white bg-white text-black"
                      : "border-white/[0.08] text-white/60 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {opt} ₺
                </button>
              ))}
            </div>
          </div>
          <input
            type="number"
            placeholder={`${t("customAmount")} (min. 10 ₺)`}
            value={amount}
            onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
            min={10}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/20"
          />
          <input
            type="text"
            placeholder={t("referencePlaceholder")}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/20"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading || !amount}
            className="w-full rounded-xl bg-white py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90 disabled:opacity-50"
          >
            {loading ? t("submitting") : t("submitRequest")}
          </button>
        </form>
      )}
    </div>
  )
}
