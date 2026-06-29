"use client";
import { use } from "react";
import { useRouter } from "next/navigation";
import { AppContainer } from "../../../../components/layout/AppContainer";
import { ChatRoom } from "../../../../components/chat/ChatRoom";
import { useAuth } from "../../../../hooks/useAuth";
import { apiRequest } from "../../../../lib/utils";

export function generateStaticParams() { return []; }

interface Props { params: Promise<{ id: string }> }

export default function PersonalChatPage({ params }: Props) {
    const { id } = use(params);
    const { token, user } = useAuth();
    const router = useRouter();

    const handleDelete = async (msgId: number | string) => {
        if (!token) return;
        try { await apiRequest(`/api/messages/${msgId}`, { method: "DELETE" }, token); } catch { }
    };

    if (!token || !user) return null;

    return (
        <AppContainer>
            <div className="h-full">
                <ChatRoom roomId={id} token={token} currentUserId={user.id}
                    isAdmin={user.role === "admin" || user.role === "developer"}
                    roomName="Chat Personal" onBack={() => router.push("/papan-skor/peringkat")}
                    onDeleteMessage={handleDelete} />
            </div>
        </AppContainer>
    );
}
