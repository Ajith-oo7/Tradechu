"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Radio, Users } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { PageHeader } from "@/components/layout/PageHeader";
import { TradeOpportunityCard } from "@/components/home/TradeOpportunityCard";
import { CardViewerModal } from "@/components/binder/CardViewerModal";
import { useApp } from "@/providers/AppProvider";
import { getEventById } from "@/lib/events";
import { computeTradeOpportunities, otherUsers } from "@/data/mock";
import { fetchConfirmedAttendeeCards } from "@/lib/supabase/api";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { PokemonCard, PokemonEvent, TradeOpportunity, User } from "@/types";

export default function EventTradesPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const {
    username,
    avatar,
    avatarGradient,
    wishlist,
    tradeBinder,
    attendance,
    userId,
    backendOnline,
  } = useApp();

  const [event, setEvent] = useState<PokemonEvent | null | undefined>(undefined);
  const [viewingCard, setViewingCard] = useState<PokemonCard | null>(null);
  const [liveOthers, setLiveOthers] = useState<User[] | null>(null);
  const [liveLabel, setLiveLabel] = useState("Matching traders…");

  useEffect(() => {
    setEvent(getEventById(eventId) ?? null);
  }, [eventId]);

  useEffect(() => {
    if (event === undefined) return;
    if (!event || attendance[event.id] !== "confirmed") {
      router.replace(event ? `/events/${event.id}` : "/events");
    }
  }, [event, attendance, router]);

  const refreshLive = useCallback(async () => {
    if (!backendOnline || !userId || !isSupabaseConfigured()) {
      setLiveOthers(null);
      setLiveLabel("Demo matches (connect Supabase for live attendees)");
      return;
    }
    const rows = await fetchConfirmedAttendeeCards(eventId, userId);
    setLiveOthers(
      rows.map((r) => ({
        id: r.userId,
        username: r.username,
        avatar: r.avatar,
        avatarGradient: r.avatarGradient,
        wishlist: r.wishlist,
        tradeBinder: r.tradeBinder,
      }))
    );
    setLiveLabel(
      rows.length
        ? `${rows.length} collector${rows.length === 1 ? "" : "s"} checked in live`
        : "Waiting for other collectors to check in…"
    );
  }, [backendOnline, userId, eventId]);

  useEffect(() => {
    void refreshLive();
    if (!backendOnline || !isSupabaseConfigured()) return;

    const sb = getSupabase();
    if (!sb) return;

    const channel = sb
      .channel(`event:${eventId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "event_rsvps", filter: `event_id=eq.${eventId}` },
        () => {
          void refreshLive();
        }
      )
      .subscribe();

    // Presence heartbeat while on this screen
    channel.track({ userId, username, at: Date.now() });

    return () => {
      void sb.removeChannel(channel);
    };
  }, [backendOnline, eventId, refreshLive, userId, username]);

  const me: User = useMemo(
    () => ({
      id: userId ?? "u0",
      username,
      avatar,
      avatarGradient,
      wishlist,
      tradeBinder,
    }),
    [userId, username, avatar, avatarGradient, wishlist, tradeBinder]
  );

  const opportunities: TradeOpportunity[] = useMemo(() => {
    const others = liveOthers ?? otherUsers;
    return computeTradeOpportunities(me, others);
  }, [me, liveOthers]);

  if (event === undefined || attendance[eventId] !== "confirmed") {
    return (
      <PageTransition>
        <PageHeader title="Event Trades" showBack backHref="/events" />
        <div className="px-4">
          <div className="glass-card rounded-3xl h-40 animate-pulse" />
        </div>
      </PageTransition>
    );
  }

  if (event === null) {
    return (
      <PageTransition>
        <PageHeader title="Event Trades" showBack backHref="/events" />
        <div className="text-center py-20 text-white/40">Event not found</div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <PageHeader title="Event Trades" showBack backHref={`/events/${event.id}`} />

      <div className="px-4 pb-8 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-400/15 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} className="text-green-300" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-green-300 uppercase tracking-wide">
                You&apos;re checked in
              </p>
              <p className="font-bold text-sm mt-0.5 leading-tight">{event.title}</p>
              <p className="text-xs text-white/45 mt-1 flex items-center gap-1.5">
                <Radio size={12} className="text-pikachu" />
                {liveLabel}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex items-center gap-2 px-1">
          <Users size={14} className="text-white/40" />
          <p className="text-xs text-white/45 font-medium">
            {opportunities.length} match{opportunities.length === 1 ? "" : "es"} at this event
          </p>
        </div>

        {opportunities.length === 0 ? (
          <div className="glass-card rounded-2xl py-14 text-center px-6">
            <p className="text-sm text-white/50">No trade matches yet at this event.</p>
            <p className="text-xs text-white/30 mt-1.5">
              Add more cards, or wait for other checked-in collectors.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {opportunities.map((opp, i) => (
              <TradeOpportunityCard
                key={opp.id}
                opportunity={opp}
                index={i}
                onViewCard={setViewingCard}
              />
            ))}
          </div>
        )}
      </div>

      {viewingCard && (
        <CardViewerModal card={viewingCard} onClose={() => setViewingCard(null)} />
      )}
    </PageTransition>
  );
}
