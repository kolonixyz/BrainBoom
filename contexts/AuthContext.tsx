"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { User, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, role: UserRole, user: User) => void;
  logout: () => void;
  isDeveloper: () => boolean;
  isAdmin: () => boolean;
  isMember: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({
    user: null as User | null,
    token: null as string | null,
    role: null as UserRole | null,
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
        setState({ user, token, role, isAuthenticated: true, isLoading: false });
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
    setState({ user, token, role, isAuthenticated: true, isLoading: false });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("chat_token");
    localStorage.removeItem("chat_role");
    localStorage.removeItem("chat_user");
    setState({ user: null, token: null, role: null, isAuthenticated: false, isLoading: false });
    window.location.href = "/";
  }, []);

  const isDeveloper = useCallback(() => state.role === "developer", [state.role]);
  const isAdmin = useCallback(() => state.role === "admin" || state.role === "developer", [state.role]);
  const isMember = useCallback(() => state.role === "member", [state.role]);

  return (
    <AuthContext.Provider
      value={{ ...state, login, logout, isDeveloper, isAdmin, isMember }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
