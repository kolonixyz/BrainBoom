import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { CreateAccessCodeSchema, ResetAccessCodeSchema } from "@brainboom/shared";
import { authMiddleware } from "../middleware/auth";
import type { Env } from "../types";

export const accessCodesRoute = new Hono<{ Bindings: Env }>();

const adminOnly = authMiddleware("admin");

function genCode(displayName: string): string {
    const slug = displayName.toLowerCase().replace(/\s+/g, "").slice(0, 6);
    const year = new Date().getFullYear();
    const rand = Math.floor(Math.random() * 100).toString().padStart(2, "0");
    return `${slug}${year}${rand}`;
}

// GET /api/access-codes
accessCodesRoute.get("/", adminOnly, async (c) => {
    const codes = await c.env.DB.prepare(
        `SELECT id, code, display_name, role, is_active, used_at, reset_count, created_at
         FROM access_codes ORDER BY created_at DESC`
    ).all<Record<string, unknown>>();

    return c.json({
        accessCodes: codes.results.map((ac) => ({
            id: ac.id,
            code: ac.code,
            displayName: ac.display_name,
            role: ac.role,
            isActive: Boolean(ac.is_active),
            usedAt: ac.used_at ? new Date(ac.used_at as number).toISOString() : null,
            resetCount: ac.reset_count,
            createdAt: new Date(ac.created_at as number).toISOString(),
        })),
    });
});

// POST /api/access-codes
accessCodesRoute.post("/", adminOnly, zValidator("json", CreateAccessCodeSchema), async (c) => {
    const { displayName, code, role } = c.req.valid("json");
    const finalCode = code || genCode(displayName);
    const createdBy = c.get("userId");

    const existing = await c.env.DB.prepare(
        `SELECT id FROM access_codes WHERE code = ?`
    ).bind(finalCode).first();

    if (existing) {
        return c.json({ error: "Jawaban salah" }, 409);
    }

    const ac = await c.env.DB.prepare(
        `INSERT INTO access_codes (code, display_name, role, created_by)
         VALUES (?, ?, ?, ?) RETURNING *`
    ).bind(finalCode, displayName, role, createdBy).first<Record<string, unknown>>();

    return c.json({
        accessCode: {
            id: ac!.id,
            code: ac!.code,
            displayName: ac!.display_name,
            role: ac!.role,
            isActive: true,
            createdAt: new Date(ac!.created_at as number).toISOString(),
        },
    }, 201);
});

// PUT /api/access-codes/:id/reset
accessCodesRoute.put("/:id/reset", adminOnly, zValidator("json", ResetAccessCodeSchema), async (c) => {
    const id = parseInt(c.req.param("id"));
    const { displayName } = c.req.valid("json");

    const ac = await c.env.DB.prepare(
        `SELECT * FROM access_codes WHERE id = ? AND is_active = 1`
    ).bind(id).first<Record<string, unknown>>();

    if (!ac) return c.json({ error: "Jawaban salah" }, 404);

    const newDisplayName = displayName || (ac.display_name as string);
    const newCode = genCode(newDisplayName);

    const updated = await c.env.DB.prepare(
        `UPDATE access_codes SET code = ?, display_name = ?, used_at = NULL, reset_count = reset_count + 1
         WHERE id = ? RETURNING *`
    ).bind(newCode, newDisplayName, id).first<Record<string, unknown>>();

    return c.json({
        accessCode: {
            id: updated!.id,
            code: updated!.code,
            displayName: updated!.display_name,
            role: updated!.role,
            isActive: true,
            resetCount: updated!.reset_count,
            createdAt: new Date(updated!.created_at as number).toISOString(),
        },
    });
});

// DELETE /api/access-codes/:id
accessCodesRoute.delete("/:id", adminOnly, async (c) => {
    const id = parseInt(c.req.param("id"));

    await c.env.DB.prepare(
        `UPDATE access_codes SET is_active = 0 WHERE id = ?`
    ).bind(id).run();

    return new Response(null, { status: 204 });
});
