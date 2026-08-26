"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Avatar } from "@/components/shared/Avatar";
import { BinderCardSlot } from "@/components/binder/BinderCardSlot";
import type { PokemonCard, TradeOpportunity } from "@/types";

interface TradeOpportunityCardProps {
  opportunity: TradeOpportunity;
  index?: number;
  onViewCard?: (card: PokemonCard) => void;
}

export function TradeOpportunityCard({ opportunity, index = 0, onViewCard }: TradeOpportunityCardProps) {
  const convHref = `/messages/conv${opportunity.userId.replace("u", "")}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="glass-card rounded-2xl p-4 space-y-4"
    >
      <div className="flex items-center gap-3">
        <Avatar letter={opportunity.avatar} gradient={opportunity.avatarGradient} />
        <p className="font-bold text-base">@{opportunity.username}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-xl p-3 space-y-2">
          <p className="text-[10px] font-semibold text-white/40 uppercase">Has</p>
          <div className="w-20 mx-auto">
            <BinderCardSlot
              card={opportunity.theyHave}
              readOnly
              onView={onViewCard ? () => onViewCard(opportunity.theyHave) : undefined}
            />
          </div>
          <p className="text-[10px] text-center text-pokeball/80">From your wishlist</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 space-y-2">
          <p className="text-[10px] font-semibold text-white/40 uppercase">Wants</p>
          <div className="w-20 mx-auto">
            <BinderCardSlot
              card={opportunity.youHave}
              readOnly
              onView={onViewCard ? () => onViewCard(opportunity.youHave) : undefined}
            />
          </div>
          <p className="text-[10px] text-center text-pikachu/80">From your trade binder</p>
        </div>
      </div>

      <Link href={convHref}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-2 bg-pikachu text-slate-deep font-bold py-3.5 rounded-2xl text-base"
        >
          <MessageCircle size={18} />
          Message
        </motion.button>
      </Link>
    </motion.div>
  );
}
