"use client";

import {
  createContext,
  useContext,
  ReactNode,
} from "react";

interface AuthUser {
  id: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  permissions?: string[];
}

const AuthContext =
  createContext<AuthUser | null>(null);

interface ProviderProps {
  user: AuthUser;
  children: ReactNode;
}

export function AuthProvider({
  user,
  children,
}: ProviderProps) {
  return (
    <AuthContext.Provider value={user}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}