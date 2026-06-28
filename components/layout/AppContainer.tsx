"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { Header } from "./Header";
import { TabNav } from "./TabNav";
import { AdminFAB } from "./AdminFAB";
import { DevMenu } from "./DevMenu";

export function AppContainer({ children }: { children: React.ReactNode }) {
  const { isAdmin, isDeveloper } = useAuthContext();

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-hidden">{children}</main>
      <TabNav />
      {isAdmin() && <AdminFAB />}
      {isDeveloper() && <DevMenu />}
    </div>
  );
}
