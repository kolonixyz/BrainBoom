"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Shield, BarChart3, Lock, Users, MessageSquare } from "lucide-react";

export default function AdminPanelPage() {
  const { isDeveloper } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isDeveloper()) {
      router.push("/papan-skor/peringkat/");
    }
  }, [isDeveloper, router]);

  if (!isDeveloper()) return null;

  return (
    <div className="h-full overflow-y-auto chat-scrollbar p-4 space-y-4">
      <h1 className="text-lg font-bold text-text">Developer Dashboard</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center space-y-1">
          <Users className="w-6 h-6 text-primary mx-auto" />
          <p className="text-2xl font-bold text-text">0</p>
          <p className="text-xs text-text-muted">Online Users</p>
        </div>
        <div className="card text-center space-y-1">
          <MessageSquare className="w-6 h-6 text-success mx-auto" />
          <p className="text-2xl font-bold text-text">0</p>
          <p className="text-xs text-text-muted">Messages Today</p>
        </div>
      </div>

      <div className="card space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-error" />
          <h3 className="text-sm font-semibold text-text">Kunci Chat</h3>
        </div>
        <p className="text-xs text-text-muted">
          Matikan akses chat untuk semua user (kecuali developer).
        </p>
        <button
          onClick={() => {
            alert("Fitur ini akan mengirim command ke WebSocket");
          }}
          className="w-full p-3 rounded-xl bg-error/10 text-error hover:bg-error/20 transition-colors flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4" />
          Kunci Chat Sekarang
        </button>
      </div>
    </div>
  );
}
