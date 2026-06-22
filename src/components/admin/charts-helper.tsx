"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

// Premium Spline Graph for Revenue using SVG paths
export function RevenueSplineChart({ data: propData }: { data?: { label: string; sales: number; volume: number }[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const data = propData && propData.length > 0 ? propData : null

  if (!data) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center gap-3 select-none">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="opacity-20">
          <path d="M4 32 L12 22 L20 26 L28 14 L36 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="36" cy="8" r="3" fill="white" />
        </svg>
        <div className="text-center">
          <p className="text-xs font-semibold text-white/30">No Data Yet</p>
          <p className="text-[10px] text-white/15 mt-0.5">Revenue data will appear here once orders are placed</p>
        </div>
      </div>
    )
  }

  // Pure SVG coordinates converter
  const width = 600
  const height = 180
  const padding = 20

  const getCoordinates = (value: number, max: number, idx: number) => {
    const x = padding + (idx / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - (value / max) * (height - padding * 2)
    return { x, y }
  }

  const maxVal = 600

  // Generate cubic bezier paths for smooth curves
  const getSplinePath = (key: "sales" | "volume") => {
    let path = ""
    data.forEach((item, idx) => {
      const { x, y } = getCoordinates(item[key], maxVal, idx)
      if (idx === 0) {
        path += `M ${x} ${y}`
      } else {
        const prev = getCoordinates(data[idx - 1][key], maxVal, idx - 1)
        const cp1x = prev.x + (x - prev.x) / 3
        const cp1y = prev.y
        const cp2x = prev.x + (2 * (x - prev.x)) / 3
        const cp2y = y
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`
      }
    })
    return path
  }

  const salesPath = getSplinePath("sales")
  const volumePath = getSplinePath("volume")

  return (
    <div className="relative w-full h-full flex flex-col justify-between">
      {/* Interactive Tooltip HUD */}
      <div className="absolute top-2 left-6 h-8 flex items-center gap-4 text-xs select-none">
        {hoveredIndex !== null ? (
          <div className="flex items-center gap-3 animate-fade-in">
            <span className="font-mono text-white/40">{data[hoveredIndex].label}:</span>
            <span className="font-semibold text-indigo-400">₺{data[hoveredIndex].sales * 10} Sales</span>
            <span className="font-semibold text-emerald-400">{data[hoveredIndex].volume} tx</span>
          </div>
        ) : (
          <span className="text-white/20 font-mono italic">Hover nodes for exact metrics</span>
        )}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible select-none mt-2">
        <defs>
          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding + ratio * (height - padding * 2)
          return (
            <line
              key={ratio}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="white"
              strokeOpacity="0.03"
              strokeWidth="1"
            />
          )}
        )}

        {/* Fill Under Volume */}
        <path
          d={`${volumePath} L ${getCoordinates(data[data.length - 1].volume, maxVal, data.length - 1).x} ${height - padding} L ${getCoordinates(data[0].volume, maxVal, 0).x} ${height - padding} Z`}
          fill="url(#volumeGrad)"
        />

        {/* Fill Under Sales */}
        <path
          d={`${salesPath} L ${getCoordinates(data[data.length - 1].sales, maxVal, data.length - 1).x} ${height - padding} L ${getCoordinates(data[0].sales, maxVal, 0).x} ${height - padding} Z`}
          fill="url(#salesGrad)"
        />

        {/* Volume Stroke */}
        <path
          d={volumePath}
          fill="none"
          stroke="#10b981"
          strokeWidth="1.5"
          strokeOpacity="0.65"
        />

        {/* Sales Stroke */}
        <path
          d={salesPath}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Interactive node hover triggers */}
        {data.map((item, idx) => {
          const c = getCoordinates(item.sales, maxVal, idx)
          const isHovered = hoveredIndex === idx
          return (
            <g key={idx}>
              {/* Invisible trigger bar */}
              <rect
                x={c.x - 15}
                y={0}
                width={30}
                height={height}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setCollapsedAndHovered(idx)}
                onMouseLeave={() => setCollapsedAndHovered(null)}
              />
              {/* Hover Indicator Vertical Line */}
              {isHovered && (
                <line
                  x1={c.x}
                  y1={padding}
                  x2={c.x}
                  y2={height - padding}
                  stroke="white"
                  strokeOpacity="0.08"
                  strokeDasharray="2 2"
                  strokeWidth="1"
                />
              )}
              {/* Node Circle */}
              <circle
                cx={c.x}
                cy={c.y}
                r={isHovered ? 5 : 3}
                fill={isHovered ? "#6366f1" : "white"}
                stroke={isHovered ? "white" : "#6366f1"}
                strokeWidth={isHovered ? 2 : 1}
                className="transition-all duration-150 pointer-events-none"
              />
            </g>
          )
        })}
      </svg>
    </div>
  )

  function setCollapsedAndHovered(idx: number | null) {
    setHoveredIndex(idx)
  }
}

// Live Server Load Bar/Spline Monitor
export function ServerLoadChart() {
  const [load, setLoad] = useState<number[]>([44, 38, 45, 52, 48, 62, 59, 54, 49, 58, 62, 70, 68, 62, 58, 64, 72, 78, 82, 74])

  // Simple interval to simulate real-time metrics jumping around
  useEffect(() => {
    const timer = setInterval(() => {
      setLoad((prev) => {
        const next = [...prev.slice(1)]
        const last = prev[prev.length - 1]
        const delta = Math.floor(Math.random() * 21) - 10 // -10% to +10%
        const newVal = Math.min(Math.max(last + delta, 25), 94)
        next.push(newVal)
        return next
      })
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const width = 300
  const height = 140
  const padding = 15

  const maxVal = 100

  const getCoordinates = (val: number, idx: number) => {
    const x = padding + (idx / (load.length - 1)) * (width - padding * 2)
    const y = height - padding - (val / maxVal) * (height - padding * 2)
    return { x, y }
  }

  let splinePath = ""
  load.forEach((val, idx) => {
    const { x, y } = getCoordinates(val, idx)
    if (idx === 0) {
      splinePath += `M ${x} ${y}`
    } else {
      const prev = getCoordinates(load[idx - 1], idx - 1)
      const cp1x = prev.x + (x - prev.x) / 2
      const cp1y = prev.y
      const cp2x = prev.x + (x - prev.x) / 2
      const cp2y = y
      splinePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`
    }
  })

  const currentLoad = load[load.length - 1]

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="flex items-baseline justify-between select-none">
        <span className="text-[10px] font-bold text-white/30 tracking-wider">REALTIME CPU LOAD</span>
        <span className="text-xl font-bold font-mono tracking-tight text-white">{currentLoad}%</span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible select-none mt-2">
        <defs>
          <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Glow Line */}
        <path
          d={splinePath}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2"
          strokeOpacity="0.8"
          strokeLinecap="round"
        />

        <path
          d={`${splinePath} L ${getCoordinates(load[load.length - 1], load.length - 1).x} ${height - padding} L ${getCoordinates(load[0], 0).x} ${height - padding} Z`}
          fill="url(#loadGrad)"
        />

        {/* Dynamic pulsing endpoint */}
        {load.length > 0 && (
          <g>
            <circle
              cx={getCoordinates(currentLoad, load.length - 1).x}
              cy={getCoordinates(currentLoad, load.length - 1).y}
              r="6"
              fill="#6366f1"
              className="animate-ping"
              opacity="0.4"
            />
            <circle
              cx={getCoordinates(currentLoad, load.length - 1).x}
              cy={getCoordinates(currentLoad, load.length - 1).y}
              r="3"
              fill="white"
            />
          </g>
        )}
      </svg>
    </div>
  )
}

// Small, beautiful sparkline for IO activity indicator
export function ActivitySparkline() {
  const points = [12, 16, 14, 25, 18, 22, 28, 20, 24, 16, 22, 35, 20, 30]

  const width = 100
  const height = 30
  const max = 40

  let path = ""
  points.forEach((val, idx) => {
    const x = (idx / (points.length - 1)) * width
    const y = height - (val / max) * height
    if (idx === 0) {
      path += `M ${x} ${y}`
    } else {
      path += ` L ${x} ${y}`
    }
  })

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
      <path
        d={path}
        fill="none"
        stroke="#10b981"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
