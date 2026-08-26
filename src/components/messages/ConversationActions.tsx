"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Archive, BellOff, Trash2, MoreVertical, type LucideIcon } from "lucide-react";

interface ConversationActionsProps {
  onDelete: () => void;
  onArchive: () => void;
  onMute: () => void;
}

export function ConversationActions({ onDelete, onArchive, onMute }: ConversationActionsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-xl glass flex items-center justify-center"
      >
        <MoreVertical size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 top-10 z-50 glass-card rounded-xl py-1 min-w-[180px] shadow-xl"
            >
              <ActionItem icon={Archive} label="Archive" onClick={() => { onArchive(); setOpen(false); }} />
              <ActionItem icon={BellOff} label="Mute" onClick={() => { onMute(); setOpen(false); }} />
              <ActionItem icon={Trash2} label="Delete" onClick={() => { onDelete(); setOpen(false); }} danger />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${
        danger ? "text-pokeball" : "text-white/80"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}
