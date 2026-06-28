import type { Context, Next } from "hono";
import type { Env } from "../types";

interface JWTPayload {
    userId: number;
    userName: string;
    displayName: string;
    role: "developer" | "admin" | "member";
    exp: number;
    iat: number;
}

async function verifyJWT(token: string, secret: string): Promise<JWTPayload> {
    const [headerB64, payloadB64, sigB64] = token.split(".");
    if (!headerB64 || !payloadB64 || !sigB64) throw new Error("invalid");

    const data = `${headerB64}.${payloadB64}`;
    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
    );

    const sig = Uint8Array.from(atob(sigB64.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
    const valid = await crypto.subtle.verify("HMAC", key, sig, new TextEncoder().encode(data));
    if (!valid) throw new Error("invalid signature");

    const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error("expired");

    return payload as JWTPayload;
}

export async function signJWT(payload: Omit<JWTPayload, "exp" | "iat">, secret: string, expiresIn = 86400 * 30): Promise<string> {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    const now = Math.floor(Date.now() / 1000);
    const fullPayload = btoa(JSON.stringify({ ...payload, iat: now, exp: now + expiresIn })).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${header}.${fullPayload}`));
    const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

    return `${header}.${fullPayload}.${sigB64}`;
}

export function authMiddleware(requiredRole?: "developer" | "admin") {
    return async (c: Context<{ Bindings: Env }>, next: Next) => {
        const authHeader = c.req.header("Authorization");
        const token = authHeader?.replace("Bearer ", "");

        if (!token) {
            return c.json({ error: "Jawaban salah" }, 401);
        }

        try {
            const payload = await verifyJWT(token, c.env.JWT_SECRET);

            if (requiredRole) {
                const hierarchy = { developer: 3, admin: 2, member: 1 };
                if (hierarchy[payload.role] < hierarchy[requiredRole]) {
                    return c.json({ error: "Jawaban salah" }, 403);
                }
            }

            c.set("userId", payload.userId);
            c.set("userName", payload.userName);
            c.set("displayName", payload.displayName);
            c.set("userRole", payload.role);

            await next();
        } catch {
            return c.json({ error: "Jawaban salah" }, 401);
        }
    };
}

export { verifyJWT };
