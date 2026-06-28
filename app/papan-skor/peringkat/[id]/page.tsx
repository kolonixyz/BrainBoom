"use client";

import { ChatRoom } from "@/components/chat/ChatRoom";

export default function ChatRoomPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex-1 overflow-hidden">
      <ChatRoom roomId={Number(params.id)} />
    </div>
  );
}
