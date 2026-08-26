"use client";

import { Logo } from "@/components/shared/Logo";
import { Avatar } from "@/components/shared/Avatar";
import { useApp } from "@/providers/AppProvider";

export function ProfileHeader() {
  const { username, avatar, avatarGradient } = useApp();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Logo size="md" />
        <Avatar letter={avatar} gradient={avatarGradient} size="md" />
      </div>

      <div>
        <p className="text-sm text-pikachu font-semibold">Welcome back Trainer</p>
        <h1 className="text-xl font-bold">@{username}</h1>
        <p className="text-xs text-white/40 mt-0.5">Find Your Next Trade</p>
      </div>
    </div>
  );
}
