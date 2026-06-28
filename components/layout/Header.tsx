"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { getInitials } from "@/lib/utils";
import { Settings } from "lucide-react";
import Link from "next/link";

export function Header() {
  const { user } = useAuthContext();

  return (
    <header className="bg-surface border-b border-surface-light px-4 py-3">
      <div className="flex items-center justify-between">
        <Link href="/papan-skor/peringkat/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">BB</span>
          </div>
          <span className="font-semibold text-text">Papan Skor</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/papan-skor/pengaturan/"
            className="btn-ghost"
          >
            <Settings className="w-5 h-5" />
          </Link>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(user?.displayName || "?")
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
