"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getSettings, resetAccessCode } from "@/lib/api";
import { User, Key, RefreshCw, LogOut, Loader2 } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default function PengaturanPage() {
  const { user, logout, isAdmin } = useAuth();
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await getSettings();
      setSettings(data);
    } catch (e) {
      console.error("Failed to load settings:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetCode = async () => {
    if (!confirm("Yakin ingin mereset kode akses? Kode lama tidak akan berfungsi lagi.")) return;

    setIsResetting(true);
    try {
      const data = await resetAccessCode();
      setSettings((prev: any) => ({ ...prev, accessCode: data.accessCode }));
      alert(`Kode baru: ${data.accessCode.code}`);
    } catch (e) {
      alert("Gagal reset kode");
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto chat-scrollbar p-4 space-y-4">
      <h1 className="text-lg font-bold text-text">Pengaturan Akun</h1>

      <div className="card flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full rounded-full object-cover" />
          ) : (
            getInitials(user?.displayName || "?")
          )}
        </div>
        <div>
          <h2 className="text-base font-semibold text-text">{user?.displayName}</h2>
          <p className="text-xs text-text-muted capitalize">{user?.role}</p>
          <p className="text-xs text-text-muted">@{user?.username}</p>
        </div>
      </div>

      {settings?.accessCode && (
        <div className="card space-y-3">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-text">Kode Akses</h3>
          </div>
          <div className="bg-surface-light rounded-lg p-3 flex items-center justify-between">
            <code className="text-sm text-text font-mono">{settings.accessCode.code}</code>
            <span className="text-[10px] text-text-muted">Reset: {settings.accessCode.resetCount}x</span>
          </div>
          {isAdmin() && (
            <button
              onClick={handleResetCode}
              disabled={isResetting}
              className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
            >
              {isResetting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Reset Kode
            </button>
          )}
        </div>
      )}

      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-error/10 text-error hover:bg-error/20 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Keluar dari Akun
      </button>
    </div>
  );
}
