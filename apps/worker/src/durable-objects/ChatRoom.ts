import { verifyJWT, signJWT } from "../middleware/auth";
import type { Env } from "../types";

interface ConnectionMeta {
    userId: number;
    userName: string;
    displayName: string;
    role: "developer" | "admin" | "member";
    messageQueue: string[];
    isDraining: boolean;
}

interface WSAttachment {
    userId: number;
    userName: string;
    displayName: string;
    role: string;
}

interface WSMessage {
    type: string;
    [key: string]: unknown;
}

interface PriorityMessage {
    priority: number;
    data: WSMessage;
    timestamp: number;
}

export class ChatRoom implements DurableObject {
    private connections: Map<WebSocket, ConnectionMeta>;
    private messageBuffer: WSMessage[];
    private priorityQueue: PriorityMessage[];
    private readonly MAX_BUFFER_SIZE = 100;
    private readonly MAX_QUEUE_SIZE = 50;
    private readonly MAX_CONNECTIONS = 20;
    private isLocked: boolean = false;
    private lockMessage: string = "";
    private env: Env;
    private state: DurableObjectState;
    private roomId: string = "";

    constructor(state: DurableObjectState, env: Env) {
        this.state = state;
        this.env = env;
        this.connections = new Map();
        this.messageBuffer = [];
        this.priorityQueue = [];

        // Hibernate hibernation support
        state.getWebSockets().forEach((ws) => {
            const meta = ws.deserializeAttachment() as WSAttachment;
            this.connections.set(ws, {
                userId: meta.userId,
                userName: meta.userName,
                displayName: meta.displayName,
                role: meta.role as "developer" | "admin" | "member",
                messageQueue: [],
                isDraining: false,
            });
        });
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        this.roomId = url.pathname.split("/").pop() ?? "";

        // Command endpoint for developer actions
        if (request.method === "POST") {
            return this.handleCommand(request);
        }

        if (this.connections.size >= this.MAX_CONNECTIONS) {
            return new Response("Room full", { status: 503 });
        }

        const token = url.searchParams.get("token");
        if (!token) return new Response("Unauthorized", { status: 401 });

        let payload: Awaited<ReturnType<typeof verifyJWT>>;
        try {
            payload = await verifyJWT(token, this.env.JWT_SECRET);
        } catch {
            return new Response("Jawaban salah", { status: 401 });
        }

        const { userId, userName, displayName, role } = payload as {
            userId: number; userName: string; displayName: string; role: "developer" | "admin" | "member";
        };

        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);

        this.state.acceptWebSocket(server);
        server.serializeAttachment({ userId, userName, displayName, role });
        this.connections.set(server, {
            userId, userName, displayName, role,
            messageQueue: [], isDraining: false,
        });

        // If chat is locked and not developer — close after lock message
        if (this.isLocked && role !== "developer") {
            server.send(JSON.stringify({
                type: "system",
                event: "chat_locked",
                message: this.lockMessage,
                timestamp: new Date().toISOString(),
            }));
            server.close();
            return new Response(null, { status: 101, webSocket: client });
        }

        server.send(JSON.stringify({ type: "auth_success", userId }));
        server.send(JSON.stringify({ type: "history", messages: this.messageBuffer.slice(-50) }));

        this.broadcast({
            type: "system",
            event: "user_joined",
            userId, userName,
            timestamp: new Date().toISOString(),
        }, server);

        this.broadcast({
            type: "presence",
            userId,
            status: "online",
            lastSeen: new Date().toISOString(),
        });

