"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS, checkAnswer } from "../../lib/questions";
import { AnswerInput } from "./AnswerInput";
import { Mascot } from "./Mascot";
import { WinOverlay } from "./WinOverlay";
import { useAccessCode } from "../../hooks/useAccessCode";
import { registerChatServiceWorker } from "../../lib/sw-register";
import { cn } from "../../lib/utils";

export function BrainBoomGame() {
    const router = useRouter();
    const { looksLikeCode, tryAccess, isChecking } = useAccessCode();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [isCorrect, setIsCorrect] = useState(false);
    const [isWrong, setIsWrong] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [isWin, setIsWin] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    const currentQuestion = QUESTIONS[currentIndex];

    const handleAnswer = useCallback((input: string) => {
        if (!currentQuestion) return;

        if (checkAnswer(input, currentQuestion)) {
            const bonus = streak >= 3 ? 20 : streak >= 2 ? 15 : streak >= 1 ? 12 : 10;
            const newScore = score + bonus;
            const newStreak = streak + 1;

            setIsCorrect(true);
            setIsWrong(false);
            setScore(newScore);
            setStreak(newStreak);
            setFeedback(newStreak >= 2 ? `🔥 Streak ${newStreak}x! +${bonus} poin` : `✅ Benar! +${bonus} poin`);

            setTimeout(() => {
                setIsCorrect(false);
                setFeedback(null);
                if (currentIndex + 1 >= QUESTIONS.length) {
                    setIsWin(true);
                } else {
                    setCurrentIndex((i) => i + 1);
                }
            }, 1000);
        } else {
            setIsWrong(true);
            setIsShaking(true);
            setStreak(0);
            setFeedback("❌ Jawaban salah, coba lagi!");

            setTimeout(() => {
                setIsWrong(false);
                setIsShaking(false);
                setFeedback(null);
            }, 800);
        }
    }, [currentQuestion, score, streak, currentIndex]);

    const handleCodeSubmit = useCallback(async (code: string) => {
        const success = await tryAccess(code);
        if (success) {
            await registerChatServiceWorker();
            router.push("/papan-skor");
        } else {
            // Same visual as wrong answer (camouflage)
            setIsWrong(true);
            setIsShaking(true);
            setFeedback("❌ Jawaban salah");
            setTimeout(() => {
                setIsWrong(false);
                setIsShaking(false);
                setFeedback(null);
            }, 800);
        }
    }, [tryAccess, router]);

    const handleReplay = useCallback(() => {
        setCurrentIndex(0);
        setScore(0);
        setStreak(0);
        setIsWin(false);
    }, []);

    const progress = ((currentIndex) / QUESTIONS.length) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-4 pt-4 pb-2 safe-top">
                <div className="text-white font-bold text-xl">🧠 BrainBoom</div>
                <div className="text-sm text-blue-300">
                    {currentIndex + 1} / {QUESTIONS.length}
                </div>
            </header>

            {/* Progress bar */}
            <div className="h-1.5 bg-white/10 mx-4 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-between px-4 py-6 gap-6">
                {/* Mascot */}
                <div className="flex-shrink-0">
                    <Mascot isCorrect={isCorrect} isWrong={isWrong} score={score} />
                </div>

                {/* Question card */}
                <div className={cn(
                    "w-full max-w-sm bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20",
                    "shadow-xl transition-all duration-300",
                    isCorrect && "border-green-400/50 bg-green-400/10",
                    isWrong && "border-red-400/50 bg-red-400/10"
                )}>
                    <div className="text-center text-5xl mb-4">{currentQuestion?.emoji}</div>
                    <p className="text-white text-xl font-semibold text-center leading-relaxed">
                        {currentQuestion?.soal}
                    </p>

                    {/* Feedback */}
                    {feedback && (
                        <div className={cn(
                            "mt-4 text-center text-sm font-medium py-2 rounded-xl animate-fade-in",
                            isCorrect ? "text-green-300 bg-green-400/10" : "text-red-300 bg-red-400/10"
                        )}>
                            {feedback}
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="w-full max-w-sm safe-bottom">
                    <AnswerInput
                        onAnswer={handleAnswer}
                        onCodeSubmit={handleCodeSubmit}
                        isCodeChecking={isChecking}
                        isShaking={isShaking}
                    />
                    <p className="text-white/30 text-xs text-center mt-3">
                        Ketik jawaban atau kode akses
                    </p>
                </div>
            </div>

            {isWin && <WinOverlay score={score} onReplay={handleReplay} />}
        </div>
    );
}
