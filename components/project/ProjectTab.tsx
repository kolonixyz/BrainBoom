"use client";

import { useState } from "react";
import { ScheduleList } from "./ScheduleList";
import { NoteList } from "./NoteList";
import { CalendarDays, FileText } from "lucide-react";

type SubTab = "jadwal" | "catatan";

export function ProjectTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("jadwal");

  return (
    <div className="h-full flex flex-col">
      <div className="flex border-b border-surface-light">
        <button
          onClick={() => setActiveSubTab("jadwal")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeSubTab === "jadwal" ? "text-primary border-b-2 border-primary" : "text-text-muted"
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          Jadwal
        </button>
        <button
          onClick={() => setActiveSubTab("catatan")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeSubTab === "catatan" ? "text-primary border-b-2 border-primary" : "text-text-muted"
          }`}
        >
          <FileText className="w-4 h-4" />
          Catatan
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeSubTab === "jadwal" ? <ScheduleList /> : <NoteList />}
      </div>
    </div>
  );
}
