"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "../config/navigation";
import { filterNavigation } from "@/features/auth/utils/permissions";

interface AppSidebarProps {
  user: {
    firstName: string;
    lastName: string;
    permissions?: string[];
  };
}

export function AppSidebar({
  user,
}: AppSidebarProps) {
  const pathname = usePathname();

  const filteredNavigation = filterNavigation(
    navigation,
    user.permissions ?? []
  );

  return (
    <aside className="w-64 border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">Atlas ERP</h1>
      </div>

      <nav className="space-y-6 p-4">
        {filteredNavigation.map((section) => (
          <div key={section.title}>
            <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </h2>

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}