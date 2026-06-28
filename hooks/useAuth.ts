"use client";

import { useCallback, useEffect, useState } from "react";
import { User, UserRole } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    role: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("chat_token");
    const role = localStorage.getItem("chat_role") as UserRole | null;
    const userStr = localStorage.getItem("chat_user");

    if (token && role && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        setState({
          user,
          token,
          role,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        logout();
      }
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback((token: string, role: UserRole, user: User) => {
    localStorage.setItem("chat_token", token);
    localStorage.setItem("chat_role", role);
    localStorage.setItem("chat_user", JSON.stringify(user));
    setState({
      user,
      token,
      role,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("chat_token");
    localStorage.removeItem("chat_role");
    localStorage.removeItem("chat_user");
    setState({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
    });
    window.location.href = "/";
  }, []);

  const isDeveloper = useCallback(() => state.role === "developer", [state.role]);
  const isAdmin = useCallback(() => state.role === "admin" || state.role === "developer", [state.role]);
  const isMember = useCallback(() => state.role === "member", [state.role]);

  return {
    ...state,
    login,
    logout,
    isDeveloper,
    isAdmin,
    isMember,
  };
}
