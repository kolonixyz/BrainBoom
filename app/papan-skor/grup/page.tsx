"use client";

import { ChatRoom } from "@/components/chat/ChatRoom";

export default function GrupPage() {
  return (
    <div className="flex-1 overflow-hidden">
      <ChatRoom roomId={1} />
    </div>
  );
}
