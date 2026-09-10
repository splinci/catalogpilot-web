import { Role } from "@prisma/client";
import { UserSessionPayload } from "@/types/auth.dto";

export const PERMISSIONS = {
  // Catalog
  CATALOG_READ: "catalog:read",
  CATALOG_CREATE: "catalog:create",
  CATALOG_UPDATE: "catalog:update",
  CATALOG_DELETE: "catalog:delete",
  CATALOG_PUBLISH: "catalog:publish",

  // Categories & Brands & Attributes
  CATEGORIES_MANAGE: "categories:manage",
  BRANDS_MANAGE: "brands:manage",
  ATTRIBUTES_MANAGE: "attributes:manage",

  // Inventory & Warehouses
  INVENTORY_READ: "inventory:read",
  INVENTORY_MANAGE: "inventory:manage",
  WAREHOUSE_READ: "warehouse:read",
  WAREHOUSE_MANAGE: "warehouse:manage",

  // Purchasing & Sales
  PURCHASING_READ: "purchasing:read",
  PURCHASING_MANAGE: "purchasing:manage",
  ORDERS_READ: "orders:read",
  ORDERS_MANAGE: "orders:manage",

  // User & Governance Administration
  USERS_READ: "users:read",
  USERS_INVITE: "users:invite",
  USERS_UPDATE: "users:update",
  USERS_DELETE: "users:delete",
  ROLES_READ: "roles:read",
  ROLES_MANAGE: "roles:manage",
  COMPANY_READ: "company:read",
  COMPANY_MANAGE: "company:manage",
  AUDIT_LOGS_READ: "audit_logs:read",

  // AI & Workflows
  AI_READ: "ai:read",
  AI_GENERATE: "ai:generate",
  WORKFLOW_READ: "workflow:read",
  WORKFLOW_MANAGE: "workflow:manage",
  WORKFLOW_EXECUTE: "workflow:execute",

  // Analytics & Reporting
  ANALYTICS_READ: "analytics:read",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: Object.values(PERMISSIONS),
  PLATFORM_ADMIN: Object.values(PERMISSIONS),

  CATALOG_MANAGER: [
    PERMISSIONS.CATALOG_READ,
    PERMISSIONS.CATALOG_CREATE,
    PERMISSIONS.CATALOG_UPDATE,
    PERMISSIONS.CATALOG_DELETE,
    PERMISSIONS.CATALOG_PUBLISH,
    PERMISSIONS.CATEGORIES_MANAGE,
    PERMISSIONS.BRANDS_MANAGE,
    PERMISSIONS.ATTRIBUTES_MANAGE,
    PERMISSIONS.AI_READ,
    PERMISSIONS.AI_GENERATE,
    PERMISSIONS.ANALYTICS_READ,
  ],

  CATALOG_EDITOR: [
    PERMISSIONS.CATALOG_READ,
    PERMISSIONS.CATALOG_CREATE,
    PERMISSIONS.CATALOG_UPDATE,
    PERMISSIONS.CATEGORIES_MANAGE,
    PERMISSIONS.ATTRIBUTES_MANAGE,
    PERMISSIONS.AI_READ,
    PERMISSIONS.AI_GENERATE,
  ],

  CATALOG_REVIEWER: [
    PERMISSIONS.CATALOG_READ,
    PERMISSIONS.CATALOG_PUBLISH,
    PERMISSIONS.AI_READ,
  ],

  WAREHOUSE_MANAGER: [
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.INVENTORY_MANAGE,
    PERMISSIONS.WAREHOUSE_READ,
    PERMISSIONS.WAREHOUSE_MANAGE,
    PERMISSIONS.PURCHASING_READ,
  ],

  PURCHASING_OFFICER: [
    PERMISSIONS.PURCHASING_READ,
    PERMISSIONS.PURCHASING_MANAGE,
    PERMISSIONS.INVENTORY_READ,
  ],

  SALES_MANAGER: [
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.ORDERS_MANAGE,
    PERMISSIONS.CATALOG_READ,
    PERMISSIONS.ANALYTICS_READ,
  ],

  SALES_REPRESENTATIVE: [
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.ORDERS_MANAGE,
    PERMISSIONS.CATALOG_READ,
  ],

  FINANCE_AUDITOR: [
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.AUDIT_LOGS_READ,
    PERMISSIONS.COMPANY_READ,
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.PURCHASING_READ,
  ],

  FINANCE_CLERK: [
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.PURCHASING_READ,
  ],

  EXECUTIVE: [
    PERMISSIONS.CATALOG_READ,
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.PURCHASING_READ,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.COMPANY_READ,
  ],

  MERCHANT_USER: [
    PERMISSIONS.CATALOG_READ,
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.ORDERS_READ,
  ],
};

export function getRolePermissions(role: string): string[] {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.MERCHANT_USER || [];
}

export function hasPermission(
  userPermissions: string[],
  permission: string
): boolean {
  return userPermissions.includes(permission);
}

export function hasRolePermission(role: string, permission: string): boolean {
  if (role === "ADMIN" || role === "PLATFORM_ADMIN") return true;
  const perms = getRolePermissions(role);
  return perms.includes(permission);
}

export function requirePermission(
  session: UserSessionPayload | null,
  permission: string
): { authorized: boolean; error?: string } {
  if (!session) {
    return { authorized: false, error: "Unauthorized: Session missing or expired" };
  }

  const role = session.role as string;
  if (!hasRolePermission(role, permission)) {
    return {
      authorized: false,
      error: `Forbidden: Role '${role}' lacks required permission '${permission}'`,
    };
  }

  return { authorized: true };
}

export function hasAnyPermission(
  userPermissions: string[],
  permissions: string[]
): boolean {
  return permissions.some((permission) => userPermissions.includes(permission));
}

export function hasAllPermissions(
  userPermissions: string[],
  permissions: string[]
): boolean {
  return permissions.every((permission) => userPermissions.includes(permission));
}