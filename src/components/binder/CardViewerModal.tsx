"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { conditionLabel } from "@/lib/conditions";
import type { PokemonCard } from "@/types";

interface CardViewerModalProps {
  card: PokemonCard;
  onClose: () => void;
}

export function CardViewerModal({ card, onClose }: CardViewerModalProps) {
  const imageUrl = card.apiImageUrl || card.photoUrl;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center px-6"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          style={{ top: "max(env(safe-area-inset-top, 0px), 16px)" }}
          className="absolute right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <motion.div
          initial={{ scale: 0.7, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 260 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[320px]"
        >
          <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/15 relative">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={card.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br flex items-center justify-center p-6",
                  card.imageGradient
                )}
              >
                <p className="text-2xl font-bold text-center text-white drop-shadow-lg">
                  {card.name}
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 text-center space-y-1.5">
            <p className="text-xl font-bold leading-tight">{card.name}</p>
            {(card.setName || card.cardNumber) && (
              <p className="text-sm text-white/50">
                {card.setName}
                {card.cardNumber ? ` · #${card.cardNumber}` : ""}
              </p>
            )}
            <span className="inline-block text-[11px] font-bold uppercase tracking-wide bg-pikachu/15 text-pikachu px-3 py-1 rounded-full">
              {card.rarity}
            </span>
            {card.condition && (
              <span className="inline-block text-[11px] font-bold uppercase tracking-wide bg-white/10 text-white/70 px-3 py-1 rounded-full ml-2">
                {conditionLabel(card.condition)}
              </span>
            )}
            {card.note && (
              <p className="text-xs text-white/45 mt-2 max-w-xs mx-auto leading-relaxed">
                “{card.note}”
              </p>
            )}
          </div>
        </motion.div>

        <p className="absolute bottom-8 text-[11px] text-white/30">Tap anywhere to close</p>
      </motion.div>
    </AnimatePresence>
  );
}
