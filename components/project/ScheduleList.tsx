"use client";

import { useEffect, useState } from "react";
import { Schedule } from "@/types";
import { getSchedules } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { Calendar, Clock, AlertCircle, CheckCircle2, Circle, Loader2 } from "lucide-react";

const statusConfig = {
  pending: { label: "Pending", color: "text-text-muted", icon: Circle },
  in_progress: { label: "Berjalan", color: "text-info", icon: Clock },
  urgent: { label: "Urgent", color: "text-error", icon: AlertCircle },
  completed: { label: "Selesai", color: "text-success", icon: CheckCircle2 },
};

export function ScheduleList() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setIsLoading(true);
      const data = await getSchedules(filter === "all" ? undefined : filter);
      setSchedules(data.schedules);
    } catch (e) {
      console.error("Failed to load schedules:", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto chat-scrollbar p-4 space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", "pending", "in_progress", "urgent", "completed"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === status ? "bg-primary text-white" : "bg-surface-light text-text-muted"
            }`}
          >
            {status === "all" ? "Semua" : statusConfig[status as keyof typeof statusConfig]?.label || status}
          </button>
        ))}
      </div>

      {schedules.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-text-muted mx-auto mb-2" />
          <p className="text-text-muted">Belum ada jadwal</p>
        </div>
      ) : (
        schedules.map((schedule) => {
          const config = statusConfig[schedule.status];
          const StatusIcon = config.icon;

          return (
            <div key={schedule.id} className="card space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-text">{schedule.title}</h3>
                  <p className="text-xs text-primary">{schedule.projectName}</p>
                </div>
                <span className={`flex items-center gap-1 text-xs ${config.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {config.label}
                </span>
              </div>
              <p className="text-xs text-text-muted">{schedule.description}</p>
              <div className="flex items-center gap-1 text-xs text-text-muted">
                <Clock className="w-3 h-3" />
                {formatDateTime(schedule.scheduledAt)}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
