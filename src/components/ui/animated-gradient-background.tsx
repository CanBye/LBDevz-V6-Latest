"use client"

export function AnimatedGradientBackground({ className = "" }: { className?: string }) {
  return (
    <div className={`animated-gradient-root ${className}`} aria-hidden="true">
      <div className="ag-blob ag-blob-1" />
      <div className="ag-blob ag-blob-2" />
      <div className="ag-blob ag-blob-3" />
      <div className="ag-blob ag-blob-4" />
      <div className="ag-blob ag-blob-5" />
      <div className="ag-noise" />
    </div>
  )
}