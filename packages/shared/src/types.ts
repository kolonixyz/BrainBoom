// User & Auth
export type UserRole = "developer" | "admin" | "member";
export type MessageType = "text" | "image" | "file" | "voice";
export type PresenceStatus = "online" | "away" | "offline";
export type ScheduleStatus = "pending" | "in_progress" | "urgent" | "completed";
export type RoomType = "personal" | "ruang_umum";

export interface JWTPayload {
    userId: number;
    userName: string;
    displayName: string;
    role: UserRole;
    exp: number;
    iat: number;
}

export interface User {
    id: number;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
}

export interface AccessCode {
    id: number;
    code: string;
    role: "admin" | "member";
    displayName: string;
    createdBy: number;
    isActive: boolean;
    usedAt: Date | null;
    resetCount: number;
    createdAt: Date;
}

export interface Room {
    id: number;
    name: string;
    type: RoomType;
    createdBy: number | null;
    createdAt: Date;
}

export interface Contact {
    id: number;
    userId: number;
    contactUserId: number;
    roomId: number;
    createdAt: Date;
}

export interface Message {
    id: number;
    roomId: number;
    senderId: number;
    content: string;
    type: MessageType;
    fileUrl: string | null;
    replyTo: number | null;
    isEdited: boolean;
    deletedAt: Date | null;
    deletedBy: number | null;
    createdAt: Date;
}

export interface Schedule {
    id: number;
    title: string;
    description: string | null;
    projectName: string;
    scheduledAt: Date;
    status: ScheduleStatus;
    createdBy: number;
    updatedAt: Date;
    createdAt: Date;
}

export interface Note {
    id: number;
    title: string;
    content: string;
    tags: string | null;
    createdBy: number;
    updatedAt: Date;
    createdAt: Date;
}

// API Response types
export interface ApiResponse<T> {
    data: T;
}

export interface ApiError {
    error: string;
}

// WebSocket message types
export type WSMessageType =
    | "message"
    | "message_deleted"
    | "typing"
    | "presence"
    | "system"
    | "error"
    | "auth_success"
    | "history";

export interface WSMessage {
    type: WSMessageType;
    [key: string]: unknown;
}

export interface WSSystemEvent {
    type: "system";
    event: "user_joined" | "user_left" | "chat_locked" | "chat_unlocked";
    userId?: number;
    userName?: string;
    message?: string;
    timestamp: string;
}
