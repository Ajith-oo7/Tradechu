"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

export function Logo({ size = "md" }: LogoProps) {
  const sizes = {
    sm: { icon: 18, text: "text-lg" },
    md: { icon: 22, text: "text-xl" },
    lg: { icon: 28, text: "text-2xl" },
  };

  const s = sizes[size];

  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-pikachu shadow-lg shadow-pikachu/20 group-active:scale-95 transition-transform">
        <Zap size={s.icon} className="text-slate-deep fill-slate-deep" />
      </div>
      <span className={`font-bold tracking-tight ${s.text}`}>
        Trade<span className="text-pikachu">chu</span>
      </span>
    </Link>
  );
}
