import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { RarityBadge } from "./RarityBadge";

interface CardPlaceholderProps {
  name: string;
  gradient: string;
  rarity?: string;
  quantity?: number;
  selected?: boolean;
  availableForTrade?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export function CardPlaceholder({
  name,
  gradient,
  rarity,
  quantity,
  selected,
  availableForTrade,
  onClick,
  compact,
}: CardPlaceholderProps) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      className={cn(
        "group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-200",
        onClick && "active:scale-[0.97] cursor-pointer",
        selected && "ring-2 ring-pikachu ring-offset-2 ring-offset-slate-deep",
        compact ? "gap-1.5" : "gap-2"
      )}
    >
      <div
        className={cn(
          "relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg",
          `bg-gradient-to-br ${gradient}`
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="text-white/30 w-8 h-8" />
        </div>
        {quantity !== undefined && quantity > 1 && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            x{quantity}
          </div>
        )}
        {availableForTrade && (
          <div className="absolute top-2 left-2 bg-green-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            TRADE
          </div>
        )}
        {selected && (
          <div className="absolute inset-0 bg-pikachu/20 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-pikachu flex items-center justify-center">
              <span className="text-slate-deep text-lg font-bold">✓</span>
            </div>
          </div>
        )}
      </div>
      <div className={cn("px-0.5", compact && "px-0")}>
        <p className={cn("font-semibold text-white leading-tight", compact ? "text-xs" : "text-sm")}>
          {name}
        </p>
        {rarity && <RarityBadge rarity={rarity} className="mt-1" />}
      </div>
    </Wrapper>
  );
}
