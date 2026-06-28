"use client";
import { useState, useCallback, useRef } from "react";
import { useWebSocket } from "./useWebSocket";
import { apiRequest } from "../lib/utils";

export interface ChatMessage {
    id: number | string;
    tempId?: string;
    senderId: number;
    senderName: string;
    senderAvatar: string;
    content: string | null;
    type: "text" | "image" | "file" | "voice";
    fileUrl: string | null;
    replyTo: number | null;
    isEdited: boolean;
    deletedAt: string | null;
    createdAt: string;
    status?: "sending" | "sent" | "error";
}

interface TypingUser {
    userId: number;
    userName: string;
    isTyping: boolean;
}

export function useChat(roomId: string | number, token: string, currentUserId: number) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const [isLocked, setIsLocked] = useState(false);
    const [lockMessage, setLockMessage] = useState("");
    const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleWSMessage = useCallback((data: Record<string, unknown>) => {
        switch (data.type) {
            case "history":
                setMessages((data.messages as ChatMessage[]) ?? []);
                break;
            case "message":
                setMessages((prev) => {
                    const filtered = prev.filter((m) => m.tempId !== (data.tempId as string));
                    return [...filtered, { ...(data as unknown as ChatMessage), status: "sent" }];
                });
                break;
            case "message_deleted":
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === data.messageId
                            ? { ...m, deletedAt: data.timestamp as string, content: null }
                            : m
                    )
                );
                break;
            case "typing":
                setTypingUsers((prev) => {
                    const filtered = prev.filter((u) => u.userId !== (data.userId as number));
                    if (data.isTyping) {
                        return [...filtered, { userId: data.userId as number, userName: data.userName as string, isTyping: true }];
                    }
                    return filtered;
                });
                break;
            case "system":
                if (data.event === "chat_locked") {
                    setIsLocked(true);
                    setLockMessage(data.message as string);
                } else if (data.event === "chat_unlocked") {
                    setIsLocked(false);
                    setLockMessage("");
                }
                break;
        }
    }, []);

    const { status, send, isConnected } = useWebSocket({
        roomId,
        token,
        onMessage: handleWSMessage,
        enabled: Boolean(roomId && token),
    });

    const sendMessage = useCallback(async (
        content: string,
        type: "text" | "image" | "file" | "voice" = "text",
        fileUrl?: string,
        replyTo?: number
    ) => {
        const tempId = `temp-${Date.now()}-${Math.random()}`;
        const optimistic: ChatMessage = {
            id: tempId,
            tempId,
            senderId: currentUserId,
            senderName: "Me",
            senderAvatar: `https://i.pravatar.cc/150?u=${currentUserId}`,
            content,
            type,
            fileUrl: fileUrl ?? null,
            replyTo: replyTo ?? null,
            isEdited: false,
            deletedAt: null,
            createdAt: new Date().toISOString(),
            status: "sending",
        };

        setMessages((prev) => [...prev, optimistic]);

        const sent = send({ type: "message", content, messageType: type, fileUrl, replyTo, tempId });

        if (!sent) {
            // Fallback to HTTP
            try {
                await apiRequest("/api/messages", {
                    method: "POST",
                    body: JSON.stringify({ roomId: Number(roomId), content, type, fileUrl, replyTo }),
                }, token);
                setMessages((prev) => prev.map((m) => m.tempId === tempId ? { ...m, status: "sent" } : m));
            } catch {
                setMessages((prev) => prev.map((m) => m.tempId === tempId ? { ...m, status: "error" } : m));
            }
        }
    }, [send, currentUserId, roomId, token]);

    const sendTyping = useCallback((isTyping: boolean) => {
        send({ type: "typing", isTyping });
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        if (isTyping) {
            typingTimeout.current = setTimeout(() => send({ type: "typing", isTyping: false }), 3000);
        }
    }, [send]);

    return {
        messages,
        typingUsers,
        isLocked,
        lockMessage,
        wsStatus: status,
        isConnected,
        sendMessage,
        sendTyping,
    };
}
