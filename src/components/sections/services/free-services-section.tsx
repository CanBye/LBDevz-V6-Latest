"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
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
      <div className="mx-auto max-w-6xl px-6 py-24 sm:px-8 sm:py-32">

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/25">
            Ücretsiz Hizmetler
          </p>
        </motion.div>

        {/* Floating white card — full width of max-w-6xl */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-3xl overflow-hidden"
          style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.06)" }}
        >
          <div className="grid lg:grid-cols-[420px_1fr]">

            {/* Sol */}
            <div className="flex flex-col justify-between p-10 border-b border-black/[0.05] lg:border-b-0 lg:border-r">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.07] bg-black/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-black/35">
                  No Cost
                </span>

                <div className="space-y-2">
                  <h2 className="text-[2rem] font-semibold tracking-tight text-black leading-[1.15]">
                    Her ihtiyaca yönelik
                  </h2>
                  <h2 className="text-[2rem] font-light tracking-tight text-black/35 leading-[1.15]">
                    yazılım ve tasarım.
                  </h2>
                </div>

                <p className="text-sm text-black/45 leading-relaxed max-w-[280px]">
                  Tam website projelerinden oyun scriptlerine, Discord botlarından
                  UI temalarına kadar kataloğumuzu hep yanında taşıyoruz.
                </p>
              </div>

              <div className="mt-10 space-y-6 pt-8 border-t border-black/[0.06]">
                <div className="flex items-center gap-8">
                  {[
                    { label: "Danışmanlık", value: "₺0" },
                    { label: "Kontrol", value: "₺0" },
                    { label: "Teklif", value: "₺0" },
                  ].map(item => (
                    <div key={item.label}>
                      <p className="font-mono text-lg font-bold text-black">{item.value}</p>
                      <p className="text-[9px] uppercase tracking-widest text-black/30 mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>

                <Link
                  href={siteConfig.discordInvite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 text-sm font-semibold text-black hover:text-black/60 transition-colors"
                >
                  Kataloğa git
                  <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            {/* Sağ */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 border-b border-black/[0.05] px-8 py-4">
                <div className="flex gap-1.5">
                  {["bg-red-400", "bg-amber-400", "bg-emerald-400"].map(c => (
                    <span key={c} className={cn("size-2.5 rounded-full", c)} />
                  ))}
                </div>
                <span className="text-[10px] font-medium text-black/25 ml-1.5">Ücretsiz Hizmetler</span>
              </div>

              <ul className="flex-1 divide-y divide-black/[0.05]">
                {freeServices.map((service, index) => (
                  <motion.li
                    key={service.title}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.06 }}
                    className="group flex items-center gap-4 px-8 py-5 transition-colors hover:bg-black/[0.02]"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-black/[0.07] bg-black/[0.03]">
                      <img src={service.icon} alt="" aria-hidden className="size-4 object-contain opacity-45 group-hover:opacity-75 transition-opacity" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-black/75">{service.title}</p>
                      <p className="text-xs text-black/35 mt-0.5 leading-relaxed">{service.description}</p>
                    </div>

                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200/60">
                      <Check className="size-3 text-emerald-500" strokeWidth={2.5} />
                    </div>
                  </motion.li>
                ))}
              </ul>

              <div className="border-t border-black/[0.05] bg-black/[0.015] px-8 py-4">
                <p className="text-[11px] text-black/30 leading-relaxed">
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