import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/layout/footer";
import { siteConfig } from "@/lib/site-content";
import type { LegalPage } from "@/lib/legal-content";

interface LegalPageShellProps {
  page: LegalPage;
}

export function LegalPageShell({ page }: LegalPageShellProps) {
  return (
    <div className="relative min-h-dvh bg-black text-white">
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-8">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-white transition-colors hover:text-white/80"
          >
            {siteConfig.name}
          </Link>
          <Link
            href="/sozlesmeler"
            className="inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Sözleşmeler
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16 sm:px-8 sm:py-20">
        <div className="space-y-4 border-b border-white/[0.06] pb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-white/35">
            Yasal
          </p>
          <h1 className="text-3xl font-light tracking-tight text-white sm:text-4xl">
            {page.title}
          </h1>
          <p className="text-sm leading-relaxed text-white/45">{page.description}</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/25">
            Son güncelleme: {page.updatedAt}
          </p>
        </div>

        <article className="mt-12 space-y-10">
          {page.sections.map((section) => (
            <section key={section.title} className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight text-white">
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-sm leading-relaxed text-white/50"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              {section.list && (
                <ul className="space-y-2 border-l border-white/[0.08] pl-4">
                  {section.list.map((item) => (
                    <li
                      key={item}
                      className="text-sm leading-relaxed text-white/45"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </article>

        <div className="mt-16 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
          <p className="text-sm text-white/50">
            Sorularınız için{" "}
            <a
              href={`mailto:${siteConfig.email}`}
              className="text-white/80 underline-offset-4 hover:underline"
            >
              {siteConfig.email}
            </a>{" "}
            adresinden veya{" "}
            <Link
              href={siteConfig.discordInvite}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5865F2] underline-offset-4 hover:underline"
            >
              Discord
            </Link>{" "}
            üzerinden bize ulaşabilirsiniz.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

interface LegalIndexShellProps {
  className?: string;
  children: React.ReactNode;
}

export function LegalIndexShell({ className, children }: LegalIndexShellProps) {
  return (
    <div className={cn("relative min-h-dvh bg-black text-white", className)}>
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-8">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-white transition-colors hover:text-white/80"
          >
            {siteConfig.name}
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Ana Sayfa
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-20">{children}</main>

      <Footer />
    </div>
  );
}
