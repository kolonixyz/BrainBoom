"use client";
import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

interface MascotProps {
    isCorrect?: boolean;
    isWrong?: boolean;
    isWin?: boolean;
    score: number;
}

const MASCOT_STATES = {
    idle: "🧠",
    correct: "🎉",
    wrong: "😅",
    win: "🏆",
};

export function Mascot({ isCorrect, isWrong, isWin, score }: MascotProps) {
    const [animate, setAnimate] = useState<"shake" | "bounce" | null>(null);

    useEffect(() => {
        if (isWrong) {
            setAnimate("shake");
            const t = setTimeout(() => setAnimate(null), 600);
            return () => clearTimeout(t);
        }
        if (isCorrect) {
            setAnimate("bounce");
            const t = setTimeout(() => setAnimate(null), 600);
            return () => clearTimeout(t);
        }
    }, [isCorrect, isWrong]);

    const emoji = isWin ? MASCOT_STATES.win : isCorrect ? MASCOT_STATES.correct : isWrong ? MASCOT_STATES.wrong : MASCOT_STATES.idle;

    return (
        <div className="flex flex-col items-center gap-2">
            <div
                className={cn(
                    "text-7xl transition-transform select-none",
                    animate === "shake" && "animate-shake",
                    animate === "bounce" && "animate-bounce-in"
                )}
            >
                {emoji}
            </div>
            <div className="flex items-center gap-1 bg-yellow-400/20 px-3 py-1 rounded-full">
                <span className="text-yellow-400 text-sm font-bold">⭐ {score}</span>
            </div>
        </div>
    );
}
