"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "../../lib/utils";

interface AnswerInputProps {
    onAnswer: (input: string) => void;
    onCodeSubmit: (code: string) => void;
    isCodeChecking: boolean;
    isDisabled?: boolean;
    isShaking?: boolean;
}

// Access code pattern: 4-50 alphanumeric chars with possible dashes/underscores
const CODE_PATTERN = /^[a-z0-9\-_]{4,50}$/i;

export function AnswerInput({
    onAnswer,
    onCodeSubmit,
    isCodeChecking,
    isDisabled,
    isShaking,
}: AnswerInputProps) {
    const [value, setValue] = useState("");
    const [isCodeMode, setIsCodeMode] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setValue(v);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setIsCodeMode(CODE_PATTERN.test(v.trim()));
        }, 400);
    }, []);

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            const trimmed = value.trim();
            if (!trimmed || isDisabled || isCodeChecking) return;

            if (isCodeMode) {
                onCodeSubmit(trimmed);
            } else {
                onAnswer(trimmed);
                setValue("");
                setIsCodeMode(false);
            }
        },
        [value, isCodeMode, onAnswer, onCodeSubmit, isDisabled, isCodeChecking]
    );

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div
                className={cn(
                    "relative flex items-center gap-2 bg-white/10 border-2 rounded-2xl p-1 transition-all",
                    isCodeMode ? "border-yellow-400/60 bg-yellow-400/5" : "border-white/20",
                    isShaking && "animate-shake",
                    isDisabled && "opacity-50"
                )}
            >
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleChange}
                    disabled={isDisabled || isCodeChecking}
                    placeholder={isCodeMode ? "🔑 Kode akses..." : "Tulis jawaban..."}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    className={cn(
                        "flex-1 bg-transparent text-white placeholder-white/40 text-lg px-4 py-3 outline-none",
                        "disabled:cursor-not-allowed"
                    )}
                />
                {isCodeMode && (
                    <span className="text-yellow-400 text-xs px-2 animate-pulse">🔑</span>
                )}
                <button
                    type="submit"
                    disabled={!value.trim() || isDisabled || isCodeChecking}
                    className={cn(
                        "px-5 py-3 rounded-xl font-bold text-sm transition-all",
                        "disabled:opacity-40 disabled:cursor-not-allowed active:scale-95",
                        isCodeMode
                            ? "bg-yellow-500 hover:bg-yellow-400 text-black"
                            : "bg-blue-600 hover:bg-blue-500 text-white"
                    )}
                >
                    {isCodeChecking ? "⏳" : isCodeMode ? "Akses" : "Kirim"}
                </button>
            </div>
            {isCodeMode && (
                <p className="text-yellow-400/70 text-xs mt-2 text-center animate-fade-in">
                    Mencoba kode akses...
                </p>
            )}
        </form>
    );
}
