"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppContainer } from "../../../components/layout/AppContainer";
import { ContactList } from "../../../components/chat/ContactList";
import { useAuth } from "../../../hooks/useAuth";
import { apiRequest } from "../../../lib/utils";

interface Contact {
    id: number; displayName: string; avatarUrl: string; role: string;
    roomId: number; lastMessage: { content: string; createdAt: string } | null; unreadCount: number;
}

export default function PeringkatPage() {
    const { token, user } = useAuth();
    const router = useRouter();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const load = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try { const data = await apiRequest<{ contacts: Contact[] }>("/api/contacts", {}, token); setContacts(data.contacts); }
        catch { /* ignore */ } finally { setIsLoading(false); }
    }, [token]);

    useEffect(() => { load(); }, [load]);

    return (
        <AppContainer>
            <div className="flex flex-col h-full">
                <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700">
                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Peringkat Personal 🏆</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <ContactList contacts={contacts} isLoading={isLoading}
                        onSelect={(roomId) => router.push(`/papan-skor/peringkat/${roomId}`)} />
                </div>
                {user?.role === "admin" && (
                    <button className="fixed bottom-20 right-4 w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded-full shadow-lg flex items-center justify-center text-white text-xl transition-all active:scale-90">➕</button>
                )}
            </div>
        </AppContainer>
    );
}
