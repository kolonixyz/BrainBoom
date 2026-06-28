"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { apiRequest } from "../../lib/utils";
import { cn } from "../../lib/utils";

interface Schedule {
    id: number;
    title: string;
    description: string | null;
    projectName: string;
    scheduledAt: string;
    status: "pending" | "in_progress" | "urgent" | "completed";
    creatorName: string;
}

type Filter = "all" | "pending" | "in_progress" | "urgent" | "completed";

const STATUS_COLORS = {
    pending: "bg-slate-600 text-slate-200",
    in_progress: "bg-blue-600/30 text-blue-300",
    urgent: "bg-red-600/30 text-red-300",
    completed: "bg-green-600/30 text-green-300",
};

const STATUS_LABELS = {
    pending: "Pending", in_progress: "In Progress", urgent: "🔥 Urgent", completed: "✅ Selesai",
};

export function ScheduleList() {
    const { token } = useAuth();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [filter, setFilter] = useState<Filter>("all");
    const [isLoading, setIsLoading] = useState(true);

    const load = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const data = await apiRequest<{ schedules: Schedule[] }>(
                filter === "all" ? "/api/schedules" : `/api/schedules?status=${filter}`,
                {}, token
            );
            setSchedules(data.schedules);
        } catch { /* ignore */ } finally {
            setIsLoading(false);
        }
    }, [token, filter]);

    useEffect(() => { load(); }, [load]);

    const FILTERS: Filter[] = ["all", "pending", "in_progress", "urgent", "completed"];

    return (
        <div className="p-4 flex flex-col gap-4">
            {/* Filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {FILTERS.map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                            "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                            filter === f ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        )}
                    >
                        {f === "all" ? "Semua" : STATUS_LABELS[f]}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-slate-800 rounded-2xl animate-pulse" />)}
                </div>
            ) : schedules.length === 0 ? (
                <div className="text-center text-slate-500 py-16">
                    <div className="text-4xl mb-2">📅</div>
                    <p>Belum ada jadwal</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {schedules.map((s) => (
                        <div key={s.id} className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-white text-sm truncate">{s.title}</div>
                                    <div className="text-xs text-blue-400 mt-0.5">{s.projectName}</div>
                                </div>
                                <span className={cn("text-xs px-2 py-1 rounded-full flex-shrink-0", STATUS_COLORS[s.status])}>
                                    {STATUS_LABELS[s.status]}
                                </span>
                            </div>
                            {s.description && (
                                <p className="text-xs text-slate-400 mt-2 line-clamp-2">{s.description}</p>
                            )}
                            <div className="flex items-center justify-between mt-3">
                                <span className="text-xs text-slate-500">📅 {new Date(s.scheduledAt).toLocaleDateString("id-ID")}</span>
                                <span className="text-xs text-slate-500">👤 {s.creatorName}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
