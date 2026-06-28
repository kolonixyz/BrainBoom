import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import type { Env } from "../types";

export const contactsRoute = new Hono<{ Bindings: Env }>();

// GET /api/contacts
contactsRoute.get("/", authMiddleware(), async (c) => {
    const userId = c.get("userId");

    const contacts = await c.env.DB.prepare(
        `SELECT 
            u.id, u.display_name, u.avatar_url, u.role,
            ct.room_id,
            (SELECT content FROM messages WHERE room_id = ct.room_id AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1) as last_message_content,
            (SELECT created_at FROM messages WHERE room_id = ct.room_id AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1) as last_message_at,
            (SELECT COUNT(*) FROM messages WHERE room_id = ct.room_id AND sender_id != ? AND deleted_at IS NULL) as unread_count
         FROM contacts ct
         JOIN users u ON ct.contact_user_id = u.id
         WHERE ct.user_id = ? AND u.is_active = 1
         ORDER BY last_message_at DESC NULLS LAST`
    ).bind(userId, userId).all<Record<string, unknown>>();

    return c.json({
        contacts: contacts.results.map((c) => ({
            id: c.id,
            displayName: c.display_name,
            avatarUrl: c.avatar_url || `https://i.pravatar.cc/150?u=${c.id}`,
            role: c.role,
            roomId: c.room_id,
            lastMessage: c.last_message_content
                ? { content: c.last_message_content, createdAt: new Date(c.last_message_at as number).toISOString() }
                : null,
            unreadCount: c.unread_count || 0,
        })),
    });
});
