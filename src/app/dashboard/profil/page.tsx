"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Icon } from "@iconify/react"
import { useLanguage } from "@/lib/language-context"

interface ProfileData {
  id: string
  name: string | null
  email: string
  username: string | null
  image: string | null
  createdAt: string
  totalLicenses: number
  totalSpending: number
}

export default function ProfilPage() {
  const { status } = useSession()
  const { t } = useLanguage()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState("")
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/dashboard/profile")
        .then((r) => r.json())
        .then((d) => {
          setProfile(d)
          setUsername(d.username ?? "")
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [status])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    const res = await fetch("/api/dashboard/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    })
    const data = await res.json()
    setSaving(false)
    if (res.ok) {
      setMsg({ ok: true, text: t("usernameSaved") })
      setProfile((p) => (p ? { ...p, username: data.username } : p))
    } else {
      setMsg({ ok: false, text: data.error ?? t("genericError") })
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-2xl">
        <div className="h-8 w-48 rounded bg-white/5" />
        <div className="h-32 rounded-2xl bg-white/5" />
        <div className="h-48 rounded-2xl bg-white/5" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-[#070707] p-12 text-center max-w-2xl">
        <p className="text-sm text-white/40">{t("profileLoadError")}</p>
      </div>
    )
  }

  const initials = profile.name
    ? profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : profile.email[0].toUpperCase()

  const joinedDate = new Date(profile.createdAt).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">{t("profileTitle")}</h1>
        <p className="mt-1 text-sm text-white/40">{t("profileSubtitle")}</p>
      </div>

      {/* Avatar + Info Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#070707] p-6 flex items-center gap-5">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] text-xl font-bold text-white overflow-hidden">
          {profile.image ? (
            <img src={profile.image} alt="" className="size-16 object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-white truncate">{profile.name ?? "—"}</p>
          <p className="text-sm text-white/40 truncate">{profile.email}</p>
          {profile.username && (
            <p className="mt-1 text-xs font-mono text-white/30">@{profile.username}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">{t("memberSinceLabel")}</p>
          <p className="mt-1 text-xs text-white/50">{joinedDate}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/[0.08] bg-[#070707] p-5 flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">
            {t("totalLicensesLabel")}
          </p>
          <p className="text-3xl font-bold text-white">{profile.totalLicenses}</p>
          <div className="flex items-center gap-1 text-[10px] text-white/30">
            <Icon icon="carbon:cloud-service-management" width={11} />
            {t("purchasedServicesLabel")}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[#070707] p-5 flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">
            {t("totalSpendingLabel")}
          </p>
          <p className="text-3xl font-bold text-white">
            {Number(profile.totalSpending).toLocaleString("tr-TR", { minimumFractionDigits: 0 })} ₺
          </p>
          <div className="flex items-center gap-1 text-[10px] text-white/30">
            <Icon icon="carbon:wallet" width={11} />
            {t("totalCreditsSpentLabel")}
          </div>
        </div>
      </div>

      {/* Username Update Form */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#070707] p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-white/80">{t("updateUsernameLabel")}</h2>
          <p className="text-xs text-white/35 mt-0.5">{t("usernameHint")}</p>
        </div>

        <form onSubmit={handleSave} className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm select-none">
              @
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="kullaniciadi"
              minLength={3}
              maxLength={32}
              className="w-full rounded-xl border border-white/[0.08] bg-black/60 pl-7 pr-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !username.trim()}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/[0.10] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
          >
            {saving ? (
              <Icon icon="carbon:circle-dash" width={14} className="animate-spin" />
            ) : (
              <Icon icon="carbon:save" width={14} />
            )}
            {t("saveBtn")}
          </button>
        </form>

        {msg && (
          <p className={`text-xs font-medium ${msg.ok ? "text-emerald-400" : "text-red-400"}`}>
            {msg.text}
          </p>
        )}
      </div>
    </div>
  )
}