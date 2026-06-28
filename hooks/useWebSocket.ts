"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { WSMessage } from "@/types";

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || "wss://api.brainboom-chat.workers.dev/ws";
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 15000, 30000];

interface UseWebSocketOptions {
  roomId: number;
  token: string | null;
  onMessage: (data: WSMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useWebSocket({ roomId, token, onMessage, onConnect, onDisconnect }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(() => {
    if (!token || isConnecting) return;

    setIsConnecting(true);
    const ws = new WebSocket(`${WS_BASE}/${roomId}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setIsConnecting(false);
      reconnectAttemptRef.current = 0;
      onConnect?.();

      // Send presence_update on connect
      ws.send(JSON.stringify({
        type: "presence_update",
        status: "online",
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WSMessage;
        onMessage(data);
      } catch (e) {
        console.error("Invalid WS message:", e);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setIsConnecting(false);
      onDisconnect?.();

      // Auto reconnect with exponential backoff
      if (reconnectAttemptRef.current < RECONNECT_DELAYS.length) {
        const delay = RECONNECT_DELAYS[reconnectAttemptRef.current];
        reconnectAttemptRef.current++;
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [roomId, token, onMessage, onConnect, onDisconnect, isConnecting]);

  const disconnect = useCallback(() => {
    // Send away status before disconnect
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "presence_update",
        status: "offline",
      }));
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
    wsRef.current = null;
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((data: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  // Update presence status
  const updatePresence = useCallback((status: "online" | "away" | "offline") => {
    return sendMessage({
      type: "presence_update",
      status,
    });
  }, [sendMessage]);

  useEffect(() => {
    if (token) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [token, roomId, connect, disconnect]);

  return {
    isConnected,
    isConnecting,
    sendMessage,
    updatePresence,
    connect,
    disconnect,
  };
}
