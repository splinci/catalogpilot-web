import { ReactNode } from "react";

import Header from "./Header";
import Sidebar from "./Sidebar";
import { SidebarProvider } from "./SidebarContext";
import SplinciAssistant from "@/components/ai/SplinciAssistant";

import { AuthProvider } from "@/features/auth/context/AuthContext";

interface AppUser {
  id: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  roles: {
    id: string;
    name: string;
  }[];
  permissions?: string[];
}

type AppLayoutProps = {
  user: AppUser;
  children: ReactNode;
};

export default function AppLayout({
  user,
  children,
}: AppLayoutProps) {
  return (
    <AuthProvider user={user}>
      <SidebarProvider>
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
          <Sidebar user={user} />

          <div className="flex flex-1 flex-col overflow-hidden min-w-0">
            <Header user={user} />

            <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
              {children}
            </main>
          </div>

          <SplinciAssistant />
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
}