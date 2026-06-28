"use client";
import { useEffect, useState, useCallback } from "react";
import { AppContainer } from "../../../components/layout/AppContainer";
import { ChatRoom } from "../../../components/chat/ChatRoom";
import { useAuth } from "../../../hooks/useAuth";
import { apiRequest } from "../../../lib/utils";

export default function GrupPage() {
    const { token, user } = useAuth();
    const [ruangUmumId, setRuangUmumId] = useState<number | null>(null);

    const load = useCallback(async () => {
        if (!token) return;
        try {
            const data = await apiRequest<{ rooms: { id: number; type: string }[] }>("/api/rooms", {}, token);
            const ru = data.rooms.find((r) => r.type === "ruang_umum");
            if (ru) setRuangUmumId(ru.id);
        } catch { /* ignore */ }
    }, [token]);

    useEffect(() => { load(); }, [load]);

    if (!token || !user || !ruangUmumId) {
        return (
            <AppContainer>
                <div className="flex items-center justify-center h-full">
                    <div className="text-4xl animate-pulse">👥</div>
                </div>
            </AppContainer>
        );
    }

    const handleDelete = async (msgId: number | string) => {
        try { await apiRequest(`/api/messages/${msgId}`, { method: "DELETE" }, token); } catch { /* ignore */ }
    };

    return (
        <AppContainer>
            <div className="h-full relative">
                <ChatRoom
                    roomId={ruangUmumId}
                    token={token}
                    currentUserId={user.id}
                    isAdmin={user.role === "admin" || user.role === "developer"}
                    roomName="Grup Pemain 👥"
                    onBack={() => {}}
                    onDeleteMessage={handleDelete}
                />
            </div>
        </AppContainer>
    );
}
