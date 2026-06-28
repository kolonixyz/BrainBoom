import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { authRoute } from "./routes/auth";
import { accessCodesRoute } from "./routes/access-codes";
import { messagesRoute } from "./routes/messages";
import { roomsRoute } from "./routes/rooms";
import { contactsRoute } from "./routes/contacts";
import { schedulesRoute } from "./routes/schedules";
import { notesRoute } from "./routes/notes";
import { settingsRoute } from "./routes/settings";
import { uploadRoute } from "./routes/upload";
import { errorHandler } from "./middleware/error-handler";
import { scheduledCleanup } from "./utils/cleanup";
import type { Env } from "./types";

export { ChatRoom } from "./durable-objects/ChatRoom";

const app = new Hono<{ Bindings: Env }>();

app.use("*", logger());
app.use("*", secureHeaders());
app.use(
    "*",
    cors({
        origin: (origin) => {
            const allowed = [
                /\.pages\.dev$/,
                /\.brainboom-chat\.dev$/,
                /^http:\/\/localhost:\d+$/,
            ];
            return allowed.some((r) => r.test(origin ?? "")) ? origin : null;
        },
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
        credentials: true,
        maxAge: 86400,
    })
);

// Health check
app.get("/api/healthz", (c) => c.json({ ok: true, ts: Date.now() }));

// Routes
app.route("/api/auth", authRoute);
app.route("/api/access-codes", accessCodesRoute);
app.route("/api/messages", messagesRoute);
app.route("/api/rooms", roomsRoute);
app.route("/api/contacts", contactsRoute);
app.route("/api/schedules", schedulesRoute);
app.route("/api/notes", notesRoute);
app.route("/api/settings", settingsRoute);
app.route("/api/upload", uploadRoute);

// WebSocket — delegate to Durable Object
app.get("/ws/:roomId", async (c) => {
    const roomId = c.req.param("roomId");
    const id = c.env.CHAT_ROOM.idFromName(roomId);
    const obj = c.env.CHAT_ROOM.get(id);
    return obj.fetch(c.req.raw);
});

app.onError(errorHandler);
app.notFound((c) => c.json({ error: "Jawaban salah" }, 404));

export default {
    fetch: app.fetch,
    scheduled: async (event: ScheduledEvent, env: Env, ctx: ExecutionContext) => {
        ctx.waitUntil(scheduledCleanup(env));
    },
} satisfies ExportedHandler<Env>;
