"use client";
import { cn } from "../../lib/utils";
import { formatTime } from "../../lib/utils";

interface MessageBubbleProps {
    id: number | string;
    content: string | null;
    senderName: string;
    senderAvatar: string;
    type: "text" | "image" | "file" | "voice";
    fileUrl: string | null;
    createdAt: string;
    isEdited: boolean;
    deletedAt: string | null;
    isOwn: boolean;
    status?: "sending" | "sent" | "error";
    isAdmin: boolean;
    onDelete?: (id: number | string) => void;
    replyTo?: number | null;
}

export function MessageBubble({
    id, content, senderName, senderAvatar, type, fileUrl,
    createdAt, isEdited, deletedAt, isOwn, status, isAdmin, onDelete,
}: MessageBubbleProps) {
    if (deletedAt) {
        return (
            <div className={cn("flex gap-2 mb-2", isOwn ? "flex-row-reverse" : "flex-row")}>
                <div className="text-slate-500 text-sm italic py-2 px-3">
                    🗑️ Pesan telah dihapus admin
                </div>
            </div>
        );
    }

    return (
        <div className={cn("flex gap-2 mb-2 group", isOwn ? "flex-row-reverse" : "flex-row")}>
            {!isOwn && (
                <img
                    src={senderAvatar}
                    alt={senderName}
                    className="w-8 h-8 rounded-full flex-shrink-0 mt-auto"
                />
            )}
            <div className={cn("max-w-[75%] flex flex-col", isOwn ? "items-end" : "items-start")}>
                {!isOwn && (
                    <span className="text-xs text-slate-400 mb-1 ml-1">{senderName}</span>
                )}
                <div
                    className={cn(
                        "px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words",
                        isOwn
                            ? "bg-blue-600 text-white rounded-br-sm"
                            : "bg-slate-700 text-slate-100 rounded-bl-sm",
                        status === "sending" && "opacity-60",
                        status === "error" && "border border-red-500"
                    )}
                >
                    {type === "image" && fileUrl ? (
                        <img src={fileUrl} alt="img" className="max-w-full rounded-lg" />
                    ) : type === "voice" && fileUrl ? (
                        <audio controls src={fileUrl} className="max-w-full" />
                    ) : (
                        <span className="whitespace-pre-wrap">{content}</span>
                    )}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs text-slate-500">{formatTime(createdAt)}</span>
                    {isEdited && <span className="text-xs text-slate-500">(edited)</span>}
                    {status === "sending" && <span className="text-xs text-slate-500">⏳</span>}
                    {status === "error" && <span className="text-xs text-red-400">⚠️ Gagal</span>}
                </div>
            </div>
            {isAdmin && !isOwn && onDelete && (
                <button
                    onClick={() => onDelete(id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs px-1 transition-opacity self-center"
                    title="Hapus pesan"
                >
                    🗑️
                </button>
            )}
        </div>
    );
}
