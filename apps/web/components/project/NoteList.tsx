"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { apiRequest, formatRelativeTime, truncate } from "../../lib/utils";

interface Note {
    id: number;
    title: string;
    content: string;
    tags: string[];
    creatorName: string;
    updatedAt: string;
}

export function NoteList() {
    const { token } = useAuth();
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const load = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const data = await apiRequest<{ notes: Note[] }>("/api/notes", {}, token);
            setNotes(data.notes);
        } catch { /* ignore */ } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => { load(); }, [load]);

    return (
        <div className="p-4 flex flex-col gap-3">
            {isLoading ? (
                [1, 2, 3].map((i) => <div key={i} className="h-24 bg-slate-800 rounded-2xl animate-pulse" />)
            ) : notes.length === 0 ? (
                <div className="text-center text-slate-500 py-16">
                    <div className="text-4xl mb-2">📝</div>
                    <p>Belum ada catatan</p>
                </div>
            ) : notes.map((n) => (
                <div key={n.id} className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                    <div className="font-semibold text-white text-sm mb-1">{n.title}</div>
                    <p className="text-xs text-slate-400 mb-2 line-clamp-2">{truncate(n.content, 150)}</p>
                    {n.tags?.length > 0 && (
                        <div className="flex gap-1 flex-wrap mb-2">
                            {n.tags.map((tag: string) => (
                                <span key={tag} className="text-xs bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded-full">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>👤 {n.creatorName}</span>
                        <span>{formatRelativeTime(n.updatedAt)}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
