"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ServicesShowcase } from "@/components/sections/why/services-showcase";
import { DottedCorner } from "@/components/ui/dotted-corners";
import { assets } from "@/lib/assets";
import { useLanguage } from "@/lib/language-context";

interface WhySectionProps {
  className?: string;
}

export function WhySection({ className }: WhySectionProps) {
  const { t } = useLanguage()
  return (
    <section
      id="neden-biz"
      className={cn("relative bg-black", className)}
    >
      <div className="mx-auto max-w-6xl px-6 py-28 sm:px-8 sm:py-36">
        <div className="grid items-stretch gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          
          {/* Biz Kimiz? */}
          <div className="space-y-8 flex flex-col justify-between">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="border-l border-white/20 pl-4 py-1 flex flex-col gap-1.5"
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-white/80">
                  {t("whoAreWe")}
                </span>
                <span className="text-[9px] font-mono text-white/35 uppercase tracking-widest">
                  {t("whyOverview")}
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl font-light leading-[1.1] tracking-tight text-white sm:text-5xl"
              >
                {t("whyHeadline")}
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-6"
              >
                <p className="text-base leading-relaxed text-white/60 sm:text-lg">
                  {t("whyBody1")}
                </p>
                <p className="text-base leading-relaxed text-white/45">
                  {t("whyBody2")}
                </p>
              </motion.div>
            </div>

            <div className="flex items-center gap-10 border-t border-white/[0.06] pt-6 mt-6 lg:mt-0">
              <div>
                <p className="text-2xl font-bold tracking-tight text-white">
                  2019
                </p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-widest text-white/30">
                  {t("whyFoundYear")}
                </p>
              </div>
              <div className="h-8 w-px bg-white/[0.08]" />
              <div>
                <p className="text-2xl font-bold tracking-tight text-white">
                  %100
                </p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-widest text-white/30">
                  {t("whyOriginalDev")}
                </p>
              </div>
            </div>
          </div>

          {/* Kısa ve Net - Clean & Elegant Simple Design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="relative lg:mt-8 h-full"
          >
            <div className="relative border border-white/[0.08] bg-[#070707] p-8 sm:p-10 rounded-2xl h-full flex flex-col justify-between overflow-hidden">
              <DottedCorner position="top-right" className="right-4 top-4 opacity-30" size={5} />
              
              <div className="space-y-6">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] block">
                  {t("whyShortAndClear")}
                </span>
                
                <h3 className="text-2xl font-light tracking-tight text-white sm:text-3xl leading-snug">
                  {t("whyMission")}
                </h3>
                
                <p className="text-sm leading-relaxed text-white/45">
                  {t("whyCardBody")}
                </p>
              </div>

              {/* Minimal Steps */}
              <div className="mt-10 pt-8 border-t border-white/[0.06] grid grid-cols-1 gap-6 sm:grid-cols-3">
                {[
                  { title: t("whyStep1"), detail: t("whyStep1Detail") },
                  { title: t("whyStep2"), detail: t("whyStep2Detail") },
                  { title: t("whyStep3"), detail: t("whyStep3Detail") },
                ].map((step, idx) => (
                  <div key={step.title} className="space-y-1">
                    <span className="font-mono text-[10px] text-white/20 block">
                      0{idx + 1}
                    </span>
                    <h4 className="text-xs font-semibold text-white/80">
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-white/35">
                      {step.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>

        {/* Services Showcase */}
        <ServicesShowcase className="mt-28 sm:mt-36" />
      </div>
    </section>
  );
}
