import { AuditAction } from "@prisma/client";

export interface CreateAuditLogDto {
  userId?: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  ipAddress?: string;
}