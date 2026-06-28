"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Users, FolderKanban } from "lucide-react";

const tabs = [
  { href: "/papan-skor/peringkat/", label: "Peringkat", icon: MessageSquare },
  { href: "/papan-skor/grup/", label: "Grup", icon: Users },
  { href: "/papan-skor/misi/", label: "Misi", icon: FolderKanban },
];

export function TabNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-surface border-t border-surface-light px-2 py-2">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive ? "text-primary" : "text-text-muted hover:text-text"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