        return new Response(null, { status: 101, webSocket: client });
    }

    async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
        const conn = this.connections.get(ws);
        if (!conn) return;

        if (conn.messageQueue.length >= this.MAX_QUEUE_SIZE) {
            ws.send(JSON.stringify({
                type: "error",
                code: "BACKPRESSURE",
                message: "Too many messages. Please slow down.",
            }));
            return;
        }

        let data: WSMessage;
        try {
            data = JSON.parse(message as string);
        } catch {
            ws.send(JSON.stringify({ type: "error", code: "INVALID_MESSAGE" }));
            return;
        }

        await this.handleMessage(ws, data, conn);
    }

    async webSocketClose(ws: WebSocket) {
        const conn = this.connections.get(ws);
        if (!conn) return;

        this.connections.delete(ws);
        this.broadcast({
            type: "presence",
            userId: conn.userId,
            status: "offline",
            lastSeen: new Date().toISOString(),
        });
        this.broadcast({
            type: "system",
            event: "user_left",
            userId: conn.userId,
            userName: conn.userName,
            timestamp: new Date().toISOString(),
        });
    }

    private async handleMessage(ws: WebSocket, data: WSMessage, conn: ConnectionMeta) {
        if (this.isLocked && conn.role !== "developer") return;

        switch (data.type) {
            case "message": {
                if (typeof data.content !== "string" || data.content.length > 4000) return;

                const msg: WSMessage = {
                    type: "message",
                    id: Date.now(),
                    tempId: data.tempId,
                    senderId: conn.userId,
                    senderName: conn.displayName,
                    senderAvatar: `https://i.pravatar.cc/150?u=${conn.userId}`,
                    content: data.content,
                    messageType: data.messageType || "text",
                    fileUrl: data.fileUrl ?? null,
                    replyTo: data.replyTo ?? null,
                    createdAt: new Date().toISOString(),
                    isEdited: false,
                };

                const priority = this.getPriority(data.messageType as string);
                this.priorityQueue.push({ priority, data: msg, timestamp: Date.now() });
                this.priorityQueue.sort((a, b) => a.priority !== b.priority ? a.priority - b.priority : a.timestamp - b.timestamp);
                this.processQueue();

                // Persist to D1 async
                this.persistMessage(conn.userId, data.content as string, data.messageType as string, data.fileUrl as string | null, data.replyTo as number | null);
                break;
            }
            case "typing": {
                this.broadcast({
                    type: "typing",
                    userId: conn.userId,
                    userName: conn.displayName,
                    isTyping: data.isTyping,
                }, ws);
                break;
            }
            case "presence_update": {
                this.broadcast({
                    type: "presence",
                    userId: conn.userId,
                    status: data.status,
                    lastSeen: new Date().toISOString(),
                });
                break;
            }
            case "read": {
                // Mark messages as read (no-op in basic implementation)
                break;
            }
            case "lock": {
                if (conn.role !== "developer") return;
                this.isLocked = true;
                this.lockMessage = (data.message as string) || "Chat sedang dalam maintenance.";
                this.broadcast({
                    type: "system",
                    event: "chat_locked",
                    message: this.lockMessage,
                    timestamp: new Date().toISOString(),
                });
                break;
            }
            case "unlock": {
                if (conn.role !== "developer") return;
                this.isLocked = false;
                this.lockMessage = "";
                this.broadcast({
                    type: "system",
                    event: "chat_unlocked",
                    timestamp: new Date().toISOString(),
                });
                break;
            }
        }
    }

    private async handleCommand(request: Request): Promise<Response> {
        const body = await request.json<{ action: string; message?: string }>();
        if (body.action === "lock") {
            this.isLocked = true;
            this.lockMessage = body.message || "Chat sedang dalam maintenance.";
            this.broadcast({ type: "system", event: "chat_locked", message: this.lockMessage, timestamp: new Date().toISOString() });
            return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }
        if (body.action === "unlock") {
            this.isLocked = false;
            this.lockMessage = "";
            this.broadcast({ type: "system", event: "chat_unlocked", timestamp: new Date().toISOString() });
            return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }
        return new Response("Unknown command", { status: 400 });
    }

    private getPriority(messageType: string): number {
        switch (messageType) {
            case "text": return 1;
            case "image": case "voice": return 2;
            case "file": return 3;
            default: return 2;
        }
    }

    private processQueue() {
        const batch = this.priorityQueue.splice(0, 10);
        for (const item of batch) {
            this.messageBuffer.push(item.data);
            if (this.messageBuffer.length > this.MAX_BUFFER_SIZE) this.messageBuffer.shift();
            this.broadcast(item.data);
        }
    }

    private broadcast(message: WSMessage, exclude?: WebSocket) {
        const payload = JSON.stringify(message);
        this.connections.forEach((_, ws) => {
            if (ws === exclude) return;
            try { ws.send(payload); } catch { /* ignore */ }
        });
    }

    private persistMessage(
        senderId: number,
        content: string,
        type: string,
        fileUrl: string | null,
        replyTo: number | null
    ) {
        const roomId = parseInt(this.roomId) || 0;
        if (!roomId) return;
        this.state.waitUntil(
            this.env.DB.prepare(
                `INSERT INTO messages (room_id, sender_id, content, type, file_url, reply_to) VALUES (?, ?, ?, ?, ?, ?)`
            ).bind(roomId, senderId, content, type || "text", fileUrl, replyTo).run()
        );
    }
}
