"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { GlitterField } from "./GlitterField";

const PokeballScene = dynamic(
  () => import("./PokeballScene").then((mod) => mod.PokeballScene),
  { ssr: false }
);

function PokeballHalo() {
  return (
    <>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-[60%] max-w-[280px] aspect-square rounded-full bg-[radial-gradient(circle,#EE151540_0%,#EE151518_40%,transparent_70%)] blur-2xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-[22%] max-w-[100px] aspect-square rounded-full bg-white/10 blur-xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-[48%] max-w-[220px] aspect-square rounded-full border border-pikachu/10 blur-sm opacity-60" />
    </>
  );
}

function StaticFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <PokeballHalo />
      <GlitterField staticOnly />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-deep/20 via-transparent to-slate-deep/40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,transparent_0%,transparent_40%,#0F172A_80%)]" />
    </div>
  );
}

export function PokeballBackground() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (!mounted) return <StaticFallback />;

  if (reducedMotion) return <StaticFallback />;

  return (
    <div className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-0 overflow-hidden pointer-events-none">
      <Suspense fallback={<StaticFallback />}>
        <div className="absolute inset-0">
          <PokeballScene />
        </div>
      </Suspense>

      <div className="absolute inset-0 z-[1]">
        <PokeballHalo />
      </div>

      <GlitterField />

      <div className="absolute inset-0 bg-gradient-to-b from-slate-deep/15 via-transparent to-slate-deep/50 z-[2]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,transparent_0%,transparent_38%,#0F172A_78%)] z-[2]" />
    </div>
  );
}
