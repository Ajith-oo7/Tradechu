"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  BookOpen,
  MessageCircle,
  Calendar,
  Settings,
  Sparkles,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Logo } from "@/components/shared/Logo";
import { PokeballBackground } from "@/components/home/PokeballBackground";
import { useApp } from "@/providers/AppProvider";
import { todayStr } from "@/lib/events";

const hubLinks = [
  {
    href: "/wishlist",
    title: "Wishlist",
    subtitle: "Cards you’re hunting",
    icon: Heart,
    accent: "text-pokeball bg-pokeball/15",
  },
  {
    href: "/binder",
    title: "Trade Binder",
    subtitle: "Cards you’ll trade away",
    icon: BookOpen,
    accent: "text-pikachu bg-pikachu/15",
  },
  {
    href: "/messages",
    title: "Messages",
    subtitle: "Negotiate trades",
    icon: MessageCircle,
    accent: "text-cyan-300 bg-cyan-400/15",
  },
  {
    href: "/events",
    title: "Events",
    subtitle: "Nearby shows & meetups",
    icon: Calendar,
    accent: "text-green-300 bg-green-400/15",
  },
  {
    href: "/settings",
    title: "Settings",
    subtitle: "Profile & preferences",
    icon: Settings,
    accent: "text-white/70 bg-white/10",
  },
];

export function HomeScreen() {
  const { username, wishlist, tradeBinder, attendance } = useApp();

  const checkedInEventId = useMemo(() => {
    const today = todayStr();
    return Object.entries(attendance).find(([id, status]) => {
      if (status !== "confirmed") return false;
      // Event ids look like ev-YYYY-MM-DD-n
      return id.includes(today);
    })?.[0];
  }, [attendance]);

  return (
    <PageTransition>
      <div className="relative min-h-screen flex flex-col">
        <PokeballBackground />

        <header className="relative z-10 px-4 pt-3 pb-2 flex items-center justify-between">
          <Logo size="sm" />
          <p className="text-[10px] text-white/40 font-medium">@{username}</p>
        </header>

        <div className="relative z-10 px-4 pb-2">
          <h1 className="text-2xl font-black leading-tight">Find Your Next Trade</h1>
          <p className="text-sm text-white/45 mt-1">
            Build lists, RSVP to events, check in nearby, then match.
          </p>
          <div className="flex gap-3 mt-3 text-[11px] text-white/40">
            <span>{wishlist.length} wishlist</span>
            <span>·</span>
            <span>{tradeBinder.length} binder</span>
          </div>
        </div>

        <div className="relative z-10 flex-1 px-4 pb-6 space-y-3 mt-2">
          {checkedInEventId && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Link
                href={`/events/${checkedInEventId}/trades`}
                className="block glass-card rounded-2xl p-4 border border-green-400/20 active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-green-400/15 flex items-center justify-center">
                    <MapPin size={20} className="text-green-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-green-300 uppercase tracking-wide">
                      Checked in
                    </p>
                    <p className="font-bold text-sm">Open event trades</p>
                    <p className="text-xs text-white/40">Match with attendees here now</p>
                  </div>
                  <ChevronRight size={18} className="text-white/30" />
                </div>
              </Link>
            </motion.div>
          )}

          {hubLinks.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i }}
              >
                <Link
                  href={item.href}
                  className="block glass-card rounded-2xl p-4 active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.accent}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">{item.title}</p>
                      <p className="text-xs text-white/40">{item.subtitle}</p>
                    </div>
                    <ChevronRight size={18} className="text-white/30" />
                  </div>
                </Link>
              </motion.div>
            );
          })}

          <div className="glass-card rounded-2xl p-4 flex items-start gap-3 opacity-90">
            <Sparkles size={16} className="text-pikachu mt-0.5 shrink-0" />
            <p className="text-xs text-white/50 leading-relaxed">
              <span className="text-white/70 font-semibold">RSVP</span> means{" "}
              <span className="italic">Répondez s’il vous plaît</span> (“Please respond”) —
              tap <span className="text-white/70">RSVP — I am attending</span> on an event,
              then check in when you’re within 1 mile to start matching.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
