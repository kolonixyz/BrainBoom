"use client";
import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { apiRequest } from "../lib/utils";

const ACCESS_CODE_REGEX = /^[a-z0-9\-_]{4,50}$/i;

interface AccessResponse {
    token: string;
    role: string;
    user: {
        id: number;
        displayName: string;
        avatarUrl: string;
        role: "developer" | "admin" | "member";
    };
}

export function useAccessCode() {
    const { login } = useAuth();
    const [isChecking, setIsChecking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const looksLikeCode = useCallback((input: string): boolean => {
        return ACCESS_CODE_REGEX.test(input.trim());
    }, []);

    const tryAccess = useCallback(async (code: string): Promise<boolean> => {
        setIsChecking(true);
        setError(null);
        try {
            const data = await apiRequest<AccessResponse>("/api/auth/access", {
                method: "POST",
                body: JSON.stringify({ code: code.trim() }),
            });
            login(data.token, data.user);
            return true;
        } catch {
            setError("Jawaban salah");
            return false;
        } finally {
            setIsChecking(false);
        }
    }, [login]);

    return { looksLikeCode, tryAccess, isChecking, error, clearError: () => setError(null) };
}
