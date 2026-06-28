"use client";
const POPULAR_EMOJIS = ["👍","❤️","😂","😮","😢","😡","🎉","🔥","👏","🙏","💯","✅","👋","🤔","🚀"];

interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
    return (
        <div className="absolute bottom-full left-0 mb-2 bg-slate-800 border border-slate-700 rounded-2xl p-2 shadow-xl z-50 animate-slide-up">
            <div className="grid grid-cols-5 gap-1">
                {POPULAR_EMOJIS.map((emoji) => (
                    <button
                        key={emoji}
                        onClick={() => { onSelect(emoji); onClose(); }}
                        className="w-9 h-9 text-xl flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors active:scale-90"
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
}
