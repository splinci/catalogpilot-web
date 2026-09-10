"use client";

import { useMemo } from "react";

import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from "../utils/permissions";

interface CurrentUser {
  permissions?: string[];
}

export function usePermissions(user?: CurrentUser) {
  const permissions = useMemo(
    () => user?.permissions ?? [],
    [user]
  );

  return {
    permissions,

    can: (permission: string) =>
      hasPermission(permissions, permission),

    canAny: (requiredPermissions: string[]) =>
      hasAnyPermission(permissions, requiredPermissions),

    canAll: (requiredPermissions: string[]) =>
      hasAllPermissions(permissions, requiredPermissions),
  };
}