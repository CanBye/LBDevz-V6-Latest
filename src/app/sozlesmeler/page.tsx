import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { LegalIndexShell } from "@/components/layout/legal-page-shell";
import { legalPages } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "Sözleşmeler",
  description:
    "LBDev gizlilik politikası, kullanım şartları, mesafeli satış sözleşmesi ve KVKK aydınlatma metinleri.",
};

export default function SozlesmelerPage() {
  return (
    <LegalIndexShell>
      <div className="max-w-2xl space-y-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-white/35">
          Yasal
        </p>
        <h1 className="text-3xl font-light tracking-tight text-white sm:text-4xl">
          Sözleşmeler
        </h1>
        <p className="text-sm leading-relaxed text-white/45">
          Hizmetlerimizi kullanırken geçerli olan yasal metinler. Sorularınız
          için her zaman bizimle iletişime geçebilirsiniz.
        </p>
      </div>

      <ul className="mt-12 divide-y divide-white/[0.06] border-y border-white/[0.06]">
        {legalPages.map((page) => (
          <li key={page.slug}>
            <Link
              href={`/sozlesmeler/${page.slug}`}
              className="group flex items-center justify-between gap-6 py-6 transition-colors"
            >
              <div className="min-w-0 space-y-1">
                <p className="text-base font-medium text-white transition-colors group-hover:text-white/90">
                  {page.title}
                </p>
                <p className="text-sm text-white/40">{page.description}</p>
              </div>
              <ChevronRight className="size-5 shrink-0 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-white/50" />
            </Link>
          </li>
        ))}
      </ul>
    </LegalIndexShell>
  );
}
