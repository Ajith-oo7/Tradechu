"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  rightElement?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  showBack,
  backHref = "/",
  rightElement,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("flex items-center justify-between px-4 py-3", className)}>
      <div className="flex items-center gap-3 min-w-0">
        {showBack && (
          <Link
            href={backHref}
            className="flex items-center justify-center w-9 h-9 rounded-xl glass active:scale-95 transition-transform shrink-0"
          >
            <ArrowLeft size={18} />
          </Link>
        )}
        {title && (
          <h1 className="text-lg font-bold truncate">{title}</h1>
        )}
      </div>
      {rightElement && <div className="shrink-0">{rightElement}</div>}
    </header>
  );
}
