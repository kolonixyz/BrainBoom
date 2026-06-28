"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { useChat } from "@/hooks/useChat";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { WSMessage } from "@/types";

export function ChatRoom({ roomId: propRoomId }: { roomId?: number }) {
  const params = useParams();
  const roomId = propRoomId || Number(params.id);
  const { token, user } = useAuthContext();

  const { messages, isLoading, hasMore, loadMessages, sendChatMessage, handleWSMessage, retryFailedMessage } = useChat(roomId);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());

  const handleWS = useCallback((data: WSMessage) => {
    switch (data.type) {
      case "auth_success": {
        console.log("WS Auth success:", data.userId);
        break;
      }
      case "message": {
        if (data.tempId && data.senderId === user?.id) {
          handleWSMessage(data);
        } else if (data.senderId !== user?.id) {
          handleWSMessage(data);
        }
        break;
      }
      case "message_deleted": {
        handleWSMessage(data);
        break;
      }
      case "typing": {
        if (data.userId && data.isTyping !== undefined) {
          setTypingUsers((prev) => {
            const next = new Set(prev);
            if (data.isTyping) {
              next.add(data.userId!);
            } else {
              next.delete(data.userId!);
            }
            return next;
          });
        }
        break;
      }
      case "presence": {
        if (data.userId && data.status) {
          setOnlineUsers((prev) => {
            const next = new Set(prev);
            if (data.status === "online") {
              next.add(data.userId!);
            } else {
              next.delete(data.userId!);
            }
            return next;
          });
        }
        break;
      }
      case "system": {
        if (data.event === "chat_locked") {
          alert("Chat telah dikunci oleh developer.");
        }
        break;
      }
      case "error": {
        console.error("WS error:", data);
        break;
      }
    }
  }, [handleWSMessage, user?.id]);

  const { isConnected, sendMessage: wsSend, updatePresence } = useWebSocket({
    roomId,
    token,
    onMessage: handleWS,
  });

  // Update presence on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence("away");
      } else {
        updatePresence("online");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [updatePresence]);

  const handleSend = useCallback(
    async (content: string, type: "text" | "image" | "file" | "voice" = "text", fileUrl?: string) => {
      const tempId = crypto.randomUUID();

      const wsSent = wsSend({
        type: "message",
        content,
        messageType: type,
        fileUrl,
        tempId,
      });

      if (!wsSent) {
        await sendChatMessage(content, type, fileUrl);
      }
    },
    [wsSend, sendChatMessage]
  );

  const handleTyping = useCallback((isTyping: boolean) => {
    wsSend({
      type: "typing",
      isTyping,
    });
  }, [wsSend]);

  useEffect(() => {
    loadMessages();
  }, [roomId]);

  return (
    <div className="h-full flex flex-col">
      <ChatHeader 
        roomId={roomId} 
        isConnected={isConnected} 
        onlineUsers={onlineUsers}
      />
      <MessageList
        messages={messages}
        currentUserId={user?.id || -1}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={loadMessages}
        onRetry={retryFailedMessage}
      />
      <TypingIndicator typingUsers={Array.from(typingUsers)} />
      <ChatInput onSend={handleSend} onTyping={handleTyping} />
    </div>
  );
}
