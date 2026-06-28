"use client";
import { useState } from "react";
import { ScheduleList } from "./ScheduleList";
import { NoteList } from "./NoteList";
import { cn } from "../../lib/utils";

export function ProjectTab() {
    const [tab, setTab] = useState<"jadwal" | "catatan">("jadwal");

    return (
        <div className="flex flex-col h-full bg-slate-900">
            {/* Sub-tab toggle */}
            <div className="flex bg-slate-800 border-b border-slate-700">
                {(["jadwal", "catatan"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={cn(
                            "flex-1 py-3 text-sm font-medium capitalize transition-colors",
                            tab === t ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-500"
                        )}
                    >
                        {t === "jadwal" ? "📅 Jadwal" : "📝 Catatan"}
                    </button>
                ))}
            </div>
            <div className="flex-1 overflow-y-auto">
                {tab === "jadwal" ? <ScheduleList /> : <NoteList />}
            </div>
        </div>
    );
}
