"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { CARD_CONDITIONS } from "@/lib/conditions";
import type { CardCondition, PokemonCard } from "@/types";
import { cn } from "@/lib/utils";

export interface CardEditPatch {
  name: string;
  condition?: CardCondition;
  note?: string;
}

interface EditCardSheetProps {
  card: PokemonCard;
  onSave: (patch: CardEditPatch) => void;
  onClose: () => void;
}

export function EditCardSheet({ card, onSave, onClose }: EditCardSheetProps) {
  const [name, setName] = useState(card.name);
  const [condition, setCondition] = useState<CardCondition | undefined>(card.condition ?? "NM");
  const [note, setNote] = useState(card.note ?? "");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-black/60 flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[430px] mx-auto glass-card rounded-t-3xl p-6 pb-safe max-h-[90dvh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Edit Card</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wide">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3.5 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-pikachu/50 mt-1.5 mb-4"
          />

          <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wide">
            Condition
          </label>
          <div className="grid grid-cols-3 gap-2 mt-1.5 mb-4">
            {CARD_CONDITIONS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCondition(c.value)}
                className={cn(
                  "rounded-xl px-2 py-2.5 text-[11px] font-bold leading-tight border transition-colors",
                  condition === c.value
                    ? "bg-pikachu/20 border-pikachu/50 text-pikachu"
                    : "bg-white/5 border-white/10 text-white/60"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>

          <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wide">
            Note <span className="normal-case font-normal">(optional)</span>
          </label>
          <textarea
            value={note}
            maxLength={120}
            onChange={(e) => setNote(e.target.value.slice(0, 120))}
            placeholder="e.g. small crease bottom left"
            rows={2}
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pikachu/50 mt-1.5 mb-1 resize-none"
          />
          <p className="text-[10px] text-white/30 text-right mb-4">{note.length}/120</p>

          <button
            onClick={() =>
              onSave({
                name: name.trim(),
                condition,
                note: note.trim() || undefined,
              })
            }
            className="w-full py-4 rounded-2xl bg-pikachu text-slate-deep font-bold active:scale-98"
          >
            Save
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
