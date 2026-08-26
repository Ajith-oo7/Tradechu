import { cn, getRarityColor } from "@/lib/utils";

interface RarityBadgeProps {
  rarity: string;
  className?: string;
}

export function RarityBadge({ rarity, className }: RarityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide",
        getRarityColor(rarity),
        className
      )}
    >
      {rarity}
    </span>
  );
}
