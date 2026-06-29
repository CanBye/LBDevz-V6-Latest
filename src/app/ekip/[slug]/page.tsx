"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Icon } from "@iconify/react"
import { MiniNavbar } from "@/components/layout/mini-navbar"
import { Footer } from "@/components/layout/footer"
import DOMPurify from "isomorphic-dompurify"

interface TeamServer { name: string; role?: string; period?: string }
interface TeamProject { title: string; description?: string; link?: string; image?: string }
interface TeamMember {
  id: string
  slug: string | null
  name: string
  role: string
  bio: string | null
  longBio: string | null
  image: string | null
  github: string | null
  discord: string | null
  twitter: string | null
  yearsExperience: number | null
  languages: string[]
  servers: TeamServer[]
  projects: TeamProject[]
}

const EASE = [0.16, 1, 0.3, 1] as const

export default function TeamMemberProfilePage() {
  const { slug } = useParams() as { slug: string }
  const router = useRouter()
  const [member, setMember] = useState<TeamMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [memberProducts, setMemberProducts] = useState<Array<{id:string;name:string;imageUrl:string|null;type:string;priceCredits:number}>>([])

  useEffect(() => {
    fetch(`/api/site/team/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          router.push("/#ekip")
        } else {
          setMember(d)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))

    fetch(`/api/site/team/${slug}/products`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setMemberProducts(d) })
      .catch(() => {})
  }, [slug, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="relative h-24 border-b border-white/[0.05]"><MiniNavbar /></div>
        <div className="mx-auto max-w-5xl px-6 pt-12 sm:px-8">
          <div className="h-40 rounded-3xl bg-white/[0.03] animate-pulse" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!member) return null

  const hasSocials = member.github || member.discord || member.twitter
  const languages = member.languages ?? []
  const servers = member.servers ?? []
  const projects = member.projects ?? []

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative h-24 border-b border-white/[0.05]"><MiniNavbar /></div>

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-12 sm:px-8">
        {/* Breadcrumb */}
        <Link
          href="/#ekip"
          className="inline-flex items-center gap-2 text-xs text-white/40 transition-colors hover:text-white"
        >
          <Icon icon="carbon:arrow-left" width={14} />
          Ekibe Dön
        </Link>

        {/* Hero / identity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mt-6 flex flex-col items-center gap-6 rounded-3xl border border-white/[0.07] bg-[#070707] p-8 text-center sm:flex-row sm:items-center sm:text-left"
        >
          <div className="relative shrink-0">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111]">
              {member.image ? (
                <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-white/25">{member.name.charAt(0)}</span>
              )}
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-full border-2 border-black bg-emerald-500" />
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-white sm:text-3xl">{member.name}</h1>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.3em] text-white/35">{member.role}</p>

            {member.yearsExperience != null && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white/60">
                <Icon icon="carbon:time" width={14} className="text-emerald-400" />
                {member.yearsExperience}+ yıl tecrübe
              </div>
            )}

            {hasSocials && (
              <div className="mt-4 flex items-center justify-center gap-2 sm:justify-start">
                {member.github && (
                  <a
                    href={`https://github.com/${member.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/40 transition-all hover:border-white/20 hover:text-white"
                  >
                    <Icon icon="carbon:logo-github" width={15} />
                  </a>
                )}
                {member.discord && (
                  <a
                    href={`https://discord.com/users/${member.discord}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/40 transition-all hover:border-indigo-500/30 hover:text-indigo-400"
                  >
                    <Icon icon="carbon:logo-discord" width={15} />
                  </a>
                )}
                {member.twitter && (
                  <a
                    href={`https://twitter.com/${member.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/40 transition-all hover:border-sky-500/30 hover:text-sky-400"
                  >
                    <Icon icon="carbon:logo-twitter" width={15} />
                  </a>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* About */}
        {(member.longBio || member.bio) && (
          <Section title="Hakkında" icon="carbon:user-profile" delay={0.05}>
            <div
              className="rich-content text-sm leading-relaxed text-white/60"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(member.longBio || member.bio || "", { USE_PROFILES: { html: true } }),
              }}
            />
          </Section>
        )}

        {/* Languages / technologies */}
        {languages.length > 0 && (
          <Section title="Bildiği Diller & Teknolojiler" icon="carbon:code" delay={0.1}>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang, i) => (
                <span
                  key={i}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/70"
                >
                  {lang}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Servers worked on */}
        {servers.length > 0 && (
          <Section title="Yetkili Olduğu Sunucular" icon="carbon:bare-metal-server" delay={0.15}>
            <div className="grid gap-3 sm:grid-cols-2">
              {servers.map((s, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/[0.07] bg-[#0a0a0a] p-4 transition-all hover:border-white/[0.13]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-white/85">{s.name}</p>
                    {s.period && <span className="shrink-0 text-[10px] text-white/30">{s.period}</span>}
                  </div>
                  {s.role && (
                    <p className="mt-1 text-xs uppercase tracking-wider text-emerald-400/80">{s.role}</p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Member Products */}
        {memberProducts.length > 0 && (
          <Section title="Yaptığı Ürünler" icon="carbon:cube" delay={0.2}>
            <div className="grid gap-4 sm:grid-cols-2">
              {memberProducts.map((p) => (
                <Link key={p.id} href={`/magaza/${p.id}`} className="block group">
                  <div className="group h-full overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0a0a0a] transition-all hover:border-white/[0.13]">
                    {p.imageUrl ? (
                      <div className="aspect-video w-full overflow-hidden bg-[#111]">
                        <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    ) : (
                      <div className="aspect-video w-full bg-[#111] flex items-center justify-center">
                        <Icon icon="carbon:cube" className="text-white/10" width={32} />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-white/85">{p.name}</p>
                        <Icon icon="carbon:arrow-up-right" width={14} className="shrink-0 text-white/30" />
                      </div>
                      <p className="mt-1 text-[10px] text-white/30 uppercase tracking-wider">
                        {p.type.replace("_", " ")} · {p.priceCredits === 0 ? "Ücretsiz" : `₺${p.priceCredits}`}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Section>
        )}
      </main>

      <Footer />
    </div>
  )
}

function Section({
  title,
  icon,
  delay,
  children,
}: {
  title: string
  icon: string
  delay: number
  children: React.ReactNode
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className="mt-8"
    >
      <div className="mb-4 flex items-center gap-2">
        <Icon icon={icon} width={16} className="text-white/40" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70">{title}</h2>
      </div>
      {children}
    </motion.section>
  )
}
