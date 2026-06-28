"use client";

import { useState } from "react";
import { X, Key, Shield, User, Crown } from "lucide-react";

interface AccessCodeModalProps {
  role: string | null;
  onSubmit: (code: string) => void;
  onCancel: () => void;
}

export function AccessCodeModal({ role, onSubmit, onCancel }: AccessCodeModalProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setIsLoading(true);
    await onSubmit(code.trim());
    setIsLoading(false);
  };

  const getRoleIcon = () => {
    switch (role) {
      case "developer": return <Shield className="w-6 h-6 text-primary" />;
      case "admin": return <Crown className="w-6 h-6 text-warning" />;
      default: return <User className="w-6 h-6 text-secondary" />;
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case "developer": return "Developer Access";
      case "admin": return "Admin Access";
      default: return "Member Access";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card max-w-sm w-full animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getRoleIcon()}
            <h3 className="text-lg font-semibold text-text">{getRoleLabel()}</h3>
          </div>
          <button
            onClick={onCancel}
            className="btn-ghost"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-text-muted mb-4">
          Masukkan kode akses lengkap untuk melanjutkan ke dalam sistem.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Masukkan kode lengkap..."
              className="input-field w-full pl-10"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className="btn-primary w-full"
          >
            {isLoading ? "Memverifikasi..." : "Masuk"}
          </button>
        </form>

        {/* Cancel */}
        <button
          onClick={onCancel}
          className="w-full mt-3 text-sm text-text-muted hover:text-text transition-colors"
        >
          Batal, kembali ke game
        </button>
      </div>
    </div>
  );
}
