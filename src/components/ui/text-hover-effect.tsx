"use client"

import React, { useRef, useState, useEffect } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"

export const TextHoverEffect = ({
  text,
  duration,
  fontSize = 56,
}: {
  text: string
  duration?: number
  fontSize?: number
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const maskGradientRef = useRef(null)
  const animatedTextRef = useRef(null)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" })

  useGSAP(
    () => {
      gsap.fromTo(
        animatedTextRef.current,
        { strokeDashoffset: 1000, strokeDasharray: 1000 },
        { strokeDashoffset: 0, strokeDasharray: 1000, duration: 4, ease: "power2.inOut" }
      )
    },
    { scope: svgRef }
  )

  const updateCursorPosition = (x: number, y: number) => {
    if (svgRef.current && x !== null && y !== null) {
      const svgRect = svgRef.current.getBoundingClientRect()
      const cxPercentage = ((x - svgRect.left) / svgRect.width) * 100
      const cyPercentage = ((y - svgRect.top) / svgRect.height) * 100
      const newPosition = { cx: `${cxPercentage}%`, cy: `${cyPercentage}%` }
      setMaskPosition(newPosition)
      gsap.to(maskGradientRef.current, { attr: newPosition, duration: duration ?? 0, ease: "power2.out" })
    }
  }

  useEffect(() => { updateCursorPosition(cursor.x, cursor.y) }, [cursor, duration])

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      onTouchStart={(e) => { e.preventDefault(); setHovered(true); if (e.touches[0]) setCursor({ x: e.touches[0].clientX, y: e.touches[0].clientY }) }}
      onTouchMove={(e) => { e.preventDefault(); if (e.touches[0]) setCursor({ x: e.touches[0].clientX, y: e.touches[0].clientY }) }}
      onTouchEnd={(e) => { e.preventDefault(); setHovered(false) }}
      onTouchCancel={(e) => { e.preventDefault(); setHovered(false) }}
      className="select-none"
    >
      <defs>
        <linearGradient id="textGradient" gradientUnits="userSpaceOnUse" cx="50%" cy="50%" r="20%">
          {hovered && (
            <>
              <stop offset="0%"   stopColor="#eab308" />
              <stop offset="25%"  stopColor="#ef4444" />
              <stop offset="50%"  stopColor="#3b82f6" />
              <stop offset="75%"  stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </>
          )}
        </linearGradient>
        <radialGradient
          id="revealMask"
          ref={maskGradientRef}
          gradientUnits="userSpaceOnUse"
          r="25%"
          cx={maskPosition.cx}
          cy={maskPosition.cy}
        >
          <stop offset="0%"   stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>
        <mask id="textMask">
          <rect x="0" y="0" width="100%" height="100%" fill="url(#revealMask)" />
        </mask>
      </defs>

      {[0, 1, 2].map((_, idx) => (
        <text
          key={idx}
          ref={idx === 1 ? animatedTextRef : undefined}
          x="50%"
          y="65%"
          textAnchor="middle"
          dominantBaseline="middle"
          strokeWidth={idx === 1 ? "1" : "0.5"}
          className="fill-transparent font-[helvetica] font-bold"
          stroke={idx === 2 ? "url(#textGradient)" : "rgba(255,255,255,0.3)"}
          mask={idx === 2 ? "url(#textMask)" : undefined}
          style={{ fontSize, opacity: idx === 0 && !hovered ? 0 : idx === 0 ? 0.5 : 1 }}
        >
          {text}
        </text>
      ))}
    </svg>
  )
}