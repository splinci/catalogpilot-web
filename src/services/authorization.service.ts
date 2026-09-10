import { Role, AuditAction } from '@prisma/client';
import { UserSessionPayload } from '@/types/auth.dto';
import { auditService } from './audit.service';

export type Permission =
  | 'products:read'
  | 'products:write'
  | 'products:delete'
  | 'products:publish'
  | 'inventory:read'
  | 'inventory:write'
  | 'inventory:adjust'
  | 'warehouses:read'
  | 'warehouses:write'
  | 'purchasing:read'
  | 'purchasing:write'
  | 'purchasing:approve'
  | 'orders:read'
  | 'orders:write'
  | 'orders:approve'
  | 'customers:read'
  | 'customers:write'
  | 'finance:read'
  | 'finance:write'
  | 'finance:post'
  | 'reports:read'
  | 'reports:write'
  | 'reports:schedule'
  | 'reports:execute'
  | 'workflow:read'
  | 'workflow:write'
  | 'workflow:approve'
  | 'workflow:execute'
  | 'workflow:manage'
  | 'workflows:manage'
  | 'users:manage'
  | 'system:admin'
  | 'ai:read'
  | 'ai:write'
  | 'ai:approve'
  | 'operations:read'
  | 'operations:write'
  | 'operations:manage'
  | 'operations:retry'
  | 'operations:settings'
  | 'operations:notifications';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    'products:read', 'products:write', 'products:delete', 'products:publish',
    'inventory:read', 'inventory:write', 'inventory:adjust',
    'warehouses:read', 'warehouses:write',
    'purchasing:read', 'purchasing:write', 'purchasing:approve',
    'orders:read', 'orders:write', 'orders:approve',
    'customers:read', 'customers:write',
    'finance:read', 'finance:write', 'finance:post',
    'reports:read', 'reports:write', 'reports:schedule', 'reports:execute',
    'workflow:read', 'workflow:write', 'workflow:approve', 'workflow:execute', 'workflow:manage',
    'workflows:manage', 'users:manage', 'system:admin',
    'ai:read', 'ai:write', 'ai:approve',
    'operations:read', 'operations:write', 'operations:manage', 'operations:retry', 'operations:settings', 'operations:notifications',
  ],
  EXECUTIVE: [
    'products:read', 'inventory:read', 'warehouses:read', 'purchasing:read',
    'orders:read', 'customers:read', 'finance:read', 'reports:read',
    'workflow:read', 'workflow:approve',
    'ai:read', 'operations:read', 'operations:notifications',
  ],
  CATALOG_EDITOR: [
    'products:read', 'products:write', 'inventory:read',
    'workflow:read', 'workflow:write',
    'ai:read', 'ai:write',
  ],
  CATALOG_REVIEWER: [
    'products:read', 'products:write', 'products:publish', 'inventory:read',
    'workflow:read', 'workflow:write', 'workflow:approve', 'workflow:execute',
    'ai:read', 'ai:write', 'ai:approve',
  ],
  WAREHOUSE_MANAGER: [
    'products:read', 'inventory:read', 'inventory:write', 'inventory:adjust',
    'warehouses:read', 'warehouses:write', 'orders:read', 'purchasing:read',
    'workflow:read', 'workflow:execute',
    'ai:read',
  ],
  PURCHASING_OFFICER: [
    'products:read', 'purchasing:read', 'purchasing:write', 'purchasing:approve',
    'inventory:read', 'workflow:read', 'workflow:write', 'workflow:approve', 'workflow:execute',
    'ai:read',
  ],
  SALES_REPRESENTATIVE: [
    'products:read', 'orders:read', 'orders:write', 'customers:read', 'customers:write',
    'workflow:read',
    'ai:read',
  ],
  SALES_MANAGER: [
    'products:read', 'orders:read', 'orders:write', 'orders:approve',
    'customers:read', 'customers:write', 'reports:read', 'reports:write', 'reports:schedule',
    'workflow:read', 'workflow:write', 'workflow:approve', 'workflow:execute',
    'ai:read',
  ],
  FINANCE_CLERK: [
    'orders:read', 'customers:read', 'finance:read', 'finance:write',
    'workflow:read',
  ],
  FINANCE_AUDITOR: [
    'orders:read', 'customers:read', 'finance:read', 'finance:write', 'finance:post',
    'reports:read', 'reports:write', 'reports:schedule', 'reports:execute',
    'workflow:read', 'workflow:write', 'workflow:approve', 'workflow:execute',
    'ai:read',
  ],
};

export class AuthorizationService {
  hasPermission(role: Role, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }

  hasRole(userRole: Role, allowedRoles: Role[]): boolean {
    return allowedRoles.includes(userRole);
  }

  async checkPermission(
    session: UserSessionPayload | null,
    permission: Permission,
    ipAddress?: string
  ): Promise<boolean> {
    if (!session) return false;
    const isAllowed = this.hasPermission(session.role, permission);

    if (!isAllowed) {
      await auditService.log({
        companyId: session.companyId,
        userId: session.userId,
        action: AuditAction.ROLE_ASSIGNED,
        entityName: 'Permission',
        details: { requiredPermission: permission, userRole: session.role, accessDenied: true },
        ipAddress,
      });
    }

    return isAllowed;
  }

  isPlatformAdmin(session: UserSessionPayload | null): boolean {
    if (!session) return false;
    return (
      session.email === "info@splinci.com" ||
      session.companyCode === "SPLINCI" ||
      session.companyId === "cmp_splinci_01" ||
      (session.role === Role.ADMIN && session.companyCode === "SPLINCI")
    );
  }
}

export const authorizationService = new AuthorizationService();
