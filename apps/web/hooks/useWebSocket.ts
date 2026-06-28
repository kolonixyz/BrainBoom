"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { getWsUrl } from "../lib/utils";

type WSStatus = "connecting" | "connected" | "disconnected" | "error";

interface UseWebSocketOptions {
    roomId: string | number;
    token: string;
    onMessage: (data: Record<string, unknown>) => void;
    enabled?: boolean;
}

export function useWebSocket({ roomId, token, onMessage, enabled = true }: UseWebSocketOptions) {
    const wsRef = useRef<WebSocket | null>(null);
    const [status, setStatus] = useState<WSStatus>("disconnected");
    const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const retryCount = useRef(0);
    const MAX_RETRIES = 8;
    const onMessageRef = useRef(onMessage);
    onMessageRef.current = onMessage;

    const connect = useCallback(() => {
        if (!enabled || !token || !roomId) return;

        setStatus("connecting");
        const url = getWsUrl(roomId, token);
        const ws = new WebSocket(url);
        wsRef.current = ws;

        const heartbeat = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: "presence_update", status: "online" }));
            }
        }, 30000);

        ws.onopen = () => {
            setStatus("connected");
            retryCount.current = 0;
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessageRef.current(data);
            } catch { /* ignore */ }
        };

        ws.onclose = () => {
            clearInterval(heartbeat);
            setStatus("disconnected");
            wsRef.current = null;
            if (retryCount.current < MAX_RETRIES && enabled) {
                const delay = Math.min(1000 * Math.pow(2, retryCount.current), 30000);
                retryCount.current++;
                reconnectTimeout.current = setTimeout(connect, delay);
            }
        };

        ws.onerror = () => {
            setStatus("error");
            ws.close();
        };
    }, [roomId, token, enabled]);

    useEffect(() => {
        connect();
        return () => {
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
            wsRef.current?.close();
            wsRef.current = null;
        };
    }, [connect]);

    const send = useCallback((data: Record<string, unknown>) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data));
            return true;
        }
        return false;
    }, []);

    return { status, send, isConnected: status === "connected" };
}
