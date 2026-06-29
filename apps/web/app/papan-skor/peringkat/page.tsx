"use client";
import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppContainer } from "../../../components/layout/AppContainer";
import { ContactList } from "../../../components/chat/ContactList";
import { ChatRoom } from "../../../components/chat/ChatRoom";
import { useAuth } from "../../../hooks/useAuth";
import { apiRequest } from "../../../lib/utils";

interface Contact {
    id: number; displayName: string; avatarUrl: string; role: string;
    roomId: number; lastMessage: { content: string; createdAt: string } | null; unreadCount: number;
}

function PeringkatContent() {
    const { token, user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const roomId = searchParams.get("room");

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [roomName, setRoomName] = useState("Chat Personal");

    const load = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const data = await apiRequest<{ contacts: Contact[] }>("/api/contacts", {}, token);
            setContacts(data.contacts);
        } catch { } finally { setIsLoading(false); }
    }, [token]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        if (roomId && contacts.length > 0) {
            const found = contacts.find(c => c.roomId === Number(roomId));
            if (found) setRoomName(found.displayName);
        }
    }, [roomId, contacts]);

    const handleDelete = async (msgId: number | string) => {
        if (!token) return;
        try { await apiRequest(`/api/messages/${msgId}`, { method: "DELETE" }, token); } catch { }
    };

    if (!token || !user) return null;

    if (roomId) {
        return (
            <AppContainer>
                <div className="h-full">
                    <ChatRoom
                        roomId={roomId}
                        token={token}
                        currentUserId={user.id}
                        isAdmin={user.role === "admin" || user.role === "developer"}
                        roomName={roomName}
                        onBack={() => router.push("/papan-skor/peringkat")}
                        onDeleteMessage={handleDelete}
                    />
                </div>
            </AppContainer>
        );
    }

    return (
        <AppContainer>
            <div className="flex flex-col h-full">
                <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700">
                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Peringkat Personal 🏆</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <ContactList
                        contacts={contacts}
                        isLoading={isLoading}
                        onSelect={(rid) => router.push(`/papan-skor/peringkat?room=${rid}`)}
                    />
                </div>
            </div>
        </AppContainer>
    );
}

export default function PeringkatPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white text-4xl animate-pulse">🏆</div>
            </div>
        }>
            <PeringkatContent />
        </Suspense>
    );
}
