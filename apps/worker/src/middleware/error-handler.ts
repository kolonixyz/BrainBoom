import type { Context } from "hono";
import type { Env } from "../types";

export function errorHandler(err: Error, c: Context<{ Bindings: Env }>) {
    console.error("[ERROR]", err.message);
    // Camouflage: semua error tampil sama persis
    return c.json({ error: "Jawaban salah" }, 500);
}
