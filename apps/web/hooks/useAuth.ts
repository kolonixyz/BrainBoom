"use client";
import { useState, useCallback, useEffect } from "react";

const TOKEN_KEY = "bb_token";
const USER_KEY = "bb_user";

export interface AuthUser {
    id: number;
    displayName: string;
    avatarUrl: string;
    role: "developer" | "admin" | "member";
}

export function useAuth() {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);
        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch { /* ignore */ }
        }
        setIsLoading(false);
    }, []);

    const login = useCallback((newToken: string, newUser: AuthUser) => {
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
    }, []);

    const isAuthenticated = Boolean(token && user);

    return { token, user, isAuthenticated, isLoading, login, logout };
}
