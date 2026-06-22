"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Icon } from "@iconify/react"
import { MiniNavbar } from "@/components/layout/mini-navbar"
import { Footer } from "@/components/layout/footer"
import { useLanguage } from "@/lib/language-context"

interface Post { id: string; title: string; slug: string; excerpt: string | null; cover_url: string | null; published_at: string | null; author_name: string | null; author_image: string | null }

export default function BlogPage() {
  const { t } = useLanguage()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/site/blog").then(r => r.json()).then(d => { setPosts(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative h-24 border-b border-white/[0.05]"><MiniNavbar /></div>

      <div className="mx-auto max-w-5xl px-6 sm:px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/30 mb-4">{t("blogEyebrow")}</p>
          <h1 className="text-4xl font-light tracking-tight text-white sm:text-5xl leading-[1.1]">
            {t("blogTitle")}
          </h1>
          <p className="mt-4 text-sm text-white/40 max-w-md leading-relaxed">{t("blogSubtitle")}</p>
        </motion.div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3].map(i => <div key={i} className="h-64 rounded-2xl bg-white/[0.03] animate-pulse" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-24 text-center">
            <Icon icon="carbon:document" className="mx-auto text-white/10 mb-4" width={40} />
            <p className="text-sm text-white/30">{t("blogNoPosts")}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <motion.article key={post.id}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group relative flex flex-col rounded-2xl border border-white/[0.07] bg-[#070707] overflow-hidden hover:border-white/[0.14] hover:bg-[#0a0a0a] transition-all duration-300"
              >
                <div className="aspect-[16/9] overflow-hidden bg-[#0c0c0c]">
                  {post.cover_url ? (
                    <img src={post.cover_url} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Icon icon="carbon:document" className="text-white/[0.06]" width={36} />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-base font-semibold text-white/90 line-clamp-2">{post.title}</h2>
                  {post.excerpt && <p className="mt-2 flex-1 text-xs text-white/40 line-clamp-3 leading-relaxed">{post.excerpt}</p>}
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/[0.05] pt-4">
                    <span className="text-[10px] text-white/30">{post.author_name ?? "LBDevz"}</span>
                    {post.published_at && <span className="text-[10px] text-white/20">{new Date(post.published_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}</span>}
                  </div>
                </div>
                <Link href={`/blog/${post.slug}`} className="absolute inset-0" aria-label={post.title} />
              </motion.article>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}