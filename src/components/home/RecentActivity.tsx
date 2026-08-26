"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import type { ActivityItem } from "@/types";

interface RecentActivityProps {
  items: ActivityItem[];
}

const typeIcons: Record<ActivityItem["type"], string> = {
  match: "text-pikachu",
  wishlist: "text-pokeball",
  binder: "text-blue-400",
  trade: "text-green-400",
  event: "text-purple-400",
};

export function RecentActivity({ items }: RecentActivityProps) {
  const grouped = items.reduce<Record<string, ActivityItem[]>>((acc, item) => {
    if (!acc[item.timestamp]) acc[item.timestamp] = [];
    acc[item.timestamp].push(item);
    return acc;
  }, {});

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
          <Activity size={16} className="text-white/60" />
        </div>
        <h2 className="text-base font-bold">Recent Activity</h2>
      </div>

      <div className="glass-card rounded-2xl p-4 space-y-4">
        {Object.entries(grouped).map(([date, dateItems], gi) => (
          <div key={date}>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-2">
              {date}
            </p>
            <div className="space-y-2">
              {dateItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: gi * 0.1 + i * 0.05 }}
                  className="flex items-start gap-2"
                >
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-current ${typeIcons[item.type]}`} />
                  <p className="text-sm text-white/80">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
