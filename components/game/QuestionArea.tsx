"use client";

import { useRef, useEffect } from "react";
import { Question } from "@/types";
import { Send, Lightbulb } from "lucide-react";

interface QuestionAreaProps {
  question: Question;
  userAnswer: string;
  onAnswerChange: (value: string) => void;
  onSubmit: (answer: string) => void;
  showHint: boolean;
  isLoading: boolean;
}

export function QuestionArea({
  question,
  userAnswer,
  onAnswerChange,
  onSubmit,
  showHint,
  isLoading,
}: QuestionAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [question.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(userAnswer);
  };

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Question Card */}
      <div className="card text-center space-y-3">
        <div className="text-6xl animate-bounce-slow">{question.emoji}</div>
        <h3 className="text-lg font-semibold text-text leading-relaxed">
          {question.text}
        </h3>
      </div>

      {/* Hint */}
      {showHint && (
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-3 flex items-start gap-2 animate-fade-in">
          <Lightbulb className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-medium text-warning">Petunjuk:</p>
            {question.hints.map((hint, i) => (
              <p key={i} className="text-xs text-text-muted">• {hint}</p>
            ))}
          </div>
        </div>
      )}

      {/* Answer Input */}
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={userAnswer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Ketik jawabanmu di sini..."
          disabled={isLoading}
          className="input-field w-full pr-12"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        <button
          type="submit"
          disabled={isLoading || !userAnswer.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Loading indicator */}
      {isLoading && (
        <p className="text-center text-xs text-text-muted animate-pulse">
          Mbah BrainBoom sedang berpikir...
        </p>
      )}
    </div>
  );
}
