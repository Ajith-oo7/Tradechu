"use client";

import { AppProvider } from "@/providers/AppProvider";
import { EventDayPrompt } from "@/components/events/EventDayPrompt";
import { PushBootstrap } from "@/components/shared/PushBootstrap";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <div className="min-h-screen gradient-mesh">
        <main className="mobile-shell w-full min-h-screen pb-28">{children}</main>
        <BottomNav />
        <EventDayPrompt />
        <PushBootstrap />
      </div>
    </AppProvider>
  );
}
