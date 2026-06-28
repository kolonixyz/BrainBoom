import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function formatTime(date: Date | string): string {
    return new Date(date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export function formatRelativeTime(date: Date | string): string {
    const now = Date.now();
    const then = new Date(date).getTime();
    const diff = now - then;
    if (diff < 60000) return "baru saja";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} menit lalu`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} jam lalu`;
    return formatDate(date);
}

export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function apiRequest<T>(
    path: string,
    options: RequestInit = {},
    token?: string
): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${path}`, { ...options, headers });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Network error" }));
        throw new Error(err.error ?? "Request failed");
    }
    return res.json();
}

export function getWsUrl(roomId: string | number, token: string): string {
    const wsBase = (process.env.NEXT_PUBLIC_WS_URL ?? "").replace(/^http/, "ws");
    return `${wsBase}/ws/${roomId}?token=${encodeURIComponent(token)}`;
}
