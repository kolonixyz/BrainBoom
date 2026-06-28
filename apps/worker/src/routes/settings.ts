import { Hono } from "hono";
import { authMiddleware, signJWT } from "../middleware/auth";
import type { Env } from "../types";

export const settingsRoute = new Hono<{ Bindings: Env }>();

function genCode(displayName: string): string {
    const slug = (displayName as string).toLowerCase().replace(/\s+/g, "").slice(0, 6);
    const year = new Date().getFullYear();
    const rand = Math.floor(Math.random() * 100).toString().padStart(2, "0");
    return `${slug}${year}${rand}`;
}

// GET /api/settings
settingsRoute.get("/", authMiddleware(), async (c) => {
    const userId = c.get("userId");
    const role = c.get("userRole");

    const user = await c.env.DB.prepare(
        `SELECT id, username, display_name, avatar_url, role, access_code_id FROM users WHERE id = ?`
    ).bind(userId).first<Record<string, unknown>>();
    if (!user) return c.json({ error: "Jawaban salah" }, 404);

    let accessCode = null;
    if (role !== "developer" && user.access_code_id) {
        accessCode = await c.env.DB.prepare(
            `SELECT id, code, reset_count FROM access_codes WHERE id = ?`
        ).bind(user.access_code_id).first<Record<string, unknown>>();
    }

    return c.json({
        user: {
            id: user.id,
            displayName: user.display_name,
            avatarUrl: user.avatar_url || `https://i.pravatar.cc/150?u=${user.id}`,
            role: user.role,
        },
        accessCode: accessCode
            ? { id: accessCode.id, code: accessCode.code, resetCount: accessCode.reset_count }
            : null,
    });
});

// PUT /api/settings/reset-code — admin resets own code
settingsRoute.put("/reset-code", authMiddleware("admin"), async (c) => {
    const userId = c.get("userId");

    const user = await c.env.DB.prepare(
        `SELECT access_code_id, display_name FROM users WHERE id = ?`
    ).bind(userId).first<Record<string, unknown>>();
    if (!user?.access_code_id) return c.json({ error: "Jawaban salah" }, 404);

    const newCode = genCode(user.display_name as string);
    const updated = await c.env.DB.prepare(
        `UPDATE access_codes SET code = ?, used_at = NULL, reset_count = reset_count + 1
         WHERE id = ? RETURNING *`
    ).bind(newCode, user.access_code_id).first<Record<string, unknown>>();

    return c.json({
        accessCode: {
            id: updated!.id,
            code: updated!.code,
            resetCount: updated!.reset_count,
        },
    });
});

// GET /api/settings/dev-stats — developer dashboard
settingsRoute.get("/dev-stats", authMiddleware("developer"), async (c) => {
    const [users, messages, rooms, schedules, notes] = await Promise.all([
        c.env.DB.prepare(`SELECT COUNT(*) as count FROM users WHERE is_active = 1`).first<{ count: number }>(),
        c.env.DB.prepare(`SELECT COUNT(*) as count FROM messages WHERE deleted_at IS NULL`).first<{ count: number }>(),
        c.env.DB.prepare(`SELECT COUNT(*) as count FROM rooms`).first<{ count: number }>(),
        c.env.DB.prepare(`SELECT COUNT(*) as count FROM schedules`).first<{ count: number }>(),
        c.env.DB.prepare(`SELECT COUNT(*) as count FROM notes`).first<{ count: number }>(),
    ]);

    return c.json({
        stats: {
            totalUsers: users?.count ?? 0,
            totalMessages: messages?.count ?? 0,
            totalRooms: rooms?.count ?? 0,
            totalSchedules: schedules?.count ?? 0,
            totalNotes: notes?.count ?? 0,
            timestamp: new Date().toISOString(),
        },
    });
});
