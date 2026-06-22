"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { assets } from "@/lib/assets";
import { discordHighlights, siteConfig } from "@/lib/site-content";

interface DiscordSectionProps {
  className?: string;
}

export function DiscordSection({ className }: DiscordSectionProps) {
  return (
    <section
      id="discord"
      className={cn("relative border-t border-white/[0.06] bg-black", className)}
    >
      <div className="mx-auto max-w-4xl px-6 py-28 sm:px-8 sm:py-36">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="relative overflow-hidden border border-[#5865F2]/30 bg-[#5865F2]/[0.06] px-6 py-12 sm:px-10 sm:py-14"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[#5865F2]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-[#5865F2]/10 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="flex size-16 items-center justify-center border border-[#5865F2]/40 bg-[#5865F2]/15">
              <img
                src={assets.icons.discordBot}
                alt=""
                aria-hidden
                className="size-10 object-contain"
              />
            </div>

            <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.35em] text-[#5865F2]/80">
              Topluluğa katıl
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Discord&apos;dayız
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/50 sm:text-base">
              Projeni anlat, soru sor, güncellemeleri takip et — hepsi Discord&apos;da.
            </p>

            <ul className="mt-8 flex flex-col gap-3 text-left sm:items-center">
              {discordHighlights.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-white/60">
                  <Check className="size-4 shrink-0 text-[#5865F2]" strokeWidth={2.5} />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href={siteConfig.discordInvite}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-10 inline-flex h-12 items-center gap-2 rounded-full bg-[#5865F2] px-8 text-sm font-semibold text-white transition-colors hover:bg-[#4752c4]"
            >
              Discord&apos;a katıl
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
