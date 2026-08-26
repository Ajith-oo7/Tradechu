"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { cards } from "@/data/mock";

interface TradeConfirmationProps {
  tradeGive: string;
  tradeReceive: string;
  startedAt: string;
  onDismiss: () => void;
}

function isOlderThanOneDay(startedAt: string): boolean {
  const start = new Date(startedAt).getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  return Date.now() - start >= oneDay;
}

export function TradeConfirmation({
  tradeGive,
  tradeReceive,
  startedAt,
  onDismiss,
}: TradeConfirmationProps) {
  const { completeTrade } = useApp();
  const [step, setStep] = useState<"ask" | "confirm" | "done" | "dismissed">("ask");
  const [show, setShow] = useState(isOlderThanOneDay(startedAt));

  if (!show || step === "dismissed") return null;

  const wishlistCard = Object.values(cards).find((c) => c.name === tradeReceive);
  const binderCard = Object.values(cards).find((c) => c.name === tradeGive);

  const handleConfirm = () => {
    if (wishlistCard && binderCard) {
      completeTrade(wishlistCard.id, binderCard.id);
    }
    setStep("done");
    setTimeout(() => {
      setShow(false);
      onDismiss();
    }, 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mx-4 mt-2 glass-card rounded-2xl p-4 border border-pikachu/20"
      >
        {step === "ask" && (
          <>
            <p className="text-sm font-semibold mb-1">Did you complete this trade?</p>
            <p className="text-base font-bold text-pikachu mb-4">
              {tradeReceive} ↔ {tradeGive}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setStep("confirm")}
                className="flex-1 flex items-center justify-center gap-1.5 bg-pikachu text-slate-deep font-bold py-2.5 rounded-xl text-sm"
              >
                <CheckCircle size={16} />
                Yes
              </button>
              <button
                onClick={() => {
                  setStep("dismissed");
                  setShow(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 glass py-2.5 rounded-xl text-sm font-semibold"
              >
                <Clock size={16} />
                Not Yet
              </button>
            </div>
          </>
        )}

        {step === "confirm" && (
          <>
            <p className="text-sm font-semibold mb-3">Remove traded cards from your lists?</p>
            <ul className="text-xs text-white/60 space-y-1 mb-4">
              <li>Remove {tradeReceive} from wishlist</li>
              <li>Remove {tradeGive} from trade binder</li>
            </ul>
            <button
              onClick={handleConfirm}
              className="w-full bg-pikachu text-slate-deep font-bold py-2.5 rounded-xl text-sm"
            >
              Confirm
            </button>
          </>
        )}

        {step === "done" && (
          <div className="text-center py-2">
            <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
            <p className="font-bold text-green-400">Trade confirmed!</p>
            <p className="text-xs text-white/50 mt-1">Your lists have been updated.</p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
