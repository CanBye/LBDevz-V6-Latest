"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { MiniNavbar } from "@/components/layout/mini-navbar"
import { Footer } from "@/components/layout/footer"
import { useLanguage } from "@/lib/language-context"
import DOMPurify from "isomorphic-dompurify"

interface Post { id: string; title: string; slug: string; excerpt: string | null; content: string | null; cover_url: string | null; published_at: string | null; author_name: string | null; author_image: string | null }

export default function BlogPostPage() {
  const { slug }    = useParams() as { slug: string }
  const router      = useRouter()
  const { t }       = useLanguage()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/site/blog/${slug}`)
      .then(r => r.json())
      .then(d => { if (d.error) router.push("/blog"); else setPost(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div className="min-h-screen bg-black">
      <div className="relative h-24 border-b border-white/[0.05]"><MiniNavbar /></div>
      <div className="mx-auto max-w-3xl px-6 py-16 space-y-6 animate-pulse">
        <div className="h-72 rounded-2xl bg-white/[0.03]" />
        <div className="h-8 w-2/3 rounded-xl bg-white/[0.04]" />
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-4 rounded bg-white/[0.03]" />)}</div>
      </div>
    </div>
  )

  if (!post) return null

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative h-24 border-b border-white/[0.05]"><MiniNavbar /></div>

      {/* Cover */}
      {post.cover_url && (
        <div className="relative h-[320px] sm:h-[420px] overflow-hidden">
          <img src={post.cover_url} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
      )}

      <div className="mx-auto max-w-3xl px-6 sm:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[11px] text-white/30 mb-8">
          <Link href="/blog" className="hover:text-white/60 transition-colors">{t("blogBreadcrumb")}</Link>
          <span>/</span>
          <span className="text-white/60 truncate max-w-[200px]">{post.title}</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">{post.title}</h1>

          {/* Meta */}
          <div className="mt-4 flex items-center gap-3 text-sm text-white/35">
            {post.author_image && <img src={post.author_image} alt="" className="h-6 w-6 rounded-full object-cover" />}
            <span>{post.author_name ?? "LBDevz"}</span>
            {post.published_at && (
              <>
                <span className="text-white/20">·</span>
                <span>{new Date(post.published_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</span>
              </>
            )}
          </div>

          {post.excerpt && (
            <p className="mt-6 text-base leading-relaxed text-white/50 border-l-2 border-white/10 pl-4 italic">{post.excerpt}</p>
          )}

          {/* Content */}
          {post.content && (
            <div className="mt-8 rich-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content, { USE_PROFILES: { html: true } }) }} />
          )}
        </motion.div>

        <div className="mt-16 border-t border-white/[0.06] pt-8">
          <Link href="/blog" className="flex items-center gap-2 text-sm text-white/35 hover:text-white/70 transition-colors">
            {t("blogBackAll")}
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}