"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, Calendar, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  const hideNav =
    pathname.startsWith("/messages/") && pathname !== "/messages";

  if (hideNav) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="mx-auto max-w-[430px]">
        <div className="glass mx-3 mb-3 rounded-2xl shadow-2xl shadow-black/40">
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center gap-0.5 px-4 py-1.5 min-w-[64px]"
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-pikachu/15 rounded-xl"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon
                    size={22}
                    className={cn(
                      "relative z-10 transition-colors",
                      isActive ? "text-pikachu" : "text-white/50"
                    )}
                  />
                  <span
                    className={cn(
                      "relative z-10 text-[10px] font-medium transition-colors",
                      isActive ? "text-pikachu" : "text-white/50"
                    )}
                  >
                    {item.label}
                  </span>
                  {item.href === "/messages" && (
                    <span className="absolute top-0.5 right-3 w-2 h-2 bg-pokeball rounded-full z-20" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
