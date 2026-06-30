"use client"

import React, { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface FireworkConfig {
  population?: number
  color?: string | string[]
  fireworkSpeed?: number | { min: number; max: number }
  fireworkSize?: number | { min: number; max: number }
  particleSpeed?: number | { min: number; max: number }
  particleSize?: number | { min: number; max: number }
  canvasProps?: React.ComponentProps<"canvas">
}

type FireworksBackgroundProps = FireworkConfig & React.ComponentProps<"div">

function rand(val: number | { min: number; max: number }): number {
  if (typeof val === "number") return val
  return Math.random() * (val.max - val.min) + val.min
}

function pickColor(color?: string | string[]): string {
  if (!color) {
    const hue = Math.floor(Math.random() * 360)
    return `hsl(${hue},100%,70%)`
  }
  if (typeof color === "string") return color
  return color[Math.floor(Math.random() * color.length)]
}

interface Particle { x: number; y: number; vx: number; vy: number; alpha: number; color: string; size: number }
interface Firework { x: number; y: number; tx: number; ty: number; vx: number; vy: number; color: string; size: number; exploded: boolean; particles: Particle[] }

export function FireworksBackground({
  population = 1,
  color,
  fireworkSpeed = { min: 4, max: 8 },
  fireworkSize = { min: 2, max: 5 },
  particleSpeed = { min: 2, max: 7 },
  particleSize = { min: 1, max: 5 },
  canvasProps,
  className,
  children,
  ...props
}: FireworksBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fireworks = useRef<Firework[]>([])
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    function launch() {
      if (!canvas) return
      const c = pickColor(color)
      const tx = Math.random() * canvas.width
      const ty = Math.random() * canvas.height * 0.5
      const dx = tx - canvas.width / 2
      const dy = ty - canvas.height
      const dist = Math.sqrt(dx * dx + dy * dy)
      const speed = rand(fireworkSpeed)
      fireworks.current.push({
        x: canvas.width / 2, y: canvas.height,
        tx, ty,
        vx: (dx / dist) * speed,
        vy: (dy / dist) * speed,
        color: c,
        size: rand(fireworkSize),
        exploded: false,
        particles: [],
      })
    }

    function explode(fw: Firework) {
      const count = 60 + Math.floor(Math.random() * 40)
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count
        const speed = rand(particleSpeed)
        fw.particles.push({
          x: fw.x, y: fw.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: fw.color,
          size: rand(particleSize),
        })
      }
      fw.exploded = true
    }

    // launch initial fireworks
    for (let i = 0; i < population; i++) {
      setTimeout(() => launch(), i * (1200 / population))
    }
    const launchInterval = setInterval(() => {
      for (let i = 0; i < population; i++) launch()
    }, 1800)

    function draw() {
      if (!canvas || !ctx) return
      ctx.fillStyle = "rgba(0,0,0,0.15)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      fireworks.current = fireworks.current.filter(fw => {
        if (!fw.exploded) {
          fw.x += fw.vx; fw.y += fw.vy
          ctx.beginPath()
          ctx.arc(fw.x, fw.y, fw.size, 0, Math.PI * 2)
          ctx.fillStyle = fw.color
          ctx.fill()
          const dx = fw.tx - fw.x, dy = fw.ty - fw.y
          if (Math.sqrt(dx*dx + dy*dy) < 6) explode(fw)
          return true
        }
        fw.particles = fw.particles.filter(p => {
          p.x += p.vx; p.y += p.vy
          p.vy += 0.06
          p.vx *= 0.98
          p.alpha -= 0.018
          if (p.alpha <= 0) return false
          ctx.globalAlpha = p.alpha
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.fill()
          ctx.globalAlpha = 1
          return true
        })
        return fw.particles.length > 0
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener("resize", resize)
      clearInterval(launchInterval)
      cancelAnimationFrame(rafRef.current)
    }
  }, [population, color, fireworkSpeed, fireworkSize, particleSpeed, particleSize])

  return (
    <div className={cn("relative overflow-hidden", className)} {...props}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" {...canvasProps} />
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  )
}