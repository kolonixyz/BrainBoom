"use client";

import { GameFeedback } from "@/types";
import { Brain, Sparkles, Frown, Smile } from "lucide-react";

interface MascotProps {
  isShaking: boolean;
  feedback: GameFeedback;
}

export function Mascot({ isShaking, feedback }: MascotProps) {
  const getMascotExpression = () => {
    if (!feedback) return <Brain className="w-12 h-12 text-primary" />;
    if (feedback.type === "praise") return <Smile className="w-12 h-12 text-success" />;
    return <Frown className="w-12 h-12 text-error" />;
  };

  return (
    <div className={`relative ${isShaking ? "animate-shake" : ""}`}>
      {/* Glow effect */}
      <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-slow" />

      {/* Mascot container */}
      <div className="relative bg-surface border-2 border-surface-light rounded-2xl p-6 flex flex-col items-center gap-3">
        <div className="relative">
          {getMascotExpression()}
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-warning animate-bounce-slow" />
        </div>

        <div className="text-center">
          <h2 className="text-lg font-bold text-text">Mbah BrainBoom</h2>
          {feedback && (
            <p className={`text-sm mt-1 animate-fade-in ${
              feedback.type === "praise" ? "text-success" : "text-error"
            }`}>
              {feedback.text}
            </p>
          )}
          {!feedback && (
            <p className="text-xs text-text-muted mt-1">Siap menerima tantangan?</p>
          )}
        </div>
      </div>
    </div>
  );
}
