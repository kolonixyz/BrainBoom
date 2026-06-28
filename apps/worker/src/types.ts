import type { ChatRoom } from "./durable-objects/ChatRoom";

export interface Env {
    DB: D1Database;
    R2: R2Bucket;
    KV: KVNamespace;
    CHAT_ROOM: DurableObjectNamespace;
    JWT_SECRET: string;
    DEV_ACCESS_CODE: string;
    ADMIN_ACCESS_CODE: string;
    ENVIRONMENT: string;
}

declare module "hono" {
    interface ContextVariableMap {
        userId: number;
        userName: string;
        displayName: string;
        userRole: "developer" | "admin" | "member";
    }
}
