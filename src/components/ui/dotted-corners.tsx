import { cn } from "@/lib/utils";

type CornerPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface DottedCornerProps {
  position: CornerPosition;
  className?: string;
  size?: number;
}

function isCornerDot(row: number, col: number, size: number, position: CornerPosition) {
  switch (position) {
    case "top-left":
      return row === 0 || col === 0;
    case "top-right":
      return row === 0 || col === size - 1;
    case "bottom-left":
      return row === size - 1 || col === 0;
    case "bottom-right":
      return row === size - 1 || col === size - 1;
  }
}

export function DottedCorner({ position, className, size = 9 }: DottedCornerProps) {
  const dots = Array.from({ length: size * size }, (_, index) => {
    const row = Math.floor(index / size);
    const col = index % size;
    return isCornerDot(row, col, size, position);
  });

  return (
    <div
      className={cn(
        "pointer-events-none absolute grid gap-[4px]",
        position === "top-left" && "left-0 top-0",
        position === "top-right" && "right-0 top-0",
        position === "bottom-left" && "bottom-0 left-0",
        position === "bottom-right" && "right-0 bottom-0",
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${size}, 5px)` }}
      aria-hidden="true"
    >
      {dots.map((visible, index) => (
        <span
          key={index}
          className={cn("size-[5px]", visible ? "bg-white/30" : "bg-transparent")}
        />
      ))}
    </div>
  );
}

export function DottedCorners({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden="true">
      <DottedCorner position="top-left" />
      <DottedCorner position="top-right" />
      <DottedCorner position="bottom-left" />
      <DottedCorner position="bottom-right" />
    </div>
  );
}
