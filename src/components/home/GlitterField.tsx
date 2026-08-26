"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

const COLORS = ["#FFCB05", "#FFFFFF", "#EE1515", "#FFD700", "#FFF8DC"];

// Integer-only PRNG (mulberry32-style): bit-identical on server and client,
// unlike Math.sin whose precision varies between JS engines and would cause
// hydration mismatches.
function seededRandom(seed: number) {
  let t = (seed * 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

interface Particle {
  id: number;
  left: string;
  top: string;
  size: number;
  color: string;
  driftDuration: number;
  twinkleDuration: number;
  delay: number;
  driftDirection: "normal" | "reverse";
  isStar?: boolean;
}

function buildParticles(count: number, offset: number, isStar = false): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const seed = i + offset;
    const r1 = seededRandom(seed);
    const r2 = seededRandom(seed + 100);
    const r3 = seededRandom(seed + 200);
    const r4 = seededRandom(seed + 300);
    const r5 = seededRandom(seed + 400);

    return {
      id: seed,
      left: `${(r1 * 100).toFixed(3)}%`,
      top: `${(r2 * 100).toFixed(3)}%`,
      size: isStar ? 4 + r3 * 4 : 2 + r3 * 4,
      color: COLORS[Math.floor(r4 * COLORS.length)],
      driftDuration: isStar ? 5 + r5 * 6 : 3 + r5 * 5,
      twinkleDuration: isStar ? 3 + r3 * 5 : 2 + r3 * 4,
      delay: r2 * 5,
      driftDirection: r4 > 0.5 ? "reverse" : "normal",
      isStar,
    };
  });
}

interface GlitterFieldProps {
  staticOnly?: boolean;
}

export function GlitterField({ staticOnly = false }: GlitterFieldProps) {
  const particles = useMemo(
    () => [...buildParticles(110, 0), ...buildParticles(20, 2000, true)],
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {particles.map((p) => (
        <span
          key={p.id}
          className="glitter-particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animation: staticOnly ? "none" : undefined,
            animationDuration: staticOnly ? undefined : `${p.driftDuration}s`,
            animationDelay: staticOnly ? undefined : `${p.delay}s`,
            animationDirection: staticOnly ? undefined : p.driftDirection,
          }}
        >
          <span
            className={cn("glitter-particle-inner", p.isStar && "rotate-45")}
            style={{
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
              animation: staticOnly ? "none" : undefined,
              animationDuration: staticOnly ? undefined : `${p.twinkleDuration}s`,
              animationDelay: staticOnly ? undefined : `${p.delay * 0.7}s`,
              opacity: staticOnly ? 0.4 : undefined,
            }}
          />
        </span>
      ))}
    </div>
  );
}
