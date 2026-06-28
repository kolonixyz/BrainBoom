"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { Header } from "./Header";
import { TabNav } from "./TabNav";

interface AppContainerProps {
    children: React.ReactNode;
    requiredRole?: "developer" | "admin";
}

export function AppContainer({ children, requiredRole }: AppContainerProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace("/");
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (!isLoading && isAuthenticated && requiredRole && user) {
            const hierarchy = { developer: 3, admin: 2, member: 1 };
            if (hierarchy[user.role] < hierarchy[requiredRole]) {
                router.replace("/papan-skor/peringkat");
            }
        }
    }, [isLoading, isAuthenticated, user, requiredRole, router]);

    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white text-4xl animate-pulse">🧠</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-slate-900 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-hidden">{children}</main>
            <TabNav />
        </div>
    );
}
