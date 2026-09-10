import { AuditAction } from "@prisma/client";
import { BaseRepository } from "../base/base.repository";
import { CreateAuditLogDto } from "@/types/auth";

export class AuditRepository extends BaseRepository {
  async log(data: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        companyId: "cmp_atlas_01",
        action: (data.action as any) || AuditAction.USER_UPDATED,
        entityName: data.entity || "Entity",
        entityId: data.entityId || null,
        ipAddress: data.ipAddress || null,
        userId: data.userId || null,
      },
    });
  }

  async findByUser(userId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });
  }

  async findRecent(limit = 100) {
    return this.prisma.auditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });
  }

  async findByEntity(entity: string, entityId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: {
        entityName: entity,
        entityId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });
  }
}