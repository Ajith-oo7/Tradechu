"use client";

import { ReactNode } from "react";

interface BinderPageProps {
  children: ReactNode;
}

export function BinderPage({ children }: BinderPageProps) {
  return (
    <div className="binder-page rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
      <div className="binder-holes flex justify-center gap-6 py-2 bg-black/30">
        {[0, 1, 2].map((i) => (
          <div key={i} className="binder-hole" />
        ))}
      </div>
      <div className="binder-inner">{children}</div>
    </div>
  );
}
