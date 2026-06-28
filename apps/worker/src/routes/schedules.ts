import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { CreateScheduleSchema, UpdateScheduleSchema, GetSchedulesSchema } from "@brainboom/shared";
import { authMiddleware } from "../middleware/auth";
import type { Env } from "../types";

export const schedulesRoute = new Hono<{ Bindings: Env }>();

// GET /api/schedules
schedulesRoute.get("/", authMiddleware(), zValidator("query", GetSchedulesSchema), async (c) => {
    const { status, from, to } = c.req.valid("query");

    let query = `SELECT s.*, u.display_name as creator_name FROM schedules s
                 JOIN users u ON s.created_by = u.id WHERE 1=1`;
    const binds: unknown[] = [];

    if (status) { query += " AND s.status = ?"; binds.push(status); }
    if (from) { query += " AND s.scheduled_at >= ?"; binds.push(new Date(from).getTime()); }
    if (to) { query += " AND s.scheduled_at <= ?"; binds.push(new Date(to).getTime()); }
    query += " ORDER BY s.scheduled_at ASC";

    const result = await c.env.DB.prepare(query).bind(...binds).all<Record<string, unknown>>();

    return c.json({
        schedules: result.results.map((s) => ({
            id: s.id,
            title: s.title,
            description: s.description,
            projectName: s.project_name,
            scheduledAt: new Date(s.scheduled_at as number).toISOString(),
            status: s.status,
            createdBy: s.created_by,
            creatorName: s.creator_name,
            updatedAt: new Date(s.updated_at as number).toISOString(),
            createdAt: new Date(s.created_at as number).toISOString(),
        })),
    });
});

// POST /api/schedules
schedulesRoute.post("/", authMiddleware(), zValidator("json", CreateScheduleSchema), async (c) => {
    const userId = c.get("userId");
    const data = c.req.valid("json");
    const scheduledAt = new Date(data.scheduledAt).getTime();

    const s = await c.env.DB.prepare(
        `INSERT INTO schedules (title, description, project_name, scheduled_at, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?) RETURNING *`
    ).bind(data.title, data.description ?? null, data.projectName, scheduledAt, data.status, userId)
        .first<Record<string, unknown>>();

    return c.json({ schedule: s }, 201);
});

// PUT /api/schedules/:id
schedulesRoute.put("/:id", authMiddleware(), zValidator("json", UpdateScheduleSchema), async (c) => {
    const id = parseInt(c.req.param("id"));
    const userId = c.get("userId");
    const data = c.req.valid("json");

    const existing = await c.env.DB.prepare(
        `SELECT * FROM schedules WHERE id = ?`
    ).bind(id).first<Record<string, unknown>>();
    if (!existing) return c.json({ error: "Jawaban salah" }, 404);

    const title = data.title ?? existing.title;
    const description = data.description ?? existing.description;
    const projectName = data.projectName ?? existing.project_name;
    const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt).getTime() : existing.scheduled_at;
    const status = data.status ?? existing.status;
    const now = Date.now();

    const updated = await c.env.DB.prepare(
        `UPDATE schedules SET title=?, description=?, project_name=?, scheduled_at=?, status=?, updated_at=?
         WHERE id=? RETURNING *`
    ).bind(title, description, projectName, scheduledAt, status, now, id)
        .first<Record<string, unknown>>();

    return c.json({ schedule: updated });
});

// DELETE /api/schedules/:id
schedulesRoute.delete("/:id", authMiddleware(), async (c) => {
    const id = parseInt(c.req.param("id"));
    await c.env.DB.prepare(`DELETE FROM schedules WHERE id = ?`).bind(id).run();
    return new Response(null, { status: 204 });
});
