"use client"

import { useEffect, useRef, useMemo } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface ScrollRevealTextProps {
  children: string
  enableBlur?: boolean
  baseOpacity?: number
  baseRotation?: number
  blurStrength?: number
  containerClassName?: string
  textClassName?: string
  rotationEnd?: string
  wordAnimationEnd?: string
}

export default function ScrollRevealText({
  children,
  enableBlur = true,
  baseOpacity = 0.08,
  baseRotation = 4,
  blurStrength = 6,
  containerClassName = "",
  textClassName = "",
  rotationEnd = "bottom bottom",
  wordAnimationEnd = "bottom bottom",
}: ScrollRevealTextProps) {
  const containerRef = useRef<HTMLHeadingElement>(null)

  const splitText = useMemo(() => {
    return children.split(/(\s+)/).map((word, i) => {
      if (word.match(/^\s+$/)) return word
      return (
        <span className="word inline-block" key={i}>
          {word}
        </span>
      )
    })
  }, [children])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    gsap.fromTo(
      el,
      { transformOrigin: "0% 50%", rotate: baseRotation },
      {
        ease: "none",
        rotate: 0,
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: rotationEnd,
          scrub: true,
        },
      }
    )

    const words = el.querySelectorAll(".word")

    gsap.fromTo(
      words,
      { opacity: baseOpacity, willChange: "opacity" },
      {
        ease: "none",
        opacity: 1,
        stagger: 0.05,
        scrollTrigger: {
          trigger: el,
          start: "top bottom-=15%",
          end: wordAnimationEnd,
          scrub: true,
        },
      }
    )

    if (enableBlur) {
      gsap.fromTo(
        words,
        { filter: `blur(${blurStrength}px)` },
        {
          ease: "none",
          filter: "blur(0px)",
          stagger: 0.05,
          scrollTrigger: {
            trigger: el,
            start: "top bottom-=15%",
            end: wordAnimationEnd,
            scrub: true,
          },
        }
      )
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [enableBlur, baseRotation, baseOpacity, rotationEnd, wordAnimationEnd, blurStrength])

  return (
    <h2 ref={containerRef} className={containerClassName}>
      <p className={`text-[clamp(1.4rem,3vw,2.4rem)] font-semibold leading-relaxed ${textClassName}`}>
        {splitText}
      </p>
    </h2>
  )
}