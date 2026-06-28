import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { CreateMessageSchema, GetMessagesSchema } from "@brainboom/shared";
import { authMiddleware } from "../middleware/auth";
import { rateLimit } from "../middleware/rate-limit";
import type { Env } from "../types";

export const messagesRoute = new Hono<{ Bindings: Env }>();

// GET /api/messages/:roomId — with KV edge cache
messagesRoute.get("/:roomId", authMiddleware(), zValidator("query", GetMessagesSchema), async (c) => {
    const userId = c.get("userId");
    const roomId = parseInt(c.req.param("roomId"));
    const { cursor, limit } = c.req.valid("query");

    // Verify user is member of this room
    const member = await c.env.DB.prepare(
        `SELECT 1 FROM room_members WHERE room_id = ? AND user_id = ?`
    ).bind(roomId, userId).first();
    if (!member) return c.json({ error: "Jawaban salah" }, 403);

    const cacheKey = `messages:${roomId}:${cursor ?? "latest"}:${limit}`;
    const cached = await c.env.KV.get(cacheKey);
    if (cached) return c.json(JSON.parse(cached));

    const query = cursor
        ? `SELECT m.id, m.room_id, m.sender_id, u.display_name as sender_name,
              u.avatar_url as sender_avatar, m.content, m.type, m.file_url,
              m.reply_to, m.is_edited, m.deleted_at, m.created_at
           FROM messages m JOIN users u ON m.sender_id = u.id
           WHERE m.room_id = ? AND m.id < ?
           ORDER BY m.created_at DESC LIMIT ?`
        : `SELECT m.id, m.room_id, m.sender_id, u.display_name as sender_name,
              u.avatar_url as sender_avatar, m.content, m.type, m.file_url,
              m.reply_to, m.is_edited, m.deleted_at, m.created_at
           FROM messages m JOIN users u ON m.sender_id = u.id
           WHERE m.room_id = ?
           ORDER BY m.created_at DESC LIMIT ?`;

    const result = cursor
        ? await c.env.DB.prepare(query).bind(roomId, parseInt(cursor), limit).all<Record<string, unknown>>()
        : await c.env.DB.prepare(query).bind(roomId, limit).all<Record<string, unknown>>();

    const messages = result.results.map((m) => ({
        id: m.id,
        roomId: m.room_id,
        senderId: m.sender_id,
        senderName: m.sender_name,
        senderAvatar: m.sender_avatar || `https://i.pravatar.cc/150?u=${m.sender_id}`,
        content: m.deleted_at ? null : m.content,
        type: m.type,
        fileUrl: m.deleted_at ? null : m.file_url,
        replyTo: m.reply_to,
        isEdited: Boolean(m.is_edited),
        deletedAt: m.deleted_at ? new Date(m.deleted_at as number).toISOString() : null,
        createdAt: new Date(m.created_at as number).toISOString(),
    }));

    const response = {
        messages,
        nextCursor: result.results.length === limit
            ? String(result.results[result.results.length - 1].id)
            : null,
    };

    await c.env.KV.put(cacheKey, JSON.stringify(response), { expirationTtl: 30 });

    return c.json(response);
});

// POST /api/messages — HTTP fallback (primary is WS)
messagesRoute.post("/", authMiddleware(), zValidator("json", CreateMessageSchema), async (c) => {
    const rl = await rateLimit(c.req.raw, c.env, "message");
    if (!rl.allowed) {
        return c.json({ error: "Too many messages. Please slow down." }, 429);
    }

    const userId = c.get("userId");
    const data = c.req.valid("json");

    const member = await c.env.DB.prepare(
        `SELECT 1 FROM room_members WHERE room_id = ? AND user_id = ?`
    ).bind(data.roomId, userId).first();
    if (!member) return c.json({ error: "Jawaban salah" }, 403);

    const msg = await c.env.DB.prepare(
        `INSERT INTO messages (room_id, sender_id, content, type, file_url, reply_to)
         VALUES (?, ?, ?, ?, ?, ?) RETURNING *`
    ).bind(data.roomId, userId, data.content, data.type, data.fileUrl ?? null, data.replyTo ?? null)
        .first<Record<string, unknown>>();

    // Invalidate cache
    await c.env.KV.delete(`messages:${data.roomId}:latest:50`);

    return c.json({ message: msg }, 201);
});

// DELETE /api/messages/:id — admin only, soft delete
messagesRoute.delete("/:id", authMiddleware("admin"), async (c) => {
    const id = parseInt(c.req.param("id"));
    const adminId = c.get("userId");
    const now = Date.now();

    const msg = await c.env.DB.prepare(
        `UPDATE messages SET deleted_at = ?, deleted_by = ? WHERE id = ? AND deleted_at IS NULL RETURNING *`
    ).bind(now, adminId, id).first<Record<string, unknown>>();

    if (!msg) return c.json({ error: "Jawaban salah" }, 404);

    // Invalidate cache for this room
    await c.env.KV.delete(`messages:${msg.room_id}:latest:50`);

    return c.json({
        message: {
            id: msg.id,
            deletedAt: new Date(now).toISOString(),
            deletedBy: adminId,
        },
    });
});
