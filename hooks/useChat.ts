"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Message, WSMessage } from "@/types";
import { sendMessage as apiSendMessage, getMessages } from "@/lib/api";

interface QueuedMessage {
  tempId: string;
  roomId: number;
  content: string;
  type: "text" | "image" | "file" | "voice";
  fileUrl?: string;
  timestamp: number;
  retries: number;
}

export function useChat(roomId: number) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const cursorRef = useRef<string | null>(null);
  const pendingMessages = useRef<Map<string, Message>>(new Map());
  const offlineQueue = useRef<QueuedMessage[]>([]);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Auto-sync offline queue periodically
  useEffect(() => {
    if (isOnline && offlineQueue.current.length > 0) {
      syncIntervalRef.current = setInterval(() => {
        syncOfflineQueue();
      }, 5000);
    }
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isOnline]);

  const syncOfflineQueue = useCallback(async () => {
    if (!isOnline || offlineQueue.current.length === 0) return;

    const queue = [...offlineQueue.current];
    offlineQueue.current = [];

    for (const queued of queue) {
      try {
        await apiSendMessage(queued.roomId, queued.content, queued.type, queued.fileUrl);
      } catch (e) {
        // Re-queue if failed
        if (queued.retries < 3) {
          offlineQueue.current.push({ ...queued, retries: queued.retries + 1 });
        }
      }
    }
  }, [isOnline]);

  const loadMessages = useCallback(async () => {
    if (isLoading || !hasMore) return;

    try {
      setIsLoading(true);
      const data = await getMessages(roomId, cursorRef.current || undefined);

      setMessages((prev) => {
        const newMessages = data.messages.filter(
          (m) => !prev.some((p) => p.id === m.id)
        );
        return [...newMessages, ...prev];
      });

      cursorRef.current = data.nextCursor;
      setHasMore(!!data.nextCursor);
    } catch (e) {
      console.error("Failed to load messages:", e);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, isLoading, hasMore]);

  const sendChatMessage = useCallback(
    async (content: string, type: "text" | "image" | "file" | "voice" = "text", fileUrl?: string) => {
      const tempId = crypto.randomUUID();
      const optimisticMsg: Message = {
        id: -1,
        roomId,
        senderId: -1,
        senderName: "Anda",
        content,
        type,
        fileUrl,
        isEdited: false,
        createdAt: new Date().toISOString(),
        tempId,
        status: "sending",
      };

      // Optimistic update
      setMessages((prev) => [...prev, optimisticMsg]);
      pendingMessages.current.set(tempId, optimisticMsg);

      // If offline, queue for later
      if (!isOnline) {
        offlineQueue.current.push({
          tempId,
          roomId,
          content,
          type,
          fileUrl,
          timestamp: Date.now(),
          retries: 0,
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.tempId === tempId ? { ...m, status: "error" as const } : m
          )
        );
        return;
      }

      try {
        const data = await apiSendMessage(roomId, content, type, fileUrl);

        setMessages((prev) =>
          prev.map((m) =>
            m.tempId === tempId ? { ...data, status: "sent" as const } : m
          )
        );
        pendingMessages.current.delete(tempId);
      } catch (e) {
        // Queue for retry
        offlineQueue.current.push({
          tempId,
          roomId,
          content,
          type,
          fileUrl,
          timestamp: Date.now(),
          retries: 0,
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.tempId === tempId ? { ...m, status: "error" as const } : m
          )
        );
      }
    },
    [roomId, isOnline]
  );

  const handleWSMessage = useCallback((data: WSMessage) => {
    switch (data.type) {
      case "message": {
        if (data.tempId && pendingMessages.current.has(data.tempId)) {
          // Match optimistic message
          setMessages((prev) =>
            prev.map((m) =>
              m.tempId === data.tempId
                ? {
                    ...m,
                    id: data.id!,
                    senderId: data.senderId!,
                    senderName: data.senderName!,
                    createdAt: data.createdAt!,
                    status: "sent" as const,
                  }
                : m
            )
          );
          pendingMessages.current.delete(data.tempId);
        } else {
          // New message from other user
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.id)) return prev;
            return [
              ...prev,
              {
                id: data.id!,
                roomId: data.roomId || roomId,
                senderId: data.senderId!,
                senderName: data.senderName!,
                content: data.content!,
                type: data.messageType || "text",
                fileUrl: data.fileUrl,
                replyTo: data.replyTo,
                isEdited: false,
                createdAt: data.createdAt!,
                status: "sent" as const,
              },
            ];
          });
        }
        break;
      }

      case "message_deleted": {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === data.messageId
              ? {
                  ...m,
                  content: "🗑️ Pesan telah dihapus admin",
                  deletedAt: data.timestamp || new Date().toISOString(),
                  deletedBy: data.deletedBy,
                }
              : m
          )
        );
        break;
      }

      case "typing": {
        // Handled by parent component
        break;
      }

      case "presence": {
        // Handled by parent component
        break;
      }

      case "system": {
        // System messages (user_joined/user_left/chat_locked)
        break;
      }

      case "error": {
        console.error("WS error:", data);
        break;
      }
    }
  }, [roomId]);

  const retryFailedMessage = useCallback((tempId: string) => {
    const queued = offlineQueue.current.find((q) => q.tempId === tempId);
    if (!queued) return;

    // Remove from queue and retry
    offlineQueue.current = offlineQueue.current.filter((q) => q.tempId !== tempId);

    setMessages((prev) =>
      prev.map((m) =>
        m.tempId === tempId ? { ...m, status: "sending" as const } : m
      )
    );

    sendChatMessage(queued.content, queued.type, queued.fileUrl);
  }, [sendChatMessage]);

  return {
    messages,
    isLoading,
    hasMore,
    isOnline,
    loadMessages,
    sendChatMessage,
    handleWSMessage,
    retryFailedMessage,
    setMessages,
  };
}
