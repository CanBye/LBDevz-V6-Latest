"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface CursorProps {
  x: number
  y: number
  color?: string
  name?: string
  className?: string
}

function CursorSVG({ color = "#6366f1" }: { color?: string }) {
  return (
    <svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0.857143 0L0 0.857143V16.5714L4.28571 12.2857H8.57143L14.1429 21.4286L16.7143 20L11.1429 10.8571H16.7143L0.857143 0Z"
        fill={color}
      />
      <path
        d="M1.5 1.91421L15.1716 10.8571H10.4853L16.0569 20L14.1429 21L8.57143 11.5714H3.75736L1.5 14.8284V1.91421Z"
        fill="white"
        fillOpacity="0.3"
      />
    </svg>
  )
}

export function Cursor({ x, y, color = "#6366f1", name, className }: CursorProps) {
  return (
    <motion.div
      className={cn("pointer-events-none absolute top-0 left-0 z-50 flex items-start gap-1", className)}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 120, damping: 22 }}
    >
      <CursorSVG color={color} />
      {name && (
        <div
          className="mt-4 ml-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white whitespace-nowrap shadow-lg"
          style={{ backgroundColor: color }}
        >
          {name}
        </div>
      )}
    </motion.div>
  )
}

interface AnimatedCursorProps {
  color?: string
  name?: string
  keyframes: { x: number; y: number }[]
  duration?: number
  delay?: number
  className?: string
}

export function AnimatedCursor({ color = "#6366f1", name, keyframes, duration = 4, delay = 0, className }: AnimatedCursorProps) {
  return (
    <motion.div
      className={cn("pointer-events-none absolute top-0 left-0 z-50 flex items-start gap-1", className)}
      animate={{ x: keyframes.map(k => k.x), y: keyframes.map(k => k.y) }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      }}
    >
      <CursorSVG color={color} />
      {name && (
        <div
          className="mt-4 ml-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white whitespace-nowrap shadow-lg"
          style={{ backgroundColor: color }}
        >
          {name}
        </div>
      )}
    </motion.div>
  )
}