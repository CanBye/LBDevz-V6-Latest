"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon, UserGroupIcon, HierarchyIcon, UserIcon, RotateLeftIcon,
  Settings02Icon, CpuIcon, CodeIcon, Chart01Icon, FlashIcon,
  Link01Icon, SmartPhone01Icon, CloudIcon, DatabaseIcon, LockIcon,
} from "@hugeicons/core-free-icons";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { cn } from "@/lib/utils";

const TAG_ROWS = [
  [
    { id: "kesfet",     icon: Search01Icon,    label: "Keşif & Analiz" },
    { id: "musteri",    icon: UserGroupIcon,   label: "Müşteri Görüşmesi" },
    { id: "tasarim",    icon: HierarchyIcon,   label: "Sistem Tasarımı" },
    { id: "gelistirme", icon: UserIcon,        label: "Geliştirme" },
    { id: "destek",     icon: RotateLeftIcon,  label: "Sonrası Destek" },
  ],
  [
    { id: "qa",        icon: Settings02Icon, label: "QA & Optimizasyon" },
    { id: "deploy",    icon: CpuIcon,        label: "Yayınlama" },
    { id: "fullstack", icon: CodeIcon,       label: "Full-Stack" },
    { id: "analitik",  icon: Chart01Icon,    label: "Analitik" },
    { id: "mvp",       icon: FlashIcon,      label: "MVP Mühendisliği" },
  ],
  [
    { id: "api",      icon: Link01Icon,      label: "API & Backend" },
    { id: "mobil",    icon: SmartPhone01Icon, label: "Mobil Uygulama" },
    { id: "bulut",    icon: CloudIcon,       label: "Bulut Altyapı" },
    { id: "veritab",  icon: DatabaseIcon,    label: "Veritabanı" },
    { id: "guvenlik", icon: LockIcon,        label: "Güvenlik" },
  ],
];

const LENS_SIZE = 92;

const MagnifyingLens = ({ size = 92 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M365.424 335.392L342.24 312.192L311.68 342.736L334.88 365.936L365.424 335.392Z" fill="#B0BDC6" />
    <path d="M358.08 342.736L334.88 319.552L319.04 335.392L342.24 358.584L358.08 342.736Z" fill="#DFE9EF" />
    <path d="M352.368 321.808L342.752 312.192L312.208 342.752L321.824 352.36L352.368 321.808Z" fill="#B0BDC6" />
    <path d="M332 332C260 404 142.4 404 69.6001 332C-2.3999 260 -2.3999 142.4 69.6001 69.6C141.6 -3.20003 259.2 -2.40002 332 69.6C404.8 142.4 404.8 260 332 332ZM315.2 87.2C252 24 150.4 24 88.0001 87.2C24.8001 150.4 24.8001 252 88.0001 314.4C151.2 377.6 252.8 377.6 315.2 314.4C377.6 252 377.6 150.4 315.2 87.2Z" fill="#DFE9EF" />
    <path d="M319.2 319.2C254.4 384 148.8 384 83.2001 319.2C18.4001 254.4 18.4001 148.8 83.2001 83.2C148 18.4 253.6 18.4 319.2 83.2C384 148.8 384 254.4 319.2 319.2ZM310.4 92C250.4 32 152 32 92.0001 92C32.0001 152 32.0001 250.4 92.0001 310.4C152 370.4 250.4 370.4 310.4 310.4C370.4 250.4 370.4 152 310.4 92Z" fill="#7A858C" />
    <path d="M484.104 428.784L373.8 318.472L318.36 373.912L428.672 484.216L484.104 428.784Z" fill="#333333" />
    <path d="M471.664 441.224L361.344 330.928L330.8 361.48L441.12 471.76L471.664 441.224Z" fill="#575B5E" />
    <path d="M495.2 423.2C504 432 432.8 504 423.2 495.2L417.6 489.6C408.8 480.8 480 408.8 489.6 417.6L495.2 423.2Z" fill="#B0BDC6" />
    <path d="M483.2 435.2C492 444 444.8 492 435.2 483.2L429.6 477.6C420.8 468.8 468 420.8 477.6 429.6L483.2 435.2Z" fill="#DFE9EF" />
  </svg>
);

export function MagnifiedBento({ className }: { className?: string }) {
  // max-w-[380px] ile sabitlenmiş card genişliği
  const containerRef = React.useRef<HTMLDivElement>(null);
  const lensX = useMotionValue(0);
  const lensY = useMotionValue(0);
  const clipPath = useMotionTemplate`circle(30px at calc(50% + ${lensX}px - 10px) calc(50% + ${lensY}px - 10px))`;
  const inverseMask = useMotionTemplate`radial-gradient(circle 30px at calc(50% + ${lensX}px - 10px) calc(50% + ${lensY}px - 10px), transparent 100%, black 100%)`;

  return (
    <div className={cn("flex items-start justify-start w-full", className)}>
      <div className="group relative w-full max-w-[360px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#070707] p-1.5">
        <div
          ref={containerRef}
          className="relative w-full h-[220px] overflow-hidden rounded-xl bg-[#0a0a0a]"
        >
          <div className="relative h-full w-full flex flex-col items-center justify-center">
            {/* base layer */}
            <motion.div
              style={{ WebkitMaskImage: inverseMask, maskImage: inverseMask }}
              className="flex flex-col gap-3 w-full h-full justify-center"
            >
              {TAG_ROWS.map((row, rowIndex) => (
                <motion.div
                  key={`row-${rowIndex}`}
                  className="flex gap-3 w-max"
                  animate={{ x: rowIndex % 2 === 0 ? ["0%", "-33.333%"] : ["-33.333%", "0%"] }}
                  transition={{ duration: 25, ease: "linear", repeat: Infinity }}
                >
                  {[...row, ...row, ...row].map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      className="flex gap-2 bg-white/[0.03] backdrop-blur-sm whitespace-nowrap w-fit text-white/40 p-2 px-3 items-center border border-white/[0.06] rounded-full text-xs"
                    >
                      <HugeiconsIcon icon={item.icon} size={13} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </motion.div>
              ))}
            </motion.div>

            {/* reveal layer */}
            <motion.div
              className="absolute inset-0 flex flex-col gap-3 justify-center pointer-events-none select-none z-10"
              style={{ clipPath }}
            >
              {TAG_ROWS.map((row, rowIndex) => (
                <motion.div
                  key={`row-reveal-${rowIndex}`}
                  className="flex gap-3 w-max"
                  animate={{ x: rowIndex % 2 === 0 ? ["0%", "-33.333%"] : ["-33.333%", "0%"] }}
                  transition={{ duration: 25, ease: "linear", repeat: Infinity }}
                >
                  {[...row, ...row, ...row].map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}-reveal`}
                      className="flex gap-2 bg-white/[0.08] whitespace-nowrap w-fit text-white p-2 px-3 items-center border border-white/20 shadow-sm rounded-full text-xs scale-125 ml-6"
                    >
                      <HugeiconsIcon icon={item.icon} size={13} className="text-white" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                  ))}
                </motion.div>
              ))}
            </motion.div>

            {/* lens */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 cursor-grab active:cursor-grabbing drop-shadow-xl"
              drag
              dragMomentum={false}
              dragConstraints={containerRef}
              style={{ x: lensX, y: lensY }}
            >
              <div className="relative">
                <MagnifyingLens size={LENS_SIZE} />
                <div className="absolute top-[6px] left-[6px] w-[60px] h-[60px] rounded-full bg-white/5 pointer-events-none" />
              </div>
            </motion.div>

            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/5 bg-gradient-to-r from-[#0a0a0a] to-transparent z-20" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/5 bg-gradient-to-l from-[#0a0a0a] to-transparent z-20" />
          </div>
        </div>

        <div className="px-5 py-4">
          <h3 className="text-sm font-semibold text-white/80">Akıllı İş Akışları</h3>
          <p className="mt-1 text-xs leading-relaxed text-white/35">
            Ekibimizin geniş yetenek yelpazesini ve proje aşamalarını bağlamsal farkındalıkla keşfet.
          </p>
        </div>
      </div>
    </div>
  );
}