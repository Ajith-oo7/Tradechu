"use client";

import { motion } from "framer-motion";
import { Plus, Heart, BookOpen } from "lucide-react";
import { CardListItem } from "./CardListItem";
import type { PokemonCard } from "@/types";

interface CollectionSectionProps {
  title: string;
  icon: "wishlist" | "binder";
  cards: PokemonCard[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  onEdit: (card: PokemonCard) => void;
  emptyMessage: string;
}

export function CollectionSection({
  title,
  icon,
  cards,
  onAdd,
  onDelete,
  onEdit,
  emptyMessage,
}: CollectionSectionProps) {
  const Icon = icon === "wishlist" ? Heart : BookOpen;
  const iconColor = icon === "wishlist" ? "text-pokeball" : "text-pikachu";
  const iconBg = icon === "wishlist" ? "bg-pokeball/20" : "bg-pikachu/20";

  return (
    <section className="relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
            <Icon size={16} className={iconColor} />
          </div>
          <h2 className="text-base font-bold">{title}</h2>
          <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
            {cards.length}
          </span>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <Icon size={32} className={`mx-auto mb-3 ${iconColor} opacity-40`} />
          <p className="text-sm text-white/40">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <CardListItem
                card={card}
                onEdit={() => onEdit(card)}
                onDelete={() => onDelete(card.id)}
              />
            </motion.div>
          ))}
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onAdd}
        className={`fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center ${
          icon === "wishlist"
            ? "bg-pokeball shadow-pokeball/30"
            : "bg-pikachu shadow-pikachu/30"
        }`}
        style={{ display: "none" }}
        aria-hidden
      />
    </section>
  );
}

export function FloatingAddButton({
  onClick,
  variant,
}: {
  onClick: () => void;
  variant: "wishlist" | "binder";
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm mt-3 ${
        variant === "wishlist"
          ? "bg-pokeball/15 text-red-300 border border-pokeball/20"
          : "bg-pikachu/15 text-pikachu border border-pikachu/20"
      }`}
    >
      <Plus size={16} />
      Add Card
    </motion.button>
  );
}
