"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Icon } from "@iconify/react"

interface Post {
  id: string; title: string; slug: string; excerpt: string | null
  cover_url: string | null; published_at: string | null
  author_name: string | null; author_image: string | null
}

function PostCard({ post, index }: { post: Post; index: number }) {
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
    : null

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col rounded-2xl border border-white/[0.07] bg-[#070707] overflow-hidden transition-all duration-300 hover:border-white/[0.14] hover:bg-[#0a0a0a]"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-[#0c0c0c]">
        {post.cover_url ? (
          <img src={post.cover_url} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Icon icon="carbon:document" className="text-white/[0.06]" width={40} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold text-white/90 line-clamp-2 group-hover:text-white transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 flex-1 text-xs leading-relaxed text-white/40 line-clamp-3">{post.excerpt}</p>
        )}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/[0.05] pt-4">
          <div className="flex items-center gap-2">
            {post.author_image ? (
              <img src={post.author_image} alt="" className="h-5 w-5 rounded-full object-cover" />
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.06] text-[8px] font-bold text-white/40">
                {(post.author_name ?? "?").charAt(0)}
              </div>
            )}
            <span className="text-[10px] text-white/30">{post.author_name ?? "LBDevz"}</span>
          </div>
          {date && <span className="text-[10px] text-white/20">{date}</span>}
        </div>
      </div>

      <Link href={`/blog/${post.slug}`} className="absolute inset-0" aria-label={post.title} />
    </motion.article>
  )
}

export function BlogSection() {
  const DEMO_POSTS: Post[] = [
    { id: "1", title: "Minecraft Sunucunuzu Nasıl Büyütürsünüz?", slug: "#", excerpt: "Sunucu büyütmek için izlemeniz gereken temel adımlar ve stratejiler.", cover_url: null, published_at: new Date().toISOString(), author_name: "LBDev", author_image: null },
    { id: "2", title: "En İyi Discord Bot Özellikleri 2025", slug: "#", excerpt: "Topluluğunuzu canlandıracak Discord bot özellikleri ve ipuçları.", cover_url: null, published_at: new Date().toISOString(), author_name: "LBDev", author_image: null },
    { id: "3", title: "Web Sitesi Tasarımında Yeni Trendler", slug: "#", excerpt: "Modern web tasarımında öne çıkan trendler ve kullanıcı deneyimi ipuçları.", cover_url: null, published_at: new Date().toISOString(), author_name: "LBDev", author_image: null },
  ]
  const [posts, setPosts] = useState<Post[]>(DEMO_POSTS)

  useEffect(() => {
    fetch("/api/site/blog").then(r => r.json()).then(d => { if (Array.isArray(d) && d.length > 0) setPosts(d.slice(0, 3)) }).catch(() => {})
  }, [])

  if (posts.length === 0) return null

  return (
    <section id="duyurular" className="relative border-t border-white/[0.06] bg-black">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:px-8 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-14 flex items-end justify-between gap-4 flex-wrap"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/30 mb-4">DUYURULAR</p>
            <h2 className="text-3xl font-light tracking-tight text-white sm:text-4xl leading-[1.1]">
              Son haberler &<br />
              <span className="font-semibold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                duyurular
              </span>
            </h2>
          </div>
          <Link href="/blog"
            className="flex items-center gap-2 rounded-full border border-white/[0.09] px-4 py-2 text-xs font-semibold text-white/40 hover:text-white hover:border-white/20 transition-all">
            Tümü
            <Icon icon="carbon:arrow-right" width={13} />
          </Link>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => <PostCard key={p.id} post={p} index={i} />)}
        </div>
      </div>
    </section>
  )
}