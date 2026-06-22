import { cn } from "@/lib/utils";

/** Hero dark glass dropdown panel */
export const dropdownPanel = cn(
  "rounded-xl border border-white/10",
  "bg-black/75 text-white shadow-2xl backdrop-blur-xl"
);

export const dropdownLabel = "px-2 py-1.5 text-xs font-semibold text-white/50";

export const dropdownSeparator = "bg-white/10";

export const dropdownItem = cn(
  "rounded-md text-white/85 cursor-pointer",
  "focus:bg-white/10 focus:text-white",
  "hover:bg-white/10 hover:text-white"
);

export const dropdownLink = cn(
  "block select-none rounded-lg p-3 leading-none no-underline outline-none transition-colors",
  "text-white/90 hover:bg-white/10 hover:text-white focus:bg-white/10"
);

export const dropdownDesc = "line-clamp-2 text-sm leading-snug text-white/50";

export const dropdownIcon = "text-white/50";

export const dropdownBadge = "border-white/10 bg-white/15 text-white text-xs";
