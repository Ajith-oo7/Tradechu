"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { HomeTab } from "@/types";

const tabs: { id: HomeTab; label: string }[] = [
  { id: "wishlist", label: "My Wishlist" },
  { id: "binder", label: "My Trade Binder" },
  { id: "opportunities", label: "Trade Opportunities" },
];

interface SegmentedTabsProps {
  active: HomeTab;
  onChange: (tab: HomeTab) => void;
}

export function SegmentedTabs({ active, onChange }: SegmentedTabsProps) {
  return (
    <div className="binder-segmented p-1 rounded-xl flex gap-1 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex-1 min-w-0 px-2 py-2.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors whitespace-nowrap",
              isActive ? "text-slate-deep" : "text-white/55"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="binder-tab"
                className="absolute inset-0 bg-pikachu rounded-lg shadow-md shadow-pikachu/20"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
