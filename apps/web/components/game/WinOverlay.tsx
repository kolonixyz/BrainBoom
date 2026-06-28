"use client";
import { cn } from "../../lib/utils";

interface WinOverlayProps {
    score: number;
    onReplay: () => void;
}

export function WinOverlay({ score, onReplay }: WinOverlayProps) {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="text-center p-8 max-w-sm w-full mx-4">
                <div className="text-8xl mb-4 animate-bounce-in">🏆</div>
                <h2 className="text-3xl font-bold text-white mb-2">Selamat!</h2>
                <p className="text-gray-300 mb-4">Kamu berhasil menyelesaikan semua 30 soal!</p>
                <div className="bg-yellow-400/20 rounded-2xl p-4 mb-6">
                    <div className="text-4xl font-bold text-yellow-400">⭐ {score}</div>
                    <div className="text-yellow-300 text-sm mt-1">Total Poin</div>
                </div>
                <button
                    onClick={onReplay}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all active:scale-95"
                >
                    Main Lagi 🔄
                </button>
            </div>
        </div>
    );
}
