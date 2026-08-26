"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Users, ChevronRight, CheckCircle2 } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { PageHeader } from "@/components/layout/PageHeader";
import { useApp } from "@/providers/AppProvider";
import { ensureNearbyEvents, getAreaLabel, formatEventDate, RADIUS_MILES } from "@/lib/events";
import { cn } from "@/lib/utils";
import type { PokemonEvent } from "@/types";

const categoryStyles: Record<string, string> = {
  Tournament: "bg-pokeball/15 text-pokeball",
  Prerelease: "bg-purple-400/15 text-purple-300",
  "Trade Meetup": "bg-cyan-400/15 text-cyan-300",
  "Card Show": "bg-pikachu/15 text-pikachu",
  "Community Day": "bg-green-400/15 text-green-300",
  "League Night": "bg-blue-400/15 text-blue-300",
};

export function EventsScreen() {
  const { attendance } = useApp();
  const [events, setEvents] = useState<PokemonEvent[] | null>(null);
  const [areaLabel, setAreaLabel] = useState("near you");

  useEffect(() => {
    let mounted = true;
    void ensureNearbyEvents().then((list) => {
      if (mounted) setEvents(list);
    });
    getAreaLabel().then((label) => {
      if (mounted) setAreaLabel(label);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <PageTransition>
      <PageHeader title="Events" />
      <div className="px-4 pb-6">
        <div className="flex items-center gap-2 mb-4 text-xs text-white/50">
          <MapPin size={14} className="text-pikachu shrink-0" />
          <p>
            Pokémon events {areaLabel} — within {RADIUS_MILES} miles
          </p>
        </div>

        {events === null ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl h-28 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event, i) => {
              const going = !!attendance[event.id];
              const isToday = formatEventDate(event.date) === "Today";
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/events/${event.id}`} className="block">
                    <div className="glass-card rounded-2xl p-4 active:scale-[0.98] transition-transform">
                      <div className="flex gap-3">
                        <div
                          className={cn(
                            "w-14 h-14 rounded-xl bg-gradient-to-br shrink-0 flex flex-col items-center justify-center",
                            event.gradient
                          )}
                        >
                          <CalendarDays size={16} className="text-white/90" />
                          <span className="text-[9px] font-bold text-white/90 mt-0.5 px-1 text-center leading-tight">
                            {formatEventDate(event.date)}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-sm leading-tight line-clamp-2">
                              {event.title}
                            </p>
                            <ChevronRight size={16} className="text-white/30 shrink-0 mt-0.5" />
                          </div>
                          <p className="text-xs text-white/50 mt-1 truncate">
                            {event.venue} · {event.distanceMiles.toFixed(1)} mi
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span
                              className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                categoryStyles[event.category] ?? "bg-white/10 text-white/60"
                              )}
                            >
                              {event.category}
                            </span>
                            {isToday && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pikachu/20 text-pikachu">
                                Today
                              </span>
                            )}
                            {going && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-400/15 text-green-300">
                                <CheckCircle2 size={10} />
                                Going
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-[10px] text-white/40 ml-auto">
                              <Users size={10} />
                              {event.attendees}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
