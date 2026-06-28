"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

export function DevMenu() {
  return (
    <div className="fixed top-20 right-4 z-40">
      <Link
        href="/papan-skor/admin-panel/"
        className="flex items-center gap-2 bg-surface border border-primary/30 rounded-xl px-3 py-2 text-xs text-primary shadow-lg hover:bg-primary/10 transition-all"
      >
        <Shield className="w-3 h-3" />
        Dev Panel
      </Link>
    </div>
  );
}
