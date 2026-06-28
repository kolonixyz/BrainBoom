"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";

const TABS = [
    { href: "/papan-skor/peringkat", label: "Personal", emoji: "👤" },
    { href: "/papan-skor/grup", label: "Grup", emoji: "👥" },
    { href: "/papan-skor/misi", label: "Misi", emoji: "📅" },
];

export function TabNav() {
    const pathname = usePathname();

    return (
        <nav className="bg-slate-800 border-t border-slate-700 safe-bottom">
            <div className="flex">
                {TABS.map((tab) => {
                    const isActive = pathname.startsWith(tab.href);
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                "flex-1 flex flex-col items-center gap-0.5 py-2.5 px-1 text-xs font-medium transition-colors",
                                isActive ? "text-blue-400" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <span className="text-xl">{tab.emoji}</span>
                            <span>{tab.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
