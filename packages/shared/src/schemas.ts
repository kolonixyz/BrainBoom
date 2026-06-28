import { z } from "zod";

// Auth
export const AccessCodeSchema = z.object({
    code: z.string().min(1).max(50),
});

export const CreateAccessCodeSchema = z.object({
    displayName: z.string().min(1).max(100),
    code: z.string().min(4).max(50).optional(),
    role: z.enum(["member", "admin"]).default("member"),
});

export const ResetAccessCodeSchema = z.object({
    displayName: z.string().min(1).max(100).optional(),
});

// Messages
export const CreateMessageSchema = z.object({
    roomId: z.number().int().positive(),
    content: z.string().min(1).max(4000),
    type: z.enum(["text", "image", "file", "voice"]).default("text"),
    fileUrl: z.string().url().optional(),
    replyTo: z.number().int().optional(),
});

export const GetMessagesSchema = z.object({
    cursor: z.string().optional(),
    limit: z.coerce.number().min(1).max(50).default(50),
});

// Schedules
export const CreateScheduleSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    projectName: z.string().min(1).max(100),
    scheduledAt: z.string().datetime(),
    status: z.enum(["pending", "in_progress", "urgent", "completed"]).default("pending"),
});

export const UpdateScheduleSchema = CreateScheduleSchema.partial();

export const GetSchedulesSchema = z.object({
    status: z.enum(["pending", "in_progress", "urgent", "completed"]).optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
});

// Notes
export const CreateNoteSchema = z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1).max(10000),
    tags: z.array(z.string().max(50)).max(10).optional(),
});

export const UpdateNoteSchema = CreateNoteSchema.partial();

// Settings
export const UpdateSettingsSchema = z.object({
    displayName: z.string().min(1).max(100).optional(),
    avatarUrl: z.string().url().optional(),
});

// WebSocket message types
export const WSClientMessageSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("message"),
        content: z.string().min(1).max(4000),
        messageType: z.enum(["text", "image", "file", "voice"]).default("text"),
        fileUrl: z.string().url().nullable().optional(),
        replyTo: z.number().int().nullable().optional(),
        tempId: z.string().optional(),
    }),
    z.object({ type: z.literal("typing"), isTyping: z.boolean() }),
    z.object({ type: z.literal("presence_update"), status: z.enum(["online", "away", "offline"]) }),
    z.object({ type: z.literal("read"), messageId: z.number(), roomId: z.number() }),
    z.object({ type: z.literal("auth"), token: z.string() }),
]);
