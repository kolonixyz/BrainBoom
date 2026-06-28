"use client";

import { useEffect, useState } from "react";
import { getRooms } from "@/lib/api";
import { Room } from "@/types";
import { ArrowLeft, Wifi, WifiOff, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChatHeaderProps {
  roomId: number;
  isConnected: boolean;
  onlineUsers?: Set<number>;
}

export function ChatHeader({ roomId, isConnected, onlineUsers }: ChatHeaderProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadRoom();
  }, [roomId]);

  const loadRoom = async () => {
    try {
      const data = await getRooms();
      const found = data.rooms.find((r) => r.id === roomId);
      if (found) setRoom(found);
    } catch (e) {
      console.error("Failed to load room:", e);
    }
  };

  return (
    <div className="bg-surface border-b border-surface-light px-4 py-3 flex items-center gap-3">
      <button onClick={() => router.back()} className="btn-ghost -ml-2">
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold text-text truncate">{room?.name || "Chat"}</h2>
        <div className="flex items-center gap-1 text-[10px] text-text-muted">
          {isConnected ? (
            <>
              <Wifi className="w-3 h-3 text-success" />
              <span>Online</span>
              {onlineUsers && onlineUsers.size > 0 && (
                <span className="text-primary">({onlineUsers.size} online)</span>
              )}
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-error" />
              <span>Connecting...</span>
            </>
          )}
        </div>
      </div>

      {room?.type === "ruang_umum" && (
        <div className="flex items-center gap-1 text-text-muted">
          <Users className="w-4 h-4" />
          <span className="text-xs">{room.members?.length || 0}</span>
        </div>
      )}
    </div>
  );
}
