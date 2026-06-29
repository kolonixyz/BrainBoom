"use client";
import { useParams, useRouter } from "next/navigation";
import { AppContainer } from "../../../../components/layout/AppContainer";
import { ChatRoom } from "../../../../components/chat/ChatRoom";
import { useAuth } from "../../../../hooks/useAuth";
import { apiRequest } from "../../../../lib/utils";

export default function PersonalChatClient() {
    const params = useParams();
    const id = params.id as string;
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
                <ChatRoom
                    roomId={id}
                    token={token}
                    currentUserId={user.id}
                    isAdmin={user.role === "admin" || user.role === "developer"}
                    roomName="Chat Personal"
                    onBack={() => router.push("/papan-skor/peringkat")}
                    onDeleteMessage={handleDelete}
                />
            </div>
        </AppContainer>
    );
}
