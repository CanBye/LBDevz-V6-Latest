"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { freeServices, siteConfig } from "@/lib/site-content";

interface FreeServicesSectionProps {
  className?: string;
}

export function FreeServicesSection({ className }: FreeServicesSectionProps) {
  return (
    <section
      id="ucretsiz"
      className={cn("relative bg-[#f5f5f7]", className)}
    >
      <div className="mx-auto max-w-6xl px-6 py-24 sm:px-8 sm:py-32">

        {/* Başlık */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center space-y-3"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-black/30">
            LBDEV // NO COST
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
            Neler ücretsiz?
          </h2>
          <p className="text-sm text-black/45 max-w-md mx-auto leading-relaxed">
            Projeni anlat, sorunu paylaş — danışmanlık, kontrol ve fiyat
            teklifi bizden. Satın alma baskısı yok.
          </p>
        </motion.div>

        {/* Beyaz card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-2xl shadow-xl shadow-black/[0.08] overflow-hidden border border-black/[0.06]"
        >
          {/* Card header */}
          <div className="border-b border-black/[0.06] px-6 py-4 sm:px-8 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/30">
              Ücretsiz Hizmetler
            </span>
            <div className="flex items-center gap-1.5">
              {["bg-red-400", "bg-amber-400", "bg-emerald-400"].map(c => (
                <span key={c} className={cn("size-2.5 rounded-full", c)} />
              ))}
            </div>
          </div>

          {/* Servis listesi */}
          <ul className="divide-y divide-black/[0.05]">
            {freeServices.map((service, index) => (
              <motion.li
                key={service.title}
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="group flex gap-5 px-6 py-5 transition-colors hover:bg-black/[0.02] sm:gap-6 sm:px-8"
              >
                <span className="shrink-0 font-mono text-[11px] text-black/20 pt-0.5">
                  0{index + 1}
                </span>

                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-black/[0.07] bg-black/[0.03]">
                    <img
                      src={service.icon}
                      alt=""
                      aria-hidden
                      className="size-4 object-contain opacity-50 transition-opacity group-hover:opacity-80"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold tracking-tight text-black/80 sm:text-base">
                      {service.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-black/40 sm:text-sm">
                      {service.description}
                    </p>
                  </div>

                  <span className="shrink-0 self-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                    ₺0
                  </span>
                </div>
              </motion.li>
            ))}
          </ul>

          {/* Card footer */}
          <div className="border-t border-black/[0.05] bg-black/[0.02] px-6 py-5 sm:px-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] leading-relaxed text-black/35 max-w-sm">
              Ücretli işler için önce şeffaf teklif veriyoruz — onaylamadan hiçbir şey başlamıyor.
            </p>
            <Link
              href={siteConfig.discordInvite}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-9 items-center gap-1.5 rounded-full bg-black px-5 text-xs font-semibold text-white transition-all hover:bg-black/80 shrink-0"
            >
              Discord&apos;a yaz
              <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.div>

        {/* Alt istatistikler */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8 grid grid-cols-3 gap-4 sm:gap-8 text-center"
        >
          {[
            { label: "Danışmanlık", value: "₺0" },
            { label: "Plugin kontrolü", value: "₺0" },
            { label: "Fiyat teklifi", value: "₺0" },
          ].map(item => (
            <div key={item.label}>
              <p className="font-mono text-xl font-bold tracking-tight text-black/80">{item.value}</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-black/35">{item.label}</p>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}