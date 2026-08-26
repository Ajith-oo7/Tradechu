"use client";

import { motion } from "framer-motion";
import { Camera, Search } from "lucide-react";
import { BinderCardSlot } from "./BinderCardSlot";
import type { PokemonCard } from "@/types";

interface BinderGridProps {
  cards: PokemonCard[];
  onSearch: () => void;
  onScan: () => void;
  onEdit: (card: PokemonCard) => void;
  onDelete: (id: string) => void;
  onView: (card: PokemonCard) => void;
}

export function BinderGrid({ cards, onSearch, onScan, onEdit, onDelete, onView }: BinderGridProps) {
  return (
    <div className="binder-grid grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4">
      {cards.map((card, i) => (
        <BinderCardSlot
          key={card.id}
          card={card}
          index={i}
          onView={() => onView(card)}
          onEdit={() => onEdit(card)}
          onDelete={() => onDelete(card.id)}
        />
      ))}

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onSearch}
        className="binder-slot binder-add-slot aspect-[3/4] rounded-lg flex flex-col items-center justify-center gap-2 border-2 border-dashed border-pikachu/30 bg-pikachu/5 active:bg-pikachu/10 transition-colors"
      >
        <div className="w-12 h-12 rounded-full bg-pikachu/20 flex items-center justify-center">
          <Search size={22} className="text-pikachu" />
        </div>
        <span className="text-xs font-bold text-pikachu text-center px-2">Search a Card</span>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onScan}
        className="binder-slot binder-add-slot aspect-[3/4] rounded-lg flex flex-col items-center justify-center gap-2 border-2 border-dashed border-pokeball/30 bg-pokeball/5 active:bg-pokeball/10 transition-colors"
      >
        <div className="w-12 h-12 rounded-full bg-pokeball/20 flex items-center justify-center">
          <Camera size={22} className="text-pokeball" />
        </div>
        <span className="text-xs font-bold text-pokeball text-center px-2">Scan a Card</span>
      </motion.button>
    </div>
  );
}
