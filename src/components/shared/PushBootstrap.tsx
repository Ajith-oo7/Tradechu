"use client";

import { useEffect } from "react";
import { registerTradechuServiceWorker } from "@/lib/push";

/** Registers the service worker once so web push is ready later. */
export function PushBootstrap() {
  useEffect(() => {
    void registerTradechuServiceWorker();
  }, []);
  return null;
}
