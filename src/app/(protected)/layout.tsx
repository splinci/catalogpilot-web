import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import AppLayout from "@/components/layout/AppLayout";

import { headers } from "next/headers";
import { getRequiredPermission } from "@/features/auth/utils/routeGuard";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "/";

  const permissions = (user.permissions as string[]) ?? [];
  const requiredPermission = getRequiredPermission(pathname);

  const isPlatformAdmin = Boolean(user.isPlatformAdmin);

  const isPlatformOnlyRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/operations") ||
    pathname.startsWith("/administration") ||
    pathname === "/developer" ||
    pathname.startsWith("/developer/");

  if (isPlatformOnlyRoute && !isPlatformAdmin) {
    redirect("/forbidden");
  }

  if (
    !isPlatformAdmin &&
    requiredPermission &&
    !permissions.includes(requiredPermission)
  ) {
    redirect("/forbidden");
  }

  const appUser = {
    ...user,
    permissions,
  };

  return (
    <AppLayout user={appUser}>
      {children}
    </AppLayout>
  );
}