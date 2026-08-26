"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, WifiOff, Plus } from "lucide-react";
import { searchCards, type ApiCard } from "@/lib/pokemonTcg";
import { ensureCardIndex, peekCardIndex } from "@/lib/cardIndex";

export function useCardSearch(query: string) {
  const [results, setResults] = useState<ApiCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const cards = await searchCards(q, controller.signal);
      if (!controller.signal.aborted) {
        setResults(cards);
        setLoading(false);
        setSearched(true);
      }
    }, 120);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  return { results, loading, searched };
}

const PAGE_SIZE = 40;

export function CardResultGrid({
  results,
  onSelect,
}: {
  results: ApiCard[];
  onSelect: (card: ApiCard) => void;
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [results]);

  // Reveal more cards as the sentinel scrolls into view.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible((v) => Math.min(results.length, v + PAGE_SIZE));
        }
      },
      { rootMargin: "600px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [results.length, visible]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {results.slice(0, visible).map((card, i) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min((i % PAGE_SIZE) * 0.02, 0.3) }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelect(card)}
            className="text-left group"
          >
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-white/5 relative">
              {card.imageSmall ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={card.imageSmall}
                  alt={card.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-active:scale-105 transition-transform"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-2 bg-gradient-to-br from-white/10 to-white/[0.03]">
                  <p className="text-[11px] font-bold text-center text-white/60 leading-tight line-clamp-3">
                    {card.name}
                  </p>
                  <p className="text-[9px] text-white/30">No image available</p>
                </div>
              )}
            </div>
            <p className="mt-1.5 text-[11px] font-semibold leading-tight line-clamp-1">{card.name}</p>
            <p className="text-[10px] text-white/40 leading-tight line-clamp-1">
              {card.setName}
              {card.cardNumber ? ` · #${card.cardNumber}` : ""}
            </p>
          </motion.button>
        ))}
      </div>
      {visible < results.length && <div ref={sentinelRef} className="h-10" />}
    </>
  );
}

export function ResultSkeletons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <div className="aspect-[3/4] rounded-lg bg-white/5 animate-pulse" />
          <div className="mt-1.5 h-2.5 w-3/4 rounded bg-white/5 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

interface CardSearchSheetProps {
  title: string;
  onSelect: (card: ApiCard) => void;
  onAddManual: (name: string) => void;
  onClose: () => void;
}

export function CardSearchSheet({ title, onSelect, onAddManual, onClose }: CardSearchSheetProps) {
  const [query, setQuery] = useState("");
  const { results, loading, searched } = useCardSearch(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const [indexReady, setIndexReady] = useState(() => peekCardIndex() !== null);

  useEffect(() => {
    inputRef.current?.focus();
    if (!indexReady) {
      let mounted = true;
      ensureCardIndex().then((idx) => {
        if (mounted && idx) setIndexReady(true);
      });
      return () => { mounted = false; };
    }
  }, [indexReady]);

  const showEmpty = searched && !loading && results.length === 0;

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
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[430px] mx-auto glass-card rounded-t-3xl flex flex-col h-[85dvh]"
        >
          <div className="p-5 pb-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">{title}</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search any Pokémon card…"
                className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-base font-semibold placeholder:text-white/30 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-pikachu/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-safe pb-6">
            {loading && <ResultSkeletons />}

            {!loading && results.length > 0 && (
              <>
                <p className="text-[11px] text-white/40 font-medium mb-2.5">
                  {`${results.length} ${results.length === 1 ? "card" : "cards"} found`}
                </p>
                <CardResultGrid results={results} onSelect={onSelect} />
              </>
            )}

            {showEmpty && (
              <div className="py-10 text-center space-y-4">
                <WifiOff size={28} className="mx-auto text-white/25" />
                <div>
                  <p className="text-sm text-white/50">No cards found for “{query.trim()}”</p>
                  <p className="text-xs text-white/30 mt-1">
                    Check the spelling, or you may be offline.
                  </p>
                </div>
                <button
                  onClick={() => onAddManual(query.trim())}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 text-sm font-semibold active:scale-95 transition-transform"
                >
                  <Plus size={14} />
                  Add “{query.trim()}” anyway
                </button>
              </div>
            )}

            {!loading && !searched && (
              <div className="py-14 text-center">
                <Search size={28} className="mx-auto text-white/15 mb-3" />
                <p className="text-sm text-white/40">
                  Search every card ever released —<br />
                  official art, sets and rarities.
                </p>
                {!indexReady && (
                  <p className="text-[11px] text-pikachu/60 mt-3 animate-pulse">
                    Downloading full card database…
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
