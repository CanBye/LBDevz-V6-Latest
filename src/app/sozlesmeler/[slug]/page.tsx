import { notFound } from "next/navigation"
import { LegalPageShell } from "@/components/layout/legal-page-shell"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { ser } from "@/lib/db-util"

export const revalidate = 60

async function getPage(slug: string) {
  try {
    const rows = ser(await db.execute(sql`SELECT slug, title, content, updated_at FROM legal_pages WHERE slug = ${slug} LIMIT 1`))
    return rows[0] ?? null
  } catch { return null }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPage(slug)
  return { title: page?.title ?? "Sözleşme" }
}

export default async function SozlesmelerSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) notFound()

  // Map DB row to LegalPage shape expected by LegalPageShell
  const legalPage = {
    slug: page.slug as string,
    title: page.title as string,
    description: "",
    updatedAt: new Date(page.updated_at as string).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" }),
    sections: [
      {
        title: "",
        paragraphs: (page.content as string).split("\n\n").filter(Boolean),
      }
    ],
  }

  return <LegalPageShell page={legalPage} />
}