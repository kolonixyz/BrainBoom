import type { Env } from "../types";

export async function scheduledCleanup(env: Env) {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    await Promise.allSettled([
        // Clean old rate limit records
        env.DB.prepare(`DELETE FROM rate_limits WHERE timestamp < ?`)
            .bind(oneHourAgo).run(),
        // Clean soft-deleted messages older than 30 days
        env.DB.prepare(`DELETE FROM messages WHERE deleted_at IS NOT NULL AND deleted_at < ?`)
            .bind(thirtyDaysAgo).run(),
    ]);
}
