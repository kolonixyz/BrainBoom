"use client";

import { Message } from "@/types";
import { formatTime } from "@/lib/utils";
import { Check, CheckCheck, Clock, AlertCircle, Trash2, RefreshCw } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onRetry?: (tempId: string) => void;
}

export function MessageBubble({ message, isOwn, onRetry }: MessageBubbleProps) {
  const { isAdmin } = useAuthContext();
  const isDeleted = !!message.deletedAt;
  const isFailed = message.status === "error";

  const getStatusIcon = () => {
    if (message.status === "sending") return <Clock className="w-3 h-3 text-text-muted" />;
    if (isFailed) return <AlertCircle className="w-3 h-3 text-error" />;
    if (isOwn) return <CheckCheck className="w-3 h-3 text-primary" />;
    return null;
  };

  const handleDelete = async () => {
    if (!isAdmin() || isDeleted) return;
    if (!confirm("Hapus pesan ini?")) return;
    try {
      const { deleteMessage } = await import("@/lib/api");
      await deleteMessage(message.id);
    } catch (e) {
      console.error("Failed to delete message:", e);
    }
  };

  const handleRetry = () => {
    if (isFailed && message.tempId && onRetry) {
      onRetry(message.tempId);
    }
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] ${
          isDeleted
            ? "bg-surface-light/50 italic text-text-muted/50"
            : isOwn
            ? "bg-primary/20 rounded-2xl rounded-tr-sm"
            : "bg-surface-light rounded-2xl rounded-tl-sm"
        } px-4 py-2.5 relative group`}
      >
        {/* Sender name for group chat */}
        {!isOwn && !isDeleted && (
          <p className="text-[10px] text-primary font-medium mb-1">{message.senderName}</p>
        )}

        {/* Content */}
        <p className={`text-sm ${isDeleted ? "line-through" : "text-text"}`}>
          {isDeleted ? "🗑️ Pesan telah dihapus admin" : message.content}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] text-text-muted/50">
            {formatTime(message.createdAt)}
          </span>
          {getStatusIcon()}
        </div>

        {/* Retry button for failed messages */}
        {isFailed && isOwn && (
          <button
            onClick={handleRetry}
            className="absolute -top-2 -right-2 w-6 h-6 bg-warning rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            title="Retry"
          >
            <RefreshCw className="w-3 h-3 text-white" />
          </button>
        )}

        {/* Admin delete button */}
        {isAdmin() && !isDeleted && !isFailed && (
          <button
            onClick={handleDelete}
            className="absolute -top-2 -right-2 w-6 h-6 bg-error rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-3 h-3 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}
