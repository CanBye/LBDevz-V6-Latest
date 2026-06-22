"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AnimatedTextCycleItem {
  label: string;
  icon: string;
}

export interface AnimatedTextCycleProps {
  items: AnimatedTextCycleItem[];
  interval?: number;
  className?: string;
  iconClassName?: string;
}

const containerVariants: Variants = {
  hidden: {
    y: -20,
    opacity: 0,
    filter: "blur(8px)",
  },
  visible: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    y: 20,
    opacity: 0,
    filter: "blur(8px)",
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

function CycleItem({
  item,
  className,
  iconClassName,
}: {
  item: AnimatedTextCycleItem;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 sm:gap-3", className)}>
      <img
        src={item.icon}
        alt=""
        aria-hidden
        className={cn(
          "h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10 md:h-12 md:w-12",
          iconClassName,
        )}
      />
      <span>{item.label}</span>
    </span>
  );
}

export function AnimatedTextCycle({
  items,
  interval = 5000,
  className = "",
  iconClassName,
}: AnimatedTextCycleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [width, setWidth] = useState("auto");
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (measureRef.current) {
      const elements = measureRef.current.children;
      if (elements.length > currentIndex) {
        const newWidth = elements[currentIndex].getBoundingClientRect().width;
        setWidth(`${Math.ceil(newWidth + 4)}px`);
      }
    }
  }, [currentIndex, items]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, interval);
    return () => clearInterval(timer);
  }, [interval, items.length]);

  return (
    <>
      <div
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none absolute opacity-0"
        style={{ visibility: "hidden" }}
      >
        {items.map((item, i) => (
          <CycleItem
            key={i}
            item={item}
            className={cn("font-bold", className)}
            iconClassName={iconClassName}
          />
        ))}
      </div>

      <motion.span
        className="relative inline-block align-bottom"
        animate={{
          width,
          transition: {
            type: "spring",
            stiffness: 150,
            damping: 15,
            mass: 1.2,
          },
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={currentIndex}
            className={cn("inline-block font-bold", className)}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ whiteSpace: "nowrap" }}
          >
            <CycleItem
              item={items[currentIndex]}
              iconClassName={iconClassName}
            />
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </>
  );
}
