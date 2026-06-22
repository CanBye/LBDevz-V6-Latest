"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { assets } from "@/lib/assets";

interface IntroSplashProps {
  onBurstStart: () => void;
  onComplete: () => void;
}

export function IntroSplash({ onBurstStart, onComplete }: IntroSplashProps) {
  const [exiting, setExiting] = useState(false);

  // Lock scroll while splash is visible
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setExiting(true);
      onBurstStart();
    }, 2800);

    return () => window.clearTimeout(timer);
  }, [onBurstStart]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.85, ease: "easeInOut" }}
      onAnimationComplete={() => {
        if (exiting) onComplete();
      }}
    >
      <motion.p
        initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="inline-flex items-center gap-1.5 text-2xl font-medium tracking-tight text-white sm:gap-2 sm:text-3xl"
      >
        <span>Doğru yere geldin</span>
        <motion.span
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.35, ease: "backOut" }}
          className="inline-flex shrink-0 items-center"
        >
          <Image
            src={assets.icons.face}
            alt=""
            width={32}
            height={32}
            priority
            className="inline-block h-[1.15em] w-[1.15em] object-contain"
          />
        </motion.span>
      </motion.p>
    </motion.div>
  );
}
