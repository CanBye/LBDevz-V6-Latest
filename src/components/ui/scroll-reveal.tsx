"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ReactNode } from "react"

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  distance?: number
  duration?: number
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 32,
  duration = 0.7,
}: ScrollRevealProps) {
  const reduced = useReducedMotion()

  const offsets = {
    up:    { y: reduced ? 0 : distance, x: 0 },
    down:  { y: reduced ? 0 : -distance, x: 0 },
    left:  { x: reduced ? 0 : distance, y: 0 },
    right: { x: reduced ? 0 : -distance, y: 0 },
    none:  { x: 0, y: 0 },
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offsets[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  )
}