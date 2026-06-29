import Link from "next/link";
import { cn } from "@/lib/utils";
import { footerLinks, siteConfig } from "@/lib/site-content";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { StarsBackground } from "@/components/ui/stars-background";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <StarsBackground
      id="iletisim"
      factor={0.04}
      speed={35}
      starColor="#ffffff"
      className={cn("bg-black", className)}
    >
      {/* Text hover effect — bleeds into footer */}
      <div className="relative h-40 w-full overflow-hidden border-t border-white/[0.03] translate-y-8">
        <TextHoverEffect text={siteConfig.name} fontSize={110} />
      </div>
      <div className="mx-auto max-w-6xl border-t border-white/[0.06] px-6 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="text-lg font-bold text-white">
              {siteConfig.name}
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/40">
              {siteConfig.tagline}
            </p>
            <Link
              href={siteConfig.discordInvite}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex text-sm font-medium text-[#5865F2] transition-colors hover:text-[#7289da]"
            >
              Discord&apos;a katıl →
            </Link>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Sayfalar
            </h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.sayfalar.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/45 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Sözleşmeler
            </h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.yasal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/45 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Hizmetler
            </h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.hizmetler.map((item) => (
                <li key={item}>
                  <span className="text-sm text-white/45">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              İletişim
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="text-sm text-white/45 transition-colors hover:text-white"
                >
                  {siteConfig.email}
                </a>
              </li>
              <li>
                <Link
                  href={siteConfig.discordInvite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/45 transition-colors hover:text-white"
                >
                  Discord sunucusu
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Sponsor */}
        <div className="mt-12 flex items-center justify-center gap-2 text-sm text-white/40 flex-wrap">
          <span>Sponsorumuz</span>
          <a
            href="https://hostingtelekom.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
          >
            Hosting Telekom
          </a>
          <span>&apos;a teşekkürler</span>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-sm text-white/40 flex-wrap">
          <span>Developed by</span>
          <a href="https://discord.gg/lbdev" target="_blank" rel="noopener noreferrer"
            className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">CanBye</a>
          <span className="text-white/20">&amp;</span>
          <a href="https://discord.gg/lbdev" target="_blank" rel="noopener noreferrer"
            className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">Swag</a>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
          <p className="text-xs text-white/30">
            © {siteConfig.year} {siteConfig.name}. Tüm hakları saklıdır.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {footerLinks.yasal.slice(1, 4).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-white/25 transition-colors hover:text-white/50"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </StarsBackground>
  );
}
