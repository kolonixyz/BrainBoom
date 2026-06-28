"use client";

import { Trophy, RotateCcw, Sparkles, Star } from "lucide-react";

interface WinOverlayProps {
  score: number;
  total: number;
  onRestart: () => void;
}

export function WinOverlay({ score, total, onRestart }: WinOverlayProps) {
  const percentage = (score / total) * 100;
  const getMessage = () => {
    if (percentage === 100) return "Sempurna! Kamu jenius sejati! 🌟";
    if (percentage >= 80) return "Luar biasa! Kamu hampir sempurna! 🎉";
    if (percentage >= 60) return "Bagus! Kamu cukup pintar! 👏";
    if (percentage >= 40) return "Lumayan! Masih perlu belajar! 📚";
    return "Jangan menyerah! Coba lagi! 💪";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-md w-full text-center space-y-6 animate-slide-up">
        {/* Trophy */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-warning/20 rounded-full blur-xl" />
          <Trophy className="relative w-20 h-20 text-warning mx-auto" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-text">Selamat!</h1>
          <p className="text-text-muted">Kamu telah menyelesaikan semua soal!</p>
        </div>

        {/* Score */}
        <div className="bg-surface-light rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Star className="w-5 h-5 text-warning" />
            <span className="text-3xl font-bold text-text">{score}</span>
            <span className="text-text-muted">/ {total}</span>
            <Star className="w-5 h-5 text-warning" />
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-background rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-warning to-primary rounded-full transition-all duration-1000"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="text-sm font-medium text-primary">{getMessage()}</p>
        </div>

        {/* Restart button */}
        <button
          onClick={onRestart}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Main Lagi
        </button>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1 text-xs text-text-muted/50">
          <Sparkles className="w-3 h-3" />
          <span>BrainBoom — Game Tebak-Tebakan</span>
        </div>
      </div>
    </div>
  );
}
