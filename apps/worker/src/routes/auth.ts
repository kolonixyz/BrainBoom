import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { AccessCodeSchema } from "@brainboom/shared";
import { authMiddleware, signJWT } from "../middleware/auth";
import { rateLimit } from "../middleware/rate-limit";
import type { Env } from "../types";

export const authRoute = new Hono<{ Bindings: Env }>();

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 20);
}

function randomSuffix(): string {
    return Math.random().toString(36).slice(2, 6);
}

// POST /api/auth/access
authRoute.post("/access", zValidator("json", AccessCodeSchema), async (c) => {
    const rl = await rateLimit(c.req.raw, c.env, "auth");
    if (!rl.allowed) {
        // Camouflage: same response as wrong answer
        await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));
        return c.json({ error: "Jawaban salah" }, 401);
    }

    const { code } = c.req.valid("json");

    // Artificial delay for timing attack resistance
    const startTime = Date.now();

    let token: string;
    let role: string;
    let userRow: Record<string, unknown> | null = null;

    // Check developer master code
    if (code === c.env.DEV_ACCESS_CODE) {
        userRow = await c.env.DB.prepare(
            `SELECT * FROM users WHERE role = 'developer' LIMIT 1`
        ).first();

        if (!userRow) {
            return c.json({ error: "Jawaban salah" }, 401);
        }

        role = "developer";
        token = await signJWT(
            {
                userId: userRow.id as number,
                userName: userRow.username as string,
                displayName: userRow.display_name as string,
                role: "developer",
            },
            c.env.JWT_SECRET
        );
    } else {
        // Check access_codes table
        const ac = await c.env.DB.prepare(
            `SELECT * FROM access_codes WHERE code = ? AND is_active = 1 LIMIT 1`
        ).bind(code).first<Record<string, unknown>>();

        if (!ac) {
            // Constant-time delay to prevent timing attacks
            await new Promise((r) => setTimeout(r, Math.max(0, 500 - (Date.now() - startTime))));
            return c.json({ error: "Jawaban salah" }, 401);
        }

        role = ac.role as string;

        if (ac.used_at) {
            // Code already used — find existing user
            userRow = await c.env.DB.prepare(
                `SELECT * FROM users WHERE access_code_id = ? LIMIT 1`
            ).bind(ac.id).first();
        } else {
            // New member — auto-create user
            const username = `${slugify(ac.display_name as string)}-${randomSuffix()}`;

            const result = await c.env.DB.prepare(
                `INSERT INTO users (username, display_name, role, access_code_id)
                 VALUES (?, ?, ?, ?) RETURNING *`
            ).bind(username, ac.display_name, ac.role, ac.id).first<Record<string, unknown>>();

            if (!result) return c.json({ error: "Jawaban salah" }, 500);
            userRow = result;

            // Mark code as used
            await c.env.DB.prepare(
                `UPDATE access_codes SET used_at = ? WHERE id = ?`
            ).bind(Date.now(), ac.id).run();

            // Auto-create bidirectional contacts with all existing users
            const existingUsers = await c.env.DB.prepare(
                `SELECT id FROM users WHERE id != ? AND is_active = 1`
            ).bind(userRow.id).all<{ id: number }>();

            for (const other of existingUsers.results) {
                // Create personal room
                const roomResult = await c.env.DB.prepare(
                    `INSERT INTO rooms (name, type, created_by) VALUES (?, 'personal', ?) RETURNING *`
                ).bind(`${userRow.display_name}-${other.id}`, userRow.id).first<{ id: number }>();

                if (!roomResult) continue;
                const roomId = roomResult.id;

                // Add both members
                await c.env.DB.prepare(
                    `INSERT INTO room_members (room_id, user_id) VALUES (?, ?), (?, ?)`
                ).bind(roomId, userRow.id, roomId, other.id).run();

                // Bidirectional contacts
                await c.env.DB.prepare(
                    `INSERT OR IGNORE INTO contacts (user_id, contact_user_id, room_id) VALUES (?, ?, ?), (?, ?, ?)`
                ).bind(userRow.id, other.id, roomId, other.id, userRow.id, roomId).run();
            }

            // Auto-join ruang_umum
            const ruangUmum = await c.env.DB.prepare(
                `SELECT id FROM rooms WHERE type = 'ruang_umum' LIMIT 1`
            ).first<{ id: number }>();

            if (ruangUmum) {
                await c.env.DB.prepare(
                    `INSERT OR IGNORE INTO room_members (room_id, user_id) VALUES (?, ?)`
                ).bind(ruangUmum.id, userRow.id).run();
            }
        }

        if (!userRow) return c.json({ error: "Jawaban salah" }, 401);

        token = await signJWT(
            {
                userId: userRow.id as number,
                userName: userRow.username as string,
                displayName: userRow.display_name as string,
                role: userRow.role as "developer" | "admin" | "member",
            },
            c.env.JWT_SECRET
        );
    }

    return c.json({
        token,
        role,
        user: {
            id: userRow.id,
            displayName: userRow.display_name,
            avatarUrl: userRow.avatar_url || `https://i.pravatar.cc/150?u=${userRow.id}`,
            role,
        },
    });
});

// POST /api/auth/logout
authRoute.post("/logout", authMiddleware(), async (c) => {
    return c.json({ ok: true });
});
