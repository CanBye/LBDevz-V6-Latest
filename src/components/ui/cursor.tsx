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
    <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0L0 16L4 12H8L13 20L15 19L10 11H15L0 0Z" fill={color} />
      <path d="M1 2.5L13 10.5H9L14.2 19L13 19.5L8 11H3.5L1 13.5V2.5Z" fill="white" fillOpacity="0.25" />
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