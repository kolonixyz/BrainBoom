"use client";
import { useState, useRef, useCallback } from "react";
import { EmojiPicker } from "./EmojiPicker";
import { cn } from "../../lib/utils";

interface ChatInputProps {
    onSend: (content: string) => void;
    onTyping: (isTyping: boolean) => void;
    onAttach?: () => void;
    disabled?: boolean;
}

export function ChatInput({ onSend, onTyping, onAttach, disabled }: ChatInputProps) {
    const [value, setValue] = useState("");
    const [showEmoji, setShowEmoji] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const v = e.target.value;
        setValue(v);
        if (typingTimer.current) clearTimeout(typingTimer.current);
        if (v.length > 0) {
            onTyping(true);
            typingTimer.current = setTimeout(() => onTyping(false), 2000);
        } else {
            onTyping(false);
        }
        // Auto resize
        e.target.style.height = "auto";
        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
    }, [onTyping]);

    const handleSend = useCallback(() => {
        const trimmed = value.trim();
        if (!trimmed || disabled) return;
        onSend(trimmed);
        setValue("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
        onTyping(false);
        if (typingTimer.current) clearTimeout(typingTimer.current);
    }, [value, onSend, disabled, onTyping]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    const handleEmojiSelect = useCallback((emoji: string) => {
        setValue((prev) => prev + emoji);
        textareaRef.current?.focus();
    }, []);

    return (
        <div className="flex items-end gap-2 bg-slate-800 border-t border-slate-700 p-3 safe-bottom">
            {/* Attach */}
            {onAttach && (
                <button
                    onClick={onAttach}
                    disabled={disabled}
                    className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 transition-colors disabled:opacity-40"
                >
                    📎
                </button>
            )}

            {/* Emoji button */}
            <div className="relative flex-shrink-0">
                <button
                    onClick={() => setShowEmoji((s) => !s)}
                    disabled={disabled}
                    className="w-9 h-9 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 transition-colors disabled:opacity-40"
                >
                    😊
                </button>
                {showEmoji && (
                    <EmojiPicker
                        onSelect={handleEmojiSelect}
                        onClose={() => setShowEmoji(false)}
                    />
                )}
            </div>

            {/* Text input */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                placeholder={disabled ? "Chat dikunci..." : "Ketik pesan..."}
                rows={1}
                className={cn(
                    "flex-1 bg-slate-700 text-white placeholder-slate-400 text-sm px-4 py-2.5",
                    "rounded-2xl resize-none outline-none leading-5",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "max-h-[120px] overflow-y-auto"
                )}
            />

            {/* Send button */}
            <button
                onClick={handleSend}
                disabled={!value.trim() || disabled}
                className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all active:scale-90",
                    value.trim() && !disabled ? "bg-blue-600 hover:bg-blue-500" : "bg-slate-700 opacity-40 cursor-not-allowed"
                )}
            >
                🚀
            </button>
        </div>
    );
}
