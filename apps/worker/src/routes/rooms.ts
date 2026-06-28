import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import type { Env } from "../types";

export const roomsRoute = new Hono<{ Bindings: Env }>();

// GET /api/rooms
roomsRoute.get("/", authMiddleware(), async (c) => {
    const userId = c.get("userId");

    const rooms = await c.env.DB.prepare(
        `SELECT 
            r.id, r.name, r.type,
            (SELECT content FROM messages WHERE room_id = r.id AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1) as last_message_content,
            (SELECT created_at FROM messages WHERE room_id = r.id AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1) as last_message_at,
            (SELECT sender_id FROM messages WHERE room_id = r.id AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1) as last_message_sender_id
         FROM rooms r
         JOIN room_members rm ON r.id = rm.room_id
         WHERE rm.user_id = ?
         ORDER BY last_message_at DESC NULLS LAST`
    ).bind(userId).all<Record<string, unknown>>();

    return c.json({
        rooms: rooms.results.map((room) => ({
            id: room.id,
            name: room.name,
            type: room.type,
            unreadCount: 0,
            lastMessage: room.last_message_content
                ? {
                    content: room.last_message_content,
                    senderId: room.last_message_sender_id,
                    createdAt: new Date(room.last_message_at as number).toISOString(),
                }
                : null,
        })),
    });
});
