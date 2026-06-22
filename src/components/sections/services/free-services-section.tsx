"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DottedCorner } from "@/components/ui/dotted-corners";
import { freeServices, siteConfig } from "@/lib/site-content";

interface FreeServicesSectionProps {
  className?: string;
}

export function FreeServicesSection({ className }: FreeServicesSectionProps) {
  return (
    <section
      id="ucretsiz"
      className={cn("relative border-t border-white/[0.06] bg-black", className)}
    >
      <div className="mx-auto max-w-6xl px-6 py-24 sm:px-8 sm:py-32">
        <div className="grid items-start gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">

          {/* Sol — başlık ve CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="lg:sticky lg:top-28"
          >
            <div className="border-l border-white/20 pl-4 py-1 flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-white/80">
                Ücretsiz Hizmetler
              </span>
              <span className="text-[9px] font-mono text-white/35 uppercase tracking-widest">
                LBDEV // NO COST
              </span>
            </div>

            <h2 className="mt-6 text-3xl font-light leading-[1.15] tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
              Önce bir{" "}
              <span className="font-semibold text-white">konuşalım</span>
              <span className="text-white/40">.</span>
            </h2>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/45 sm:text-base">
              Projeni anlat, sorunu paylaş — danışmanlık, kontrol ve fiyat
              teklifi bizden. Satın alma baskısı yok.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href={siteConfig.discordInvite}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-11 items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.03] px-6 text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-white/[0.06]"
              >
                Discord&apos;a yaz
                <ArrowUpRight className="size-4 text-white/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/80" />
              </Link>
              <span className="text-xs text-white/25">
                Hesap açmana gerek yok
              </span>
            </div>

            <div className="mt-12 hidden border-t border-white/[0.06] pt-8 lg:block">
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: "Danışmanlık", value: "₺0" },
                  { label: "Plugin kontrolü", value: "₺0" },
                  { label: "Fiyat teklifi", value: "₺0" },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="font-mono text-lg font-semibold tracking-tight text-white">
                      {item.value}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-widest text-white/30">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Sağ — liste paneli */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#070707]">
              <DottedCorner position="top-right" className="right-4 top-4 opacity-30" size={5} />
              <DottedCorner position="bottom-left" className="bottom-4 left-4 opacity-20" size={5} />

              <div className="border-b border-white/[0.06] px-6 py-4 sm:px-8">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/35">
                  Neler ücretsiz?
                </span>
              </div>

              <ul className="divide-y divide-white/[0.06]">
                {freeServices.map((service, index) => (
                  <motion.li
                    key={service.title}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                    className="group relative flex gap-5 px-6 py-6 transition-colors hover:bg-white/[0.02] sm:gap-6 sm:px-8 sm:py-7"
                  >
                    <span
                      className="absolute left-0 top-0 h-full w-px scale-y-0 bg-white/30 transition-transform duration-300 group-hover:scale-y-100"
                      aria-hidden
                    />

                    <span className="shrink-0 font-mono text-[11px] text-white/20 pt-0.5">
                      0{index + 1}
                    </span>

                    <div className="flex min-w-0 flex-1 items-start gap-4 sm:gap-5">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.02] transition-colors group-hover:border-white/[0.12]">
                        <img
                          src={service.icon}
                          alt=""
                          aria-hidden
                          className="size-5 object-contain opacity-60 transition-opacity group-hover:opacity-90"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold tracking-tight text-white sm:text-base">
                          {service.title}
                        </h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-white/40 sm:text-sm">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>

              <div className="border-t border-white/[0.06] px-6 py-5 sm:px-8">
                <p className="text-[11px] leading-relaxed text-white/30">
                  Ücretli işler için önce şeffaf teklif veriyoruz — onaylamadan
                  hiçbir şey başlamıyor.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
