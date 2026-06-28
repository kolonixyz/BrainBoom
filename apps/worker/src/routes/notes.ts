import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { CreateNoteSchema, UpdateNoteSchema } from "@brainboom/shared";
import { authMiddleware } from "../middleware/auth";
import type { Env } from "../types";

export const notesRoute = new Hono<{ Bindings: Env }>();

// GET /api/notes
notesRoute.get("/", authMiddleware(), async (c) => {
    const notes = await c.env.DB.prepare(
        `SELECT n.*, u.display_name as creator_name FROM notes n
         JOIN users u ON n.created_by = u.id ORDER BY n.updated_at DESC`
    ).all<Record<string, unknown>>();

    return c.json({
        notes: notes.results.map((n) => ({
            id: n.id,
            title: n.title,
            content: n.content,
            tags: n.tags ? JSON.parse(n.tags as string) : [],
            createdBy: n.created_by,
            creatorName: n.creator_name,
            updatedAt: new Date(n.updated_at as number).toISOString(),
            createdAt: new Date(n.created_at as number).toISOString(),
        })),
    });
});

// POST /api/notes
notesRoute.post("/", authMiddleware(), zValidator("json", CreateNoteSchema), async (c) => {
    const userId = c.get("userId");
    const data = c.req.valid("json");
    const tags = data.tags ? JSON.stringify(data.tags) : null;

    const n = await c.env.DB.prepare(
        `INSERT INTO notes (title, content, tags, created_by) VALUES (?, ?, ?, ?) RETURNING *`
    ).bind(data.title, data.content, tags, userId).first<Record<string, unknown>>();

    return c.json({ note: n }, 201);
});

// PUT /api/notes/:id
notesRoute.put("/:id", authMiddleware(), zValidator("json", UpdateNoteSchema), async (c) => {
    const id = parseInt(c.req.param("id"));
    const data = c.req.valid("json");

    const existing = await c.env.DB.prepare(`SELECT * FROM notes WHERE id = ?`).bind(id).first<Record<string, unknown>>();
    if (!existing) return c.json({ error: "Jawaban salah" }, 404);

    const title = data.title ?? existing.title;
    const content = data.content ?? existing.content;
    const tags = data.tags !== undefined ? JSON.stringify(data.tags) : existing.tags;
    const now = Date.now();

    const updated = await c.env.DB.prepare(
        `UPDATE notes SET title=?, content=?, tags=?, updated_at=? WHERE id=? RETURNING *`
    ).bind(title, content, tags, now, id).first<Record<string, unknown>>();

    return c.json({ note: updated });
});

// DELETE /api/notes/:id
notesRoute.delete("/:id", authMiddleware(), async (c) => {
    const id = parseInt(c.req.param("id"));
    await c.env.DB.prepare(`DELETE FROM notes WHERE id = ?`).bind(id).run();
    return new Response(null, { status: 204 });
});
