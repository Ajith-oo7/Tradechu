"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  Users,
  CalendarDays,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { PageHeader } from "@/components/layout/PageHeader";
import { useApp } from "@/providers/AppProvider";
import { getEventById, formatEventDate } from "@/lib/events";
import { cn } from "@/lib/utils";
import type { PokemonEvent } from "@/types";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { attendance, attendEvent, cancelAttendance } = useApp();

  // Events live in localStorage, so resolve after mount.
  const [event, setEvent] = useState<PokemonEvent | null | undefined>(undefined);
  useEffect(() => {
    setEvent(getEventById(eventId) ?? null);
  }, [eventId]);

  if (event === undefined) {
    return (
      <PageTransition>
        <PageHeader title="Event" showBack backHref="/events" />
        <div className="px-4">
          <div className="glass-card rounded-3xl h-64 animate-pulse" />
        </div>
      </PageTransition>
    );
  }

  if (event === null) {
    return (
      <PageTransition>
        <PageHeader title="Event" showBack backHref="/events" />
        <div className="text-center py-20 text-white/40">Event not found</div>
      </PageTransition>
    );
  }

  const status = attendance[event.id];
  const going = !!status;
  const dateLabel = formatEventDate(event.date);

  return (
    <PageTransition>
      <PageHeader title="Event Details" showBack backHref="/events" />

      <div className="px-4 pb-8 space-y-4">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-3xl bg-gradient-to-br p-6 relative overflow-hidden",
            event.gradient
          )}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative">
            <span className="inline-block text-[10px] font-bold uppercase tracking-wide bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur">
              {event.category}
            </span>
            <h1 className="text-2xl font-black text-white mt-3 leading-tight drop-shadow">
              {event.title}
            </h1>
            <div className="flex items-center gap-1.5 mt-2 text-white/90 text-sm font-semibold">
              <CalendarDays size={15} />
              {dateLabel} · {event.startTime} – {event.endTime}
            </div>
          </div>
        </motion.div>

        {/* Location */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="glass-card rounded-2xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-pikachu/15 flex items-center justify-center shrink-0">
              <MapPin size={18} className="text-pikachu" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{event.venue}</p>
              <p className="text-xs text-white/50 mt-0.5">
                {event.address} · {event.distanceMiles.toFixed(1)} miles away
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10 text-xs text-white/50">
            <span className="inline-flex items-center gap-1.5">
              <Clock size={13} />
              {event.startTime} – {event.endTime}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users size={13} />
              {event.attendees} attending
            </span>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="glass-card rounded-2xl p-4"
        >
          <h2 className="font-bold text-sm mb-2">About this event</h2>
          <p className="text-sm text-white/70 leading-relaxed">{event.description}</p>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="glass-card rounded-2xl p-4"
        >
          <h2 className="font-bold text-sm mb-3">Details</h2>
          <div className="space-y-2.5">
            {event.details.map((d) => (
              <div key={d.label} className="flex items-start justify-between gap-4 text-sm">
                <span className="text-white/40 shrink-0">{d.label}</span>
                <span className="font-semibold text-right">{d.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Attend button */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="pt-1"
        >
          {going ? (
            <div className="space-y-2">
              <div className="w-full py-4 rounded-2xl bg-green-400/15 text-green-300 font-bold flex items-center justify-center gap-2">
                <CheckCircle2 size={18} />
                {status === "confirmed" ? "Attendance confirmed" : "You're attending this event"}
              </div>
              {status === "confirmed" ? (
                <button
                  onClick={() => router.push(`/events/${event.id}/trades`)}
                  className="w-full py-3.5 rounded-2xl bg-pikachu text-slate-deep font-bold active:scale-98"
                >
                  Open event trades
                </button>
              ) : null}
              <button
                onClick={() => cancelAttendance(event.id)}
                className="w-full py-3 rounded-2xl text-sm font-semibold text-white/50 flex items-center justify-center gap-2 active:bg-white/5"
              >
                <XCircle size={15} />
                Cancel attendance
              </button>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => attendEvent(event.id, event.title)}
              className="w-full py-4 rounded-2xl bg-pikachu text-slate-deep font-bold text-base shadow-lg shadow-pikachu/20"
            >
              RSVP — I am attending
            </motion.button>
          )}
          <p className="text-[11px] text-white/30 text-center mt-3">
            {status === "confirmed"
              ? "You're checked in — trade with other attendees."
              : going
                ? "On event day, we'll ask when you're within 1 mile of the venue."
                : "RSVP (Répondez s’il vous plaît) saves your attendance. Check in within 1 mile to match."}
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
}
