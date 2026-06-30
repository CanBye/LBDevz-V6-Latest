"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MorphingInfinityProps {
  className?: string;
  size?: number;
  color?: string;
}

// Both paths must have identical command counts for smooth morphing.
// Circle (approximated with 4 cubic beziers) and ∞ (4 cubic beziers):
const PATHS = [
  // Circle
  "M 50,25 C 63.8,25 75,36.2 75,50 C 75,63.8 63.8,75 50,75 C 36.2,75 25,63.8 25,50 C 25,36.2 36.2,25 50,25 Z",
  // Infinity (lemniscate approximation with same number of segments)
  "M 50,50 C 50,35 65,28 75,35 C 85,42 85,58 75,65 C 65,72 50,65 50,50 C 50,35 35,28 25,35 C 15,42 15,58 25,65 C 35,72 50,65 50,50 Z",
  // Back to circle
  "M 50,25 C 63.8,25 75,36.2 75,50 C 75,63.8 63.8,75 50,75 C 36.2,75 25,63.8 25,50 C 25,36.2 36.2,25 50,25 Z",
];

export function MorphingInfinity({ className, size = 48, color = "currentColor" }: MorphingInfinityProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      className={cn(className)}
      aria-hidden="true"
    >
      <motion.path
        d={PATHS[0]}
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        animate={{ d: PATHS }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.5, 1],
        }}
      />
    </svg>
  );
}