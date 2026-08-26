"use client";

import { Pencil, Trash2 } from "lucide-react";
import { CardPlaceholder } from "@/components/shared/CardPlaceholder";
import type { PokemonCard } from "@/types";

interface CardListItemProps {
  card: PokemonCard;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CardListItem({ card, onEdit, onDelete }: CardListItemProps) {
  return (
    <div className="glass-card rounded-xl p-3 flex items-center gap-3">
      <div className="w-14 shrink-0">
        <CardPlaceholder
          name={card.name}
          gradient={card.imageGradient}
          rarity={card.rarity}
          compact
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{card.name}</p>
        <p className="text-xs text-white/40">{card.rarity}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {onEdit && (
          <button
            onClick={onEdit}
            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center active:scale-95 transition-transform"
            aria-label={`Edit ${card.name}`}
          >
            <Pencil size={14} className="text-white/60" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-lg bg-pokeball/10 flex items-center justify-center active:scale-95 transition-transform"
            aria-label={`Delete ${card.name}`}
          >
            <Trash2 size={14} className="text-pokeball" />
          </button>
        )}
      </div>
    </div>
  );
}
