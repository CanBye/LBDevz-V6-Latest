"use client"

import { useEffect, useState } from "react"

function generateStarBoxShadow(count: number): string {
  const shadows: string[] = []
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 2000)
    const y = Math.floor(Math.random() * 2000)
    shadows.push(`${x}px ${y}px #FFF`)
  }
  return shadows.join(", ")
}

export function CosmicParallaxBg({ className = "" }: { className?: string }) {
  const [smallStars, setSmallStars] = useState("")
  const [mediumStars, setMediumStars] = useState("")
  const [bigStars, setBigStars] = useState("")

  useEffect(() => {
    setSmallStars(generateStarBoxShadow(700))
    setMediumStars(generateStarBoxShadow(200))
    setBigStars(generateStarBoxShadow(100))
  }, [])

  return (
    <div className={`cosmic-parallax-root ${className}`} aria-hidden="true">
      <div className="cosmic-stars-s" style={{ boxShadow: smallStars }} />
      <div className="cosmic-stars-s-after" style={{ boxShadow: smallStars }} />
      <div className="cosmic-stars-m" style={{ boxShadow: mediumStars }} />
      <div className="cosmic-stars-m-after" style={{ boxShadow: mediumStars }} />
      <div className="cosmic-stars-l" style={{ boxShadow: bigStars }} />
      <div className="cosmic-stars-l-after" style={{ boxShadow: bigStars }} />
      <div className="cosmic-horizon">
        <div className="cosmic-glow" />
      </div>
      <div className="cosmic-earth" />
    </div>
  )
}