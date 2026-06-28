"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppContainer } from "../../../components/layout/AppContainer";
import { useAuth } from "../../../hooks/useAuth";
import { apiRequest } from "../../../lib/utils";

interface Settings {
    user: { id: number; displayName: string; avatarUrl: string; role: string };
    accessCode: { id: number; code: string; resetCount: number } | null;
}

export default function PengaturanPage() {
    const { token, user, logout } = useAuth();
    const router = useRouter();
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isResetting, setIsResetting] = useState(false);
    const [newCode, setNewCode] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!token) return;
        try { const data = await apiRequest<Settings>("/api/settings", {}, token); setSettings(data); }
        catch { /* ignore */ }
    }, [token]);

    useEffect(() => { load(); }, [load]);

    const handleResetCode = async () => {
        if (!token || !confirm("Reset kode akses?")) return;
        setIsResetting(true);
        try {
            const data = await apiRequest<{ accessCode: { code: string } }>("/api/settings/reset-code", { method: "PUT" }, token);
            setNewCode(data.accessCode.code);
        } catch { /* ignore */ } finally { setIsResetting(false); }
    };

    const handleLogout = () => { logout(); router.replace("/"); };

    return (
        <AppContainer>
            <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full">
                <h1 className="text-white font-bold text-lg">⚙️ Pengaturan</h1>

                {/* Profile */}
                <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                    <div className="flex items-center gap-3">
                        <img src={user?.avatarUrl} alt={user?.displayName} className="w-14 h-14 rounded-full" />
                        <div>
                            <div className="text-white font-semibold">{user?.displayName}</div>
                            <div className="text-slate-400 text-sm capitalize">{user?.role}</div>
                        </div>
                    </div>
                </div>

                {/* Access code */}
                {settings?.accessCode && (user?.role === "admin") && (
                    <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                        <div className="text-slate-400 text-sm mb-2">Kode Akses</div>
                        {newCode ? (
                            <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-3">
                                <div className="text-green-300 text-xs mb-1">Kode baru:</div>
                                <div className="text-white font-mono text-lg font-bold">{newCode}</div>
                                <div className="text-green-300 text-xs mt-1">Simpan kode ini baik-baik!</div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="font-mono text-white">{settings.accessCode.code}</div>
                                <button onClick={handleResetCode} disabled={isResetting}
                                    className="bg-orange-600/30 text-orange-300 text-xs px-3 py-1.5 rounded-xl hover:bg-orange-600/50 transition-colors disabled:opacity-50">
                                    {isResetting ? "..." : "Reset Kode"}
                                </button>
                            </div>
                        )}
                        <div className="text-xs text-slate-500 mt-2">Reset ke-{settings.accessCode.resetCount}</div>
                    </div>
                )}

                {/* Logout */}
                <button onClick={handleLogout}
                    className="w-full bg-red-600/20 border border-red-500/30 text-red-300 py-3 rounded-2xl font-medium hover:bg-red-600/30 transition-colors mt-auto">
                    Keluar 🚪
                </button>
            </div>
        </AppContainer>
    );
}
