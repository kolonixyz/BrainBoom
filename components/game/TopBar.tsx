"use client";

import { Lightbulb, Trophy, Hash } from "lucide-react";

interface TopBarProps {
  score: number;
  currentQuestion: number;
  totalQuestions: number;
  hintsRemaining: number;
  onHint: () => void;
}

export function TopBar({ score, currentQuestion, totalQuestions, hintsRemaining, onHint }: TopBarProps) {
  return (
    <header className="bg-surface border-b border-surface-light px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Score */}
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-warning" />
          <span className="text-sm font-bold text-text">{score}</span>
        </div>

        {/* Question Number */}
        <div className="flex items-center gap-1.5">
          <Hash className="w-4 h-4 text-primary" />
          <span className="text-sm text-text-muted">
            {currentQuestion + 1} <span className="text-text-muted/50">/ {totalQuestions}</span>
          </span>
        </div>

        {/* Hint Button */}
        <button
          onClick={onHint}
          disabled={hintsRemaining <= 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-light hover:bg-surface-light/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Lightbulb className="w-4 h-4 text-warning" />
          <span className="text-xs font-medium text-text">{hintsRemaining}</span>
        </button>
      </div>
    </header>
  );
}
