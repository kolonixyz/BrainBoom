"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginWithCode } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { detectAccessCode, getRandomItem, sleep } from "@/lib/utils";
import { GameFeedback, Question } from "@/types";
import { QUESTIONS, ROASTS, PRAISES } from "./questions";
import { TopBar } from "./TopBar";
import { Mascot } from "./Mascot";
import { QuestionArea } from "./QuestionArea";
import { FeedbackArea } from "./FeedbackArea";
import { WinOverlay } from "./WinOverlay";
import { AccessCodeModal } from "./AccessCodeModal";
import { Sparkles, Zap } from "lucide-react";

export function BrainBoomGame() {
  const router = useRouter();
  const { login } = useAuthContext();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<GameFeedback>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [detectedRole, setDetectedRole] = useState<string | null>(null);

  const question = QUESTIONS[currentQuestion];

  const handleAnswer = useCallback(
    async (answer: string) => {
      if (isLoading || isWin) return;

      const trimmed = answer.trim().toLowerCase();
      if (!trimmed) return;

      // Check access code pattern
      const role = detectAccessCode(trimmed);
      if (role) {
        setDetectedRole(role);
        setShowAccessModal(true);
        setUserAnswer("");
        return;
      }

      setIsLoading(true);

      // Simulate network delay for camouflage (always 800ms)
      await sleep(800);

      const isCorrect = question.answers.includes(trimmed);

      if (isCorrect) {
        setScore((prev) => prev + 1);
        setFeedback({ type: "praise", text: getRandomItem(PRAISES) });

        await sleep(1500);

        if (currentQuestion >= QUESTIONS.length - 1) {
          setIsWin(true);
        } else {
          setCurrentQuestion((prev) => prev + 1);
          setUserAnswer("");
          setShowHint(false);
        }
        setFeedback(null);
      } else {
        setIsShaking(true);
        setFeedback({ type: "roast", text: getRandomItem(ROASTS) });

        await sleep(500);
        setIsShaking(false);

        await sleep(1000);
        setFeedback(null);
      }

      setIsLoading(false);
    },
    [currentQuestion, question, isLoading, isWin]
  );

  const handleHint = useCallback(() => {
    if (hintsUsed < 3 && !showHint) {
      setHintsUsed((prev) => prev + 1);
      setShowHint(true);
    }
  }, [hintsUsed, showHint]);

  const handleAccessCodeSubmit = useCallback(
    async (code: string) => {
      try {
        setIsLoading(true);
        const data = await loginWithCode(code);
        login(data.token, data.role, data.user);
        router.push("/papan-skor/peringkat/");
      } catch (e) {
        setIsShaking(true);
        setFeedback({ type: "roast", text: "Jawaban salah" });
        setTimeout(() => setIsShaking(false), 500);
        setTimeout(() => setFeedback(null), 2000);
      } finally {
        setIsLoading(false);
        setShowAccessModal(false);
      }
    },
    [login, router]
  );

  const restart = useCallback(() => {
    setCurrentQuestion(0);
    setScore(0);
    setUserAnswer("");
    setFeedback(null);
    setIsWin(false);
    setHintsUsed(0);
    setShowHint(false);
  }, []);

  if (isWin) {
    return <WinOverlay score={score} total={QUESTIONS.length} onRestart={restart} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <TopBar
        score={score}
        currentQuestion={currentQuestion}
        totalQuestions={QUESTIONS.length}
        hintsRemaining={3 - hintsUsed}
        onHint={handleHint}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 space-y-6">
        {/* Mascot */}
        <Mascot isShaking={isShaking} feedback={feedback} />

        {/* Question */}
        <QuestionArea
          question={question}
          userAnswer={userAnswer}
          onAnswerChange={setUserAnswer}
          onSubmit={handleAnswer}
          showHint={showHint}
          isLoading={isLoading}
        />

        {/* Feedback */}
        <FeedbackArea feedback={feedback} />

        {/* Progress */}
        <div className="w-full max-w-md">
          <div className="flex justify-between text-xs text-text-muted mb-2">
            <span>Progress</span>
            <span>
              {currentQuestion + 1} / {QUESTIONS.length}
            </span>
          </div>
          <div className="h-2 bg-surface-light rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{
                width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Access Code Modal */}
      {showAccessModal && (
        <AccessCodeModal
          role={detectedRole}
          onSubmit={handleAccessCodeSubmit}
          onCancel={() => {
            setShowAccessModal(false);
            setDetectedRole(null);
          }}
        />
      )}

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-text-muted/50">
        <div className="flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>BrainBoom v1.3 — Game Tebak-Tebakan</span>
          <Zap className="w-3 h-3" />
        </div>
      </footer>
    </div>
  );
}
