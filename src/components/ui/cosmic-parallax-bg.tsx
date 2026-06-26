"use client"

import { useEffect, useState } from "react"

function generateShadow(count: number): string {
  const s: string[] = []
  for (let i = 0; i < count; i++) {
    s.push(`${Math.floor(Math.random() * 2000)}px ${Math.floor(Math.random() * 2000)}px #FFF`)
  }
  return s.join(", ")
}

export function CosmicParallaxBg({ className = "" }: { className?: string }) {
  const [s, setS] = useState("")
  const [m, setM] = useState("")
  const [l, setL] = useState("")

  useEffect(() => {
    setS(generateShadow(700))
    setM(generateShadow(200))
    setL(generateShadow(100))
  }, [])

  return (
    <div className={`cosmic-root ${className}`} aria-hidden="true">
      <div id="cosmic-stars"  style={{ boxShadow: s }} />
      <div id="cosmic-stars2" style={{ boxShadow: m }} />
      <div id="cosmic-stars3" style={{ boxShadow: l }} />
      <div id="cosmic-horizon">
        <div className="cosmic-glow" />
      </div>
      <div id="cosmic-earth" />
    </div>
  )
}