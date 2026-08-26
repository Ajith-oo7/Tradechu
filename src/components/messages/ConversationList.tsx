"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar } from "@/components/shared/Avatar";
import { ArrowRightLeft } from "lucide-react";
import type { Conversation } from "@/types";

interface ConversationListProps {
  conversations: Conversation[];
}

export function ConversationList({ conversations }: ConversationListProps) {
  const active = conversations.filter((c) => !c.archived);

  if (active.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <p className="text-white/40 text-sm">No conversations yet.</p>
        <p className="text-white/25 text-xs mt-1">Start messaging from a trade opportunity on Home.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {active.map((conv, i) => (
        <motion.div
          key={conv.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          <Link href={`/messages/${conv.id}`}>
            <div className="glass-card rounded-2xl p-4 active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar letter={conv.avatar} gradient={conv.avatarGradient} />
                  {conv.unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-pokeball rounded-full text-[10px] font-bold flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">@{conv.username}</h3>
                    <span className="text-[10px] text-white/40">{conv.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <ArrowRightLeft size={11} className="text-pikachu shrink-0" />
                    <p className="text-xs text-pikachu/80 truncate">
                      {conv.tradeReceive} ↔ {conv.tradeGive}
                    </p>
                  </div>
                  <p className="text-xs text-white/50 truncate mt-0.5">{conv.lastMessage}</p>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
