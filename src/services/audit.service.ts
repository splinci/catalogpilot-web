import { prisma } from '../lib/prisma';
import { AuditAction } from '@prisma/client';
export { AuditAction } from '@prisma/client';

export class AuditService {
  async log(params: {
    companyId: string;
    userId?: string | null;
    action: AuditAction;
    entityName: string;
    entityId?: string | null;
    details?: any;
    ipAddress?: string | null;
  }): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          companyId: params.companyId,
          userId: params.userId ?? null,
          action: params.action,
          entityName: params.entityName,
          entityId: params.entityId ?? null,
          details: params.details ? JSON.parse(JSON.stringify(params.details)) : null,
          ipAddress: params.ipAddress ?? null,
        },
      });
    } catch (error) {
      console.error('⚠️ Audit Logging Failed:', error);
    }
  }
}

export const auditService = new AuditService();
