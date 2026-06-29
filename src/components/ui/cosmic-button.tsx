"use client"

import type { ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"

export type CosmicButtonProps<E extends "a" | "button" = "a"> = {
  as?: E
} & ComponentPropsWithoutRef<E>

export function CosmicButton<E extends "a" | "button" = "a">({
  as,
  className,
  children,
  ...props
}: CosmicButtonProps<E>) {
  const Element = as ?? "a"
  const isAnchor = Element === "a"

  const baseClassName = cn(
    "group/cosmic relative inline-flex min-h-11 min-w-11 items-center justify-center gap-3 rounded-[15px] p-[3px] transition-transform",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a855f7] focus-visible:ring-offset-2 focus-visible:ring-offset-black",
    className
  )

  const content = (
    <>
      {/* Animated cosmic border */}
      <span className="absolute inset-0 overflow-hidden rounded-[15px] transition-all duration-300 ease-out group-hover/cosmic:inset-[-3px]">
        <span className="absolute inset-[-200%] animate-cosmic-spin bg-[conic-gradient(from_0deg,#7c3aed,#a855f7,#d8b4fe,#6d28d9,#4c1d95,#7c3aed,#a855f7)] opacity-95" />
      </span>

      {/* Texture overlay */}
      <span className="absolute inset-0 overflow-hidden rounded-[15px] opacity-50 mix-blend-overlay transition-all duration-300 ease-out group-hover/cosmic:inset-[-3px]">
        <span className="absolute inset-[-200%] animate-cosmic-spin-slow bg-[conic-gradient(from_180deg,#e9d5ff_0%,transparent_30%,#a855f7_50%,transparent_70%,#7c3aed_100%)]" />
      </span>

      {/* Inner */}
      <span className="relative z-10 flex items-center gap-3 rounded-[12px] bg-black px-6 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.5),0_1px_1px_rgba(0,0,0,0.45),0_10px_28px_rgba(120,50,200,0.25)] transition-all duration-300 group-hover/cosmic:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(0,0,0,0.6),0_2px_6px_rgba(0,0,0,0.55),0_14px_34px_rgba(120,50,200,0.4)] active:scale-[0.98]">
        <span className="font-medium text-sm tracking-wide text-white">
          {children ?? "Hadi konuşalım"}
        </span>
      </span>
    </>
  )

  if (isAnchor) {
    const { href, rel, target, ...rest } = props as ComponentPropsWithoutRef<"a">
    return (
      <a className={baseClassName} href={href ?? "#iletisim"} rel={rel} target={target} {...rest}>
        {content}
      </a>
    )
  }

  return (
    <button className={baseClassName} {...(props as ComponentPropsWithoutRef<"button">)}>
      {content}
    </button>
  )
}