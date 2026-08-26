"use client";

import { motion } from "framer-motion";
import {
  Bell,
  Moon,
  Shield,
  Trash2,
  ChevronRight,
  Pencil,
  VolumeX,
  type LucideIcon,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar } from "@/components/shared/Avatar";
import { useApp } from "@/providers/AppProvider";
import { enablePushNotifications, notifyLocal } from "@/lib/push";

export function SettingsScreen() {
  const {
    username,
    avatar,
    avatarGradient,
    wishlist,
    tradeBinder,
    stats,
    darkMode,
    setDarkMode,
    quietHours,
    setQuietHours,
    userId,
    backendOnline,
    clearWishlist,
    clearBinder,
  } = useApp();

  return (
    <PageTransition>
      <PageHeader title="Settings" />
      <div className="px-4 pb-6 space-y-6">
        {/* Profile */}
        <section>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-3">Profile</h2>
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-4 mb-4">
              <Avatar letter={avatar} gradient={avatarGradient} size="lg" />
              <div>
                <p className="font-bold text-lg">@{username}</p>
                <button className="flex items-center gap-1 text-pikachu text-sm font-semibold mt-1">
                  <Pencil size={12} />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-3">Statistics</h2>
          <div className="glass-card rounded-2xl p-4 grid grid-cols-2 gap-3">
            {[
              { label: "Cards Traded", value: stats.cardsTraded },
              { label: "Successful Trades", value: stats.successfulTrades },
              { label: "Wishlist Count", value: wishlist.length },
              { label: "Trade Binder Count", value: tradeBinder.length },
              { label: "Events Attended", value: stats.eventsAttended },
              { label: "Member Since", value: stats.memberSince },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 rounded-xl p-3">
                <p className="text-lg font-bold text-pikachu">{stat.value}</p>
                <p className="text-[10px] text-white/50 leading-tight mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Preferences */}
        <section>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-3">Preferences</h2>
          <div className="glass-card rounded-2xl overflow-hidden divide-y divide-white/5">
            <button
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors"
              onClick={async () => {
                const ok = await enablePushNotifications(userId, false);
                if (ok) {
                  await notifyLocal(
                    "Notifications on",
                    "You'll get nearby-event and open-trade reminders.",
                    "/events"
                  );
                } else {
                  alert("Notification permission was denied or isn't supported in this browser.");
                }
              }}
            >
              <Bell size={18} className="text-white/50" />
              <span className="flex-1 text-left text-sm font-medium">Enable notifications</span>
              <ChevronRight size={16} className="text-white/30" />
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors"
              onClick={() =>
                void notifyLocal(
                  "Trade still open?",
                  "Trade with @TrainerY still open?",
                  "/messages"
                )
              }
            >
              <Bell size={18} className="text-white/50" />
              <span className="flex-1 text-left text-sm font-medium">Test open-trade reminder</span>
              <ChevronRight size={16} className="text-white/30" />
            </button>
            <SettingsToggle
              icon={VolumeX}
              label="Quiet hours (mute pushes)"
              value={quietHours}
              onChange={setQuietHours}
            />
            <SettingsToggle icon={Moon} label="Dark Mode" value={darkMode} onChange={setDarkMode} />
            <SettingsRow icon={Shield} label="Privacy" />
          </div>
          <p className="text-[10px] text-white/30 mt-2 px-1">
            Backend: {backendOnline ? "Supabase connected" : "local mode (add keys in .env)"}
          </p>
        </section>

        {/* Danger Zone */}
        <section>
          <h2 className="text-xs font-semibold text-pokeball/80 uppercase tracking-wide mb-3">Danger Zone</h2>
          <div className="glass-card rounded-2xl overflow-hidden divide-y divide-white/5 border border-pokeball/10">
            <DangerRow label="Delete Account" onClick={() => alert("Demo only — account deletion not available.")} />
            <DangerRow label="Clear Wishlist" onClick={() => { if (confirm("Clear entire wishlist?")) clearWishlist(); }} />
            <DangerRow label="Clear Trade Binder" onClick={() => { if (confirm("Clear entire trade binder?")) clearBinder(); }} />
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

function SettingsRow({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <button className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors">
      <Icon size={18} className="text-white/50" />
      <span className="flex-1 text-left text-sm font-medium">{label}</span>
      <ChevronRight size={16} className="text-white/30" />
    </button>
  );
}

function SettingsToggle({
  icon: Icon,
  label,
  value,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Icon size={18} className="text-white/50" />
      <span className="flex-1 text-sm font-medium">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors relative ${
          value ? "bg-pikachu" : "bg-white/20"
        }`}
      >
        <motion.div
          layout
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow"
          style={{ left: value ? "22px" : "2px" }}
        />
      </button>
    </div>
  );
}

function DangerRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-pokeball/10 transition-colors text-pokeball"
    >
      <Trash2 size={16} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
