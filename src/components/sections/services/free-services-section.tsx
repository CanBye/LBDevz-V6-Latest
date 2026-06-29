"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { freeServices, siteConfig } from "@/lib/site-content";

interface FreeServicesSectionProps {
  className?: string;
}

export function FreeServicesSection({ className }: FreeServicesSectionProps) {
  return (
    <section
      id="ucretsiz"
      className={cn("relative bg-black border-t border-white/[0.06]", className)}
    >
      <div className="mx-auto max-w-5xl px-6 py-24 sm:px-8 sm:py-32">

        {/* Floating white card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-3xl shadow-2xl shadow-white/[0.04] overflow-hidden"
        >
          <div className="grid lg:grid-cols-[1fr_1.1fr]">

            {/* Sol — başlık + CTA */}
            <div className="flex flex-col justify-between p-8 sm:p-10 border-b border-black/[0.06] lg:border-b-0 lg:border-r">
              <div className="space-y-5">
                <span className="inline-block rounded-full border border-black/[0.08] bg-black/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">
                  No cost
                </span>

                <h2 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl leading-snug">
                  Her ihtiyaca yönelik<br />
                  <span className="text-black/40 font-light">ücretsiz destek.</span>
                </h2>

                <p className="text-sm text-black/45 leading-relaxed max-w-xs">
                  Projeni anlat, sorunu paylaş — danışmanlık, kontrol
                  ve fiyat teklifi bizden. Satın alma baskısı yok.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <div className="grid grid-cols-3 gap-3 border-t border-black/[0.06] pt-6">
                  {[
                    { label: "Danışmanlık", value: "₺0" },
                    { label: "Kontrol", value: "₺0" },
                    { label: "Teklif", value: "₺0" },
                  ].map(item => (
                    <div key={item.label} className="text-center">
                      <p className="font-mono text-base font-bold text-black">{item.value}</p>
                      <p className="text-[9px] uppercase tracking-widest text-black/30 mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>

                <Link
                  href={siteConfig.discordInvite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-black/70 hover:text-black transition-colors"
                >
                  Kataloğa git
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            {/* Sağ — servis listesi */}
            <div className="flex flex-col">
              {/* Mini başlık */}
              <div className="border-b border-black/[0.06] px-6 py-3.5 sm:px-8 flex items-center gap-2">
                <div className="flex gap-1.5">
                  {["bg-red-400", "bg-amber-400", "bg-emerald-400"].map(c => (
                    <span key={c} className={cn("size-2 rounded-full", c)} />
                  ))}
                </div>
                <span className="text-[10px] font-medium text-black/25 ml-1">Ücretsiz Hizmetler</span>
              </div>

              <ul className="flex-1 divide-y divide-black/[0.05]">
                {freeServices.map((service, index) => (
                  <motion.li
                    key={service.title}
                    initial={{ opacity: 0, x: 8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-black/[0.02] sm:px-8"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-black/[0.07] bg-black/[0.03]">
                      <img src={service.icon} alt="" aria-hidden className="size-4 object-contain opacity-50 group-hover:opacity-80 transition-opacity" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black/75">{service.title}</p>
                      <p className="text-[11px] text-black/35 truncate">{service.description}</p>
                    </div>

                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <Check className="size-3 text-emerald-600" strokeWidth={2.5} />
                    </span>
                  </motion.li>
                ))}
              </ul>

              {/* Footer */}
              <div className="border-t border-black/[0.05] bg-black/[0.02] px-6 py-4 sm:px-8">
                <p className="text-[10px] text-black/30 leading-relaxed">
                  Ücretli işler için önce şeffaf teklif veriyoruz — onaylamadan hiçbir şey başlamıyor.
                </p>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}