"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cards } from "@/data/mock";
import { CardPlaceholder } from "@/components/shared/CardPlaceholder";
import type { PokemonCard } from "@/types";

interface AddCardModalProps {
  type: "wishlist" | "binder";
  existingIds: string[];
  onAdd: (card: PokemonCard) => void;
  onClose: () => void;
}

export function AddCardModal({ type, existingIds, onAdd, onClose }: AddCardModalProps) {
  const available = Object.values(cards).filter((c) => !existingIds.includes(c.id));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg glass-card rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">
              Add to {type === "wishlist" ? "Wishlist" : "Trade Binder"}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>

          {available.length === 0 ? (
            <p className="text-sm text-white/40 text-center py-8">No more cards available to add.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {available.map((card) => (
                <button
                  key={card.id}
                  onClick={() => onAdd(card)}
                  className="active:scale-95 transition-transform text-left"
                >
                  <CardPlaceholder
                    name={card.name}
                    gradient={card.imageGradient}
                    rarity={card.rarity}
                    compact
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
