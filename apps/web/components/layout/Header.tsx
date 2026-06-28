"use client";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";

interface HeaderProps {
    title?: string;
    showBack?: boolean;
    showSettings?: boolean;
}

export function Header({ title = "BrainBoom", showSettings = true }: HeaderProps) {
    const { user } = useAuth();

    return (
        <header className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 safe-top">
            <div className="flex items-center gap-3">
                {user && (
                    <img
                        src={user.avatarUrl}
                        alt={user.displayName}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                )}
                <div>
                    <div className="text-white font-semibold text-sm leading-tight">{user?.displayName ?? title}</div>
                    {user && (
                        <div className={cn(
                            "text-xs capitalize",
                            user.role === "developer" ? "text-purple-400" : user.role === "admin" ? "text-yellow-400" : "text-slate-400"
                        )}>
                            {user.role}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {user?.role === "developer" && (
                    <Link href="/papan-skor/admin-panel" className="text-purple-400 text-lg p-1" title="Dev Dashboard">
                        🛸
                    </Link>
                )}
                {showSettings && (
                    <Link href="/papan-skor/pengaturan" className="text-slate-400 hover:text-white text-lg p-1">
                        ⚙️
                    </Link>
                )}
            </div>
        </header>
    );
}
