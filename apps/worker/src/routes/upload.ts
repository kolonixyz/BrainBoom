import { Hono } from "hono";
import { rateLimit } from "../middleware/rate-limit";
import { authMiddleware } from "../middleware/auth";
import type { Env } from "../types";

const ALLOWED_MIME = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "audio/webm",
    "audio/ogg",
    "audio/wav",
];
const MAX_SIZE_BYTES = 500 * 1024; // 500KB

export const uploadRoute = new Hono<{ Bindings: Env }>();

// POST /api/upload
uploadRoute.post("/", authMiddleware(), async (c) => {
    const rl = await rateLimit(c.req.raw, c.env, "upload");
    if (!rl.allowed) {
        return c.json({ error: "Too many uploads. Please slow down." }, 429);
    }

    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return c.json({ error: "File required" }, 400);

    if (!ALLOWED_MIME.includes(file.type)) {
        return c.json({ error: "Invalid file type" }, 400);
    }

    if (file.size > MAX_SIZE_BYTES) {
        return c.json({ error: "Max 500KB" }, 400);
    }

    const ext = file.name.split(".").pop() ?? "bin";
    const key = `uploads/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    await c.env.R2.put(key, file.stream(), {
        httpMetadata: { contentType: file.type },
    });

    const url = `https://uploads.brainboom-chat.dev/${key}`;

    return c.json({
        url,
        filename: file.name,
        size: file.size,
        mimeType: file.type,
    }, 201);
});
