"use client";

import { useRef, useEffect } from "react";
import { Virtuoso } from "react-virtuoso";
import { Message } from "@/types";
import { MessageBubble } from "./MessageBubble";
import { Loader2 } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  currentUserId: number;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onRetry?: (tempId: string) => void;
}

export function MessageList({ messages, currentUserId, isLoading, hasMore, onLoadMore, onRetry }: MessageListProps) {
  const virtuosoRef = useRef<any>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive from current user
    if (virtuosoRef.current && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.senderId === currentUserId || lastMessage.status === "sending") {
        virtuosoRef.current.scrollToIndex({
          index: messages.length - 1,
          behavior: "smooth",
        });
      }
    }
  }, [messages.length, currentUserId]);

  const handleStartReached = () => {
    if (hasMore && !isLoading) {
      onLoadMore();
    }
  };

  return (
    <div className="flex-1 overflow-hidden">
      <Virtuoso
        ref={virtuosoRef}
        data={messages}
        followOutput="auto"
        atTopStateChange={(atTop) => {
          if (atTop) handleStartReached();
        }}
        components={{
          Header: () =>
            isLoading && hasMore ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
              </div>
            ) : null,
        }}
        itemContent={(index, message) => (
          <div className="px-4 py-1">
            <MessageBubble
              message={message}
              isOwn={message.senderId === currentUserId}
              onRetry={onRetry}
            />
          </div>
        )}
        className="h-full"
      />
    </div>
  );
}
