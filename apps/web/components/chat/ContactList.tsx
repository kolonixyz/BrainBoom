"use client";
import { formatRelativeTime, truncate } from "../../lib/utils";

interface Contact {
    id: number;
    displayName: string;
    avatarUrl: string;
    role: string;
    roomId: number;
    lastMessage: { content: string; createdAt: string } | null;
    unreadCount: number;
}

interface ContactListProps {
    contacts: Contact[];
    onSelect: (roomId: number, displayName: string) => void;
    isLoading?: boolean;
}

export function ContactList({ contacts, onSelect, isLoading }: ContactListProps) {
    if (isLoading) {
        return (
            <div className="flex flex-col gap-2 p-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 items-center p-3 rounded-2xl bg-slate-800/50 animate-pulse">
                        <div className="w-12 h-12 rounded-full bg-slate-700 flex-shrink-0" />
                        <div className="flex-1">
                            <div className="h-4 bg-slate-700 rounded w-1/3 mb-2" />
                            <div className="h-3 bg-slate-700 rounded w-2/3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (contacts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 py-16">
                <div className="text-4xl mb-2">💬</div>
                <p>Belum ada kontak</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col overflow-y-auto">
            {contacts.map((c) => (
                <button
                    key={c.id}
                    onClick={() => onSelect(c.roomId, c.displayName)}
                    className="flex gap-3 items-center px-4 py-3 hover:bg-slate-800/50 active:bg-slate-800 transition-colors text-left"
                >
                    <div className="relative flex-shrink-0">
                        <img src={c.avatarUrl} alt={c.displayName} className="w-12 h-12 rounded-full object-cover" />
                        {c.role === "admin" && (
                            <span className="absolute -bottom-0.5 -right-0.5 text-xs">⭐</span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline gap-2">
                            <span className="font-semibold text-white text-sm truncate">{c.displayName}</span>
                            {c.lastMessage && (
                                <span className="text-xs text-slate-500 flex-shrink-0">
                                    {formatRelativeTime(c.lastMessage.createdAt)}
                                </span>
                            )}
                        </div>
                        <div className="flex justify-between items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-400 truncate">
                                {c.lastMessage ? truncate(c.lastMessage.content, 40) : "Belum ada pesan"}
                            </span>
                            {c.unreadCount > 0 && (
                                <span className="flex-shrink-0 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                    {c.unreadCount > 9 ? "9+" : c.unreadCount}
                                </span>
                            )}
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
}
