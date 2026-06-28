"use client";
import { useEffect, useState, useCallback } from "react";
import { AppContainer } from "../../../components/layout/AppContainer";
import { useAuth } from "../../../hooks/useAuth";
import { apiRequest } from "../../../lib/utils";

interface Stats {
    totalUsers: number; totalMessages: number; totalRooms: number;
    totalSchedules: number; totalNotes: number; timestamp: string;
}

export default function AdminPanelPage() {
    const { token } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lockMsg, setLockMsg] = useState("");
    const [isSending, setIsSending] = useState(false);

    const load = useCallback(async () => {
        if (!token) return;
        try { const d = await apiRequest<{ stats: Stats }>("/api/settings/dev-stats", {}, token); setStats(d.stats); }
        catch { /* ignore */ } finally { setIsLoading(false); }
    }, [token]);

    useEffect(() => { load(); }, [load]);

    const sendCommand = async (action: "lock" | "unlock") => {
        if (!token) return;
        setIsSending(true);
        try {
            const ruId = (await apiRequest<{ rooms: { id: number; type: string }[] }>("/api/rooms", {}, token))
                .rooms.find((r) => r.type === "ruang_umum")?.id;
            if (ruId) {
                await fetch(`${process.env.NEXT_PUBLIC_WS_URL ?? ""}/ws/${ruId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ action, message: lockMsg }),
                });
            }
        } catch { /* ignore */ } finally { setIsSending(false); }
    };

    return (
        <AppContainer requiredRole="developer">
            <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🛸</span>
                    <h1 className="text-white font-bold text-lg">Developer Dashboard</h1>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    {isLoading ? ([1,2,3,4].map(i => <div key={i} className="h-20 bg-slate-800 rounded-2xl animate-pulse" />)) :
                    stats ? [
                        { label: "Users", value: stats.totalUsers, emoji: "👤" },
                        { label: "Messages", value: stats.totalMessages, emoji: "💬" },
                        { label: "Rooms", value: stats.totalRooms, emoji: "🚪" },
                        { label: "Schedules", value: stats.totalSchedules, emoji: "📅" },
                    ].map(({ label, value, emoji }) => (
                        <div key={label} className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
                            <div className="text-2xl mb-1">{emoji}</div>
                            <div className="text-2xl font-bold text-white">{value}</div>
                            <div className="text-xs text-slate-400">{label}</div>
                        </div>
                    )) : null}
                </div>

                {/* Chat lock */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
                    <div className="text-white font-semibold mb-3">🔒 Kunci Chat</div>
                    <input
                        value={lockMsg}
                        onChange={(e) => setLockMsg(e.target.value)}
                        placeholder="Pesan maintenance..."
                        className="w-full bg-slate-700 text-white text-sm px-3 py-2 rounded-xl outline-none mb-3 placeholder-slate-400"
                    />
                    <div className="flex gap-2">
                        <button onClick={() => sendCommand("lock")} disabled={isSending}
                            className="flex-1 bg-red-600/30 text-red-300 py-2 rounded-xl text-sm hover:bg-red-600/50 transition-colors disabled:opacity-50">
                            {isSending ? "..." : "🔒 Kunci"}
                        </button>
                        <button onClick={() => sendCommand("unlock")} disabled={isSending}
                            className="flex-1 bg-green-600/30 text-green-300 py-2 rounded-xl text-sm hover:bg-green-600/50 transition-colors disabled:opacity-50">
                            {isSending ? "..." : "🔓 Buka"}
                        </button>
                    </div>
                </div>

                {stats && (
                    <div className="text-xs text-slate-500 text-center">
                        Last updated: {new Date(stats.timestamp).toLocaleTimeString("id-ID")}
                    </div>
                )}
            </div>
        </AppContainer>
    );
}
