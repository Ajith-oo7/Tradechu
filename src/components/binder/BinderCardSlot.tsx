"use client";

import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { conditionLabel } from "@/lib/conditions";
import type { PokemonCard } from "@/types";

interface BinderCardSlotProps {
  card: PokemonCard;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  index?: number;
  readOnly?: boolean;
}

export function BinderCardSlot({ card, onEdit, onDelete, onView, index = 0, readOnly }: BinderCardSlotProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04 }}
      className="binder-slot group"
    >
      <div
        className={cn(
          "binder-pocket aspect-[3/4] rounded-lg overflow-hidden relative",
          onView && "cursor-pointer active:scale-[0.97] transition-transform"
        )}
        onClick={onView}
        role={onView ? "button" : undefined}
        aria-label={onView ? `View ${card.name}` : undefined}
      >
        {card.apiImageUrl || card.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.apiImageUrl || card.photoUrl}
            alt={card.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className={cn("absolute inset-0 bg-gradient-to-br", card.imageGradient)} />
        )}
        {!card.apiImageUrl && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/10" />
        )}
        {!readOnly && (
        <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-active:opacity-100 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
            className="w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center active:scale-90"
            aria-label="Edit"
          >
            <Pencil size={14} className="text-white" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
            className="w-8 h-8 rounded-full bg-pokeball/80 backdrop-blur flex items-center justify-center active:scale-90"
            aria-label="Delete"
          >
            <Trash2 size={14} className="text-white" />
          </button>
        </div>
        )}
      </div>
      <p className="mt-2 text-[11px] sm:text-xs font-semibold text-center leading-tight line-clamp-2 px-0.5">
        {card.name}
      </p>
      {card.setName && (
        <p className="mt-0.5 text-[9px] text-white/35 text-center leading-tight line-clamp-1 px-0.5">
          {card.setName}
        </p>
      )}
      {card.condition && (
        <p className="mt-0.5 text-[9px] text-pikachu/70 text-center font-semibold">
          {conditionLabel(card.condition)}
        </p>
      )}
    </motion.div>
  );
}
