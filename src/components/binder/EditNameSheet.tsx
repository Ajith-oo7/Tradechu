"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface EditNameSheetProps {
  currentName: string;
  onSave: (name: string) => void;
  onClose: () => void;
}

export function EditNameSheet({ currentName, onSave, onClose }: EditNameSheetProps) {
  const [name, setName] = useState(currentName);

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
          className="w-full max-w-[430px] mx-auto glass-card rounded-t-3xl p-6 pb-safe"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Edit Card Name</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <X size={16} />
            </button>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3.5 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-pikachu/50 mb-4"
          />
          <button
            onClick={() => { onSave(name.trim()); onClose(); }}
            className="w-full py-4 rounded-2xl bg-pikachu text-slate-deep font-bold active:scale-98"
          >
            Save
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
