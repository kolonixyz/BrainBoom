"use client";
import { useRef, useEffect } from "react";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { useChat, type ChatMessage } from "../../hooks/useChat";
import { cn } from "../../lib/utils";

interface ChatRoomProps {
    roomId: string | number;
    token: string;
    currentUserId: number;
    isAdmin: boolean;
    roomName: string;
    onBack: () => void;
    onDeleteMessage?: (id: number | string) => void;
}

export function ChatRoom({ roomId, token, currentUserId, isAdmin, roomName, onBack, onDeleteMessage }: ChatRoomProps) {
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const { messages, typingUsers, isLocked, lockMessage, wsStatus, sendMessage, sendTyping } = useChat(
        roomId, token, currentUserId
    );

    useEffect(() => {
        if (messages.length > 0) {
            virtuosoRef.current?.scrollToIndex({ index: messages.length - 1, behavior: "smooth" });
        }
    }, [messages.length]);

    const statusColor = wsStatus === "connected" ? "text-green-400" : wsStatus === "connecting" ? "text-yellow-400" : "text-red-400";
    const statusLabel = wsStatus === "connected" ? "Online" : wsStatus === "connecting" ? "Menghubungkan..." : "Offline";

    return (
        <div className="flex flex-col h-full bg-slate-900">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 border-b border-slate-700 safe-top">
                <button onClick={onBack} className="text-slate-400 hover:text-white text-xl p-1">←</button>
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate">{roomName}</div>
                    <div className={cn("text-xs", statusColor)}>{statusLabel}</div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden">
                <Virtuoso
                    ref={virtuosoRef}
                    data={messages}
                    style={{ height: "100%" }}
                    initialTopMostItemIndex={messages.length > 0 ? messages.length - 1 : 0}
                    followOutput="smooth"
                    itemContent={(_, msg: ChatMessage) => (
                        <div className="px-4">
                            <MessageBubble
                                key={msg.id}
                                id={msg.id}
                                content={msg.content}
                                senderName={msg.senderName}
                                senderAvatar={msg.senderAvatar}
                                type={msg.type}
                                fileUrl={msg.fileUrl}
                                createdAt={msg.createdAt}
                                isEdited={msg.isEdited}
                                deletedAt={msg.deletedAt}
                                isOwn={msg.senderId === currentUserId}
                                status={msg.status}
                                isAdmin={isAdmin}
                                onDelete={isAdmin && onDeleteMessage ? onDeleteMessage : undefined}
                            />
                        </div>
                    )}
                    components={{
                        Header: () => <div className="h-4" />,
                        Footer: () => (
                            <div className="px-4 pb-2 min-h-[24px]">
                                {typingUsers.length > 0 && (
                                    <div className="text-xs text-slate-400 animate-pulse">
                                        {typingUsers.map((u) => u.userName).join(", ")} sedang mengetik...
                                    </div>
                                )}
                            </div>
                        ),
                    }}
                />
            </div>

            {/* Lock overlay */}
            {isLocked && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-40">
                    <div className="text-center p-6 max-w-sm">
                        <div className="text-5xl mb-4">🔒</div>
                        <p className="text-white font-semibold text-lg mb-2">Chat Dikunci</p>
                        <p className="text-slate-300 text-sm">{lockMessage || "Chat sedang dalam maintenance."}</p>
                    </div>
                </div>
            )}

            {/* Input */}
            <ChatInput
                onSend={(content) => sendMessage(content)}
                onTyping={sendTyping}
                disabled={isLocked}
            />
        </div>
    );
}
