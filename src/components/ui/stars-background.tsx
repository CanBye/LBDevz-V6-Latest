"use client"

import React, { useEffect, useRef, useCallback } from "react"
import { useSpring } from "framer-motion"

interface Star {
  x: number; y: number; size: number; speed: number; opacity: number
}

interface StarsBackgroundProps extends React.ComponentProps<"div"> {
  factor?: number
  speed?: number
  starColor?: string
  pointerEvents?: boolean
}

export function StarsBackground({
  factor = 0.05,
  speed = 50,
  starColor = "#fff",
  pointerEvents = true,
  className,
  style,
  ...props
}: StarsBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const mouseX = useSpring(0, { stiffness: 50, damping: 20 })
  const mouseY = useSpring(0, { stiffness: 50, damping: 20 })
  const rafRef = useRef<number>(0)

  const initStars = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const count = Math.floor((canvas.width * canvas.height) * factor / 1000)
    starsRef.current = Array.from({ length: Math.max(count, 60) }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.8 + 0.2,
      speed: Math.random() * speed * 0.002 + 0.02,
      opacity: Math.random() * 0.7 + 0.3,
    }))
  }, [factor, speed])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const mx = mouseX.get()
    const my = mouseY.get()

    starsRef.current.forEach(star => {
      star.y -= star.speed
      if (star.y < 0) { star.y = canvas.height; star.x = Math.random() * canvas.width }

      const dx = (star.x / canvas.width - 0.5) * mx * 0.012
      const dy = (star.y / canvas.height - 0.5) * my * 0.012

      ctx.beginPath()
      ctx.arc(star.x + dx, star.y + dy, star.size, 0, Math.PI * 2)
      ctx.fillStyle = starColor
      ctx.globalAlpha = star.opacity
      ctx.fill()
    })
    ctx.globalAlpha = 1
    rafRef.current = requestAnimationFrame(draw)
  }, [mouseX, mouseY, starColor])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      initStars()
    })
    ro.observe(canvas)
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    initStars()
    rafRef.current = requestAnimationFrame(draw)
    return () => { ro.disconnect(); cancelAnimationFrame(rafRef.current) }
  }, [initStars, draw])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }, [mouseX, mouseY])

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0); mouseY.set(0)
  }, [mouseX, mouseY])

  return (
    <div
      className={`relative overflow-hidden ${className ?? ""}`}
      style={style}
      onMouseMove={pointerEvents ? handleMouseMove : undefined}
      onMouseLeave={pointerEvents ? handleMouseLeave : undefined}
      {...props}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="relative z-10 h-full w-full">
        {props.children}
      </div>
    </div>
  )
}