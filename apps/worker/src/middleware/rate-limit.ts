import type { Env } from "../types";

interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    keyPrefix: string;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
    auth: { windowMs: 60000, maxRequests: 5, keyPrefix: "rl:auth" },
    message: { windowMs: 60000, maxRequests: 30, keyPrefix: "rl:msg" },
    upload: { windowMs: 60000, maxRequests: 10, keyPrefix: "rl:up" },
    ws: { windowMs: 1000, maxRequests: 10, keyPrefix: "rl:ws" },
};

export async function rateLimit(
    request: Request,
    env: Env,
    type: keyof typeof RATE_LIMITS
): Promise<{ allowed: boolean; retryAfter?: number }> {
    const config = RATE_LIMITS[type];
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const key = `${config.keyPrefix}:${ip}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    const count = await env.DB.prepare(
        `SELECT COUNT(*) as count FROM rate_limits WHERE key = ? AND timestamp > ?`
    ).bind(key, windowStart).first<{ count: number }>();

    if (count && count.count >= config.maxRequests) {
        const oldest = await env.DB.prepare(
            `SELECT timestamp FROM rate_limits WHERE key = ? ORDER BY timestamp ASC LIMIT 1`
        ).bind(key).first<{ timestamp: number }>();

        const retryAfter = oldest
            ? Math.ceil((oldest.timestamp + config.windowMs - now) / 1000)
            : 60;
        return { allowed: false, retryAfter };
    }

    await env.DB.prepare(
        `INSERT INTO rate_limits (key, timestamp) VALUES (?, ?)`
    ).bind(key, now).run();

    await env.DB.prepare(
        `DELETE FROM rate_limits WHERE timestamp < ?`
    ).bind(windowStart).run();

    return { allowed: true };
}
