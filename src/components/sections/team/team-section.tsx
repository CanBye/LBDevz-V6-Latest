"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Icon } from "@iconify/react"
import { useLanguage } from "@/lib/language-context"

interface TeamMember {
  id: string
  slug: string | null
  name: string
  role: string
  bio: string | null
  image: string | null
  github: string | null
  discord: string | null
  twitter: string | null
  order: number
}

/** Stops the card's <Link> navigation when clicking a nested social link. */
const stop = (e: React.MouseEvent) => e.stopPropagation()

function MemberCard({ member, index }: { member: TeamMember; index: number }) {
  const clickable = Boolean(member.slug)

  const inner = (
    <>
      <div className="absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />

      <div className="relative mb-4">
        <div className="h-20 w-20 rounded-full overflow-hidden border border-white/[0.08] bg-[#111] flex items-center justify-center">
          {member.image ? (
            <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-white/25">{member.name.charAt(0)}</span>
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-black" />
      </div>

      <h3 className="text-base font-semibold text-white">{member.name}</h3>
      <p className="mt-0.5 text-[11px] font-medium uppercase tracking-widest text-white/30">{member.role}</p>

      {member.bio && (
        <p className="mt-3 text-xs leading-relaxed text-white/40 line-clamp-3">{member.bio}</p>
      )}

      {(member.github || member.discord || member.twitter) && (
        <div className="mt-4 flex items-center gap-2">
          {member.github && (
            <a href={`https://github.com/${member.github}`} target="_blank" rel="noopener noreferrer" onClick={stop}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/35 hover:text-white hover:border-white/20 transition-all">
              <Icon icon="carbon:logo-github" width={14} />
            </a>
          )}
          {member.discord && (
            <a href={`https://discord.com/users/${member.discord}`} target="_blank" rel="noopener noreferrer" onClick={stop}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/35 hover:text-indigo-400 hover:border-indigo-500/30 transition-all">
              <Icon icon="carbon:logo-discord" width={14} />
            </a>
          )}
          {member.twitter && (
            <a href={`https://twitter.com/${member.twitter}`} target="_blank" rel="noopener noreferrer" onClick={stop}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/35 hover:text-sky-400 hover:border-sky-500/30 transition-all">
              <Icon icon="carbon:logo-twitter" width={14} />
            </a>
          )}
        </div>
      )}

      {clickable && (
        <span className="mt-4 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-white/25 transition-colors group-hover:text-emerald-400">
          Profili Gör
          <Icon icon="carbon:arrow-right" width={12} />
        </span>
      )}
    </>
  )

  const className =
    "group relative flex flex-col items-center rounded-2xl border border-white/[0.07] bg-[#070707] p-6 text-center transition-all hover:border-white/[0.13] hover:bg-[#0a0a0a]"

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      {clickable ? (
        <Link href={`/ekip/${member.slug}`} className={className}>
          {inner}
        </Link>
      ) : (
        <div className={className}>{inner}</div>
      )}
    </motion.div>
  )
}

export function TeamSection() {
  const { t } = useLanguage()
  const [members, setMembers] = useState<TeamMember[]>([])

  useEffect(() => {
    fetch("/api/site/team").then(r => r.json()).then(d => setMembers(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  if (members.length === 0) return null

  return (
    <section id="ekip" className="relative border-t border-white/[0.06] bg-black">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:px-8 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-14 text-center"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/30 mb-4">{t("teamEyebrow")}</p>
          <h2 className="text-3xl font-light tracking-tight text-white sm:text-4xl leading-[1.1]">
            {t("teamHeadline")}
          </h2>
          <p className="mt-4 max-w-md mx-auto text-sm text-white/40 leading-relaxed">
            {t("teamDesc")}
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {members.map((m, i) => <MemberCard key={m.id} member={m} index={i} />)}
        </div>
      </div>
    </section>
  )
}