"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, PartyPopper } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import {
  loadStoredEvents,
  todayStr,
  formatEventDate,
  milesBetween,
  GEOFENCE_MILES,
  regenerateEventsAround,
} from "@/lib/events";
import { enablePushNotifications, notifyLocal } from "@/lib/push";
import type { PokemonEvent } from "@/types";

const DISMISS_KEY = "tradechu.geofenceDismissed.v1";

type DismissedMap = Record<string, boolean>;

function readDismissed(): DismissedMap {
  try {
    const raw = sessionStorage.getItem(DISMISS_KEY);
    return raw ? (JSON.parse(raw) as DismissedMap) : {};
  } catch {
    return {};
  }
}

function writeDismissed(map: DismissedMap) {
  try {
    sessionStorage.setItem(DISMISS_KEY, JSON.stringify(map));
  } catch {
    // Non-fatal.
  }
}

/**
 * Chick-fil-A-style proximity check-in: when the user is within 1 mile of an
 * RSVPed event that is today, ask "Are you at the event?"
 * No → ignore matching for this visit (RSVP stays). Re-entry can re-ask.
 * Yes → check in and open event trades.
 */
export function EventDayPrompt() {
  const router = useRouter();
  const { attendance, confirmAttendance, userId, quietHours } = useApp();
  const [event, setEvent] = useState<PokemonEvent | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [gpsDenied, setGpsDenied] = useState(false);
  const [showSimulate, setShowSimulate] = useState(false);
  const [hasGoingToday, setHasGoingToday] = useState(false);
  const insideRef = useRef<Record<string, boolean>>({});
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const today = todayStr();
    setHasGoingToday(
      loadStoredEvents().some((e) => e.date === today && attendance[e.id] === "going")
    );
  }, [attendance, event]);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsDenied(true);
      setShowSimulate(true);
      return;
    }

    const evaluate = (lat: number, lng: number) => {
      if (event) return;
      const today = todayStr();
      const dismissed = readDismissed();
      const candidates = loadStoredEvents().filter(
        (e) => e.date === today && attendance[e.id] === "going" && e.lat != null && e.lng != null
      );

      for (const e of candidates) {
        const dist = milesBetween(lat, lng, e.lat, e.lng);
        const inside = dist <= GEOFENCE_MILES;

        // Left the geofence → clear dismiss so re-entry can ask again.
        if (!inside && insideRef.current[e.id]) {
          const next = readDismissed();
          delete next[e.id];
          writeDismissed(next);
        }
        insideRef.current[e.id] = inside;

        if (inside && !dismissed[e.id]) {
          setEvent(e);
          void enablePushNotifications(null, quietHours).then((ok) => {
            if (ok && !quietHours) {
              void notifyLocal(
                "You're near an event",
                `About 1 mile from ${e.venue} — are you at the event?`,
                `/events/${e.id}`
              );
            }
          });
          return;
        }
      }
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsDenied(false);
        evaluate(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setGpsDenied(true);
        setShowSimulate(true);
      },
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 12000 }
    );

    // Desktop / denied-GPS demo helper appears after a short delay if no fix.
    const timer = window.setTimeout(() => setShowSimulate(true), 4000);

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      window.clearTimeout(timer);
    };
  }, [attendance, event, quietHours]);

  const dismissVisit = () => {
    if (!event) return;
    const next = readDismissed();
    next[event.id] = true;
    writeDismissed(next);
    setEvent(null);
    setCheckingIn(false);
  };

  const handleYes = () => {
    if (!event) return;
    confirmAttendance(event.id);
    void enablePushNotifications(userId, quietHours);
    setCheckingIn(true);
    const id = event.id;
    window.setTimeout(() => {
      setEvent(null);
      setCheckingIn(false);
      router.push(`/events/${id}/trades`);
    }, 900);
  };

  const handleSimulateNearby = () => {
    // Place events around a fixed demo origin and pretend we're at that origin
    // so the nearest Today RSVP (0.4 mi) falls inside the 1-mile geofence.
    const origin = { lat: 30.2672, lng: -97.7431 };
    regenerateEventsAround(origin);
    const today = todayStr();
    const dismissed = readDismissed();
    const candidate = loadStoredEvents().find(
      (e) => e.date === today && attendance[e.id] === "going" && !dismissed[e.id]
    );
    if (candidate) {
      setEvent(candidate);
    }
  };

  return (
    <>
      {/* Desktop / no-GPS helper — only when user has an RSVP for today */}
      {!event && showSimulate && hasGoingToday && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[115] w-[calc(100%-2rem)] max-w-[400px]">
          <button
            onClick={handleSimulateNearby}
            className="w-full glass-card rounded-2xl px-4 py-3 text-left active:scale-[0.98] transition-transform"
          >
            <p className="text-xs font-bold text-pikachu">
              {gpsDenied ? "Location unavailable" : "Demo helper"}
            </p>
            <p className="text-[11px] text-white/50 mt-0.5">
              Simulate being within 1 mile of your RSVPed event
            </p>
          </button>
        </div>
      )}

      <AnimatePresence>
        {event && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0.85, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 22, stiffness: 280 }}
              className="w-full max-w-[360px] glass-card rounded-3xl p-6 text-center"
            >
              {checkingIn ? (
                <>
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-green-400/15 flex items-center justify-center mb-4">
                    <PartyPopper size={26} className="text-green-300" />
                  </div>
                  <h3 className="text-lg font-bold mb-1.5">You&apos;re checked in!</h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Finding traders at {event.title}…
                  </p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-pikachu/15 flex items-center justify-center mb-4">
                    <MapPin size={26} className="text-pikachu" />
                  </div>
                  <p className="text-[11px] font-bold text-pikachu uppercase tracking-wide mb-1">
                    Within {GEOFENCE_MILES} mile · {formatEventDate(event.date)} · {event.startTime}
                  </p>
                  <h3 className="text-lg font-bold leading-tight mb-1.5">{event.title}</h3>
                  <p className="text-sm text-white/60 mb-5">
                    You&apos;re near {event.venue}. Are you at the event?
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={handleYes}
                      className="w-full py-3.5 rounded-2xl bg-pikachu text-slate-deep font-bold active:scale-98"
                    >
                      Yes, I&apos;m here
                    </button>
                    <button
                      onClick={dismissVisit}
                      className="w-full py-3 rounded-2xl bg-white/5 text-sm font-semibold text-white/60 active:bg-white/10"
                    >
                      No
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
