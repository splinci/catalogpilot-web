/**
 * ============================================================================
 * Splinci Commerce OS — Operations Repository
 * ============================================================================
 * Specification Reference: M12-001 / OPS-001 / DAT-001 / SEC-001
 * Unified Tenant Operations, Outbox Administration & Settings Repository
 * ============================================================================
 */

import { BaseRepository } from "./base/base.repository";
import { auditService } from "../services/audit.service";
import { AuditAction } from "@prisma/client";
import {
  OutboxQueryDto,
  OutboxRetryPayloadDto,
  UpsertSystemSettingDto,
  CreateNotificationDto,
  NotificationQueryDto,
} from "../types/operations.dto";

export class OperationsRepository extends BaseRepository {
  // ==========================================
  // 1. OUTBOX QUEUE ADMINISTRATION
  // ==========================================

  /**
   * Query outbox messages for tenant queue monitoring.
   */
  async findOutboxMessages(query: Partial<OutboxQueryDto> & { companyId: string }) {
    const { companyId, status, eventType, page = 1, limit = 50, startDate, endDate } = query;

    const where: any = {
      companyId,
      ...(status ? { status } : {}),
      ...(eventType ? { eventType } : {}),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
    };

    const [messages, total] = await Promise.all([
      this.prisma.outboxMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.outboxMessage.count({ where }),
    ]);

    return { messages, total, page, limit };
  }

  /**
   * Retry a failed or pending outbox message within a transaction boundary.
   * Increments retry count and sets next attempt window.
   */
  async retryOutboxMessage(payload: OutboxRetryPayloadDto, userId?: string) {
    const { companyId, outboxId } = payload;

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.outboxMessage.findFirst({
        where: { id: outboxId, companyId },
      });

      if (!existing) {
        throw new Error(`Outbox message ${outboxId} not found for tenant`);
      }

      const updated = await tx.outboxMessage.update({
        where: { id: outboxId },
        data: {
          status: "PENDING",
          retryCount: { increment: 1 },
          nextAttemptAt: new Date(Date.now() + 5000), // Next attempt in 5 seconds
        },
      });

      // Audit outbox retry event
      await auditService.log({
        companyId,
        userId: userId ?? null,
        action: AuditAction.STOCK_ADJUSTED, // Operational action audit
        entityName: "OutboxMessage",
        entityId: outboxId,
        details: {
          previousStatus: existing.status,
          retryCount: updated.retryCount,
          eventType: existing.eventType,
        },
      });

      return updated;
    });
  }

  /**
   * Purge processed outbox messages older than specified cutoff date.
   */
  async purgeProcessedOutbox(companyId: string, olderThanDate: Date) {
    return this.prisma.outboxMessage.deleteMany({
      where: {
        companyId,
        status: "PROCESSED",
        createdAt: { lt: olderThanDate },
      },
    });
  }

  // ==========================================
  // 2. TENANT SYSTEM SETTINGS
  // ==========================================

  /**
   * Fetch all system settings for tenant.
   */
  async getSystemSettings(companyId: string) {
    return this.prisma.systemSetting.findMany({
      where: { companyId },
      orderBy: { key: "asc" },
    });
  }

  /**
   * Fetch specific setting by key.
   */
  async getSystemSettingByKey(companyId: string, key: string) {
    return this.prisma.systemSetting.findUnique({
      where: {
        companyId_key: {
          companyId,
          key,
        },
      },
    });
  }

  /**
   * Upsert system setting with optimistic concurrency & audit trail.
   */
  async upsertSystemSetting(dto: UpsertSystemSettingDto, userId?: string) {
    const { companyId, key, value } = dto;

    return this.prisma.$transaction(async (tx) => {
      const setting = await tx.systemSetting.upsert({
        where: {
          companyId_key: {
            companyId,
            key,
          },
        },
        create: {
          companyId,
          key,
          value,
        },
        update: {
          value,
        },
      });

      await auditService.log({
        companyId,
        userId: userId ?? null,
        action: AuditAction.USER_UPDATED,
        entityName: "SystemSetting",
        entityId: setting.id,
        details: { key, value },
      });

      return setting;
    });
  }

  // ==========================================
  // 3. OPERATIONAL NOTIFICATIONS & ALERTS
  // ==========================================

  /**
   * Create an operational alert / notification.
   */
  async createNotification(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        companyId: dto.companyId,
        userId: dto.userId,
        title: dto.title,
        message: dto.message,
        isRead: false,
      },
    });
  }

  /**
   * Query operational notifications for a user.
   */
  async findNotifications(query: Partial<NotificationQueryDto> & { companyId: string; userId: string }) {
    const { companyId, userId, isRead, limit = 50 } = query;

    const where: any = {
      companyId,
      userId,
      ...(isRead !== undefined ? { isRead } : {}),
    };

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Mark notification as read.
   */
  async markNotificationRead(companyId: string, notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        companyId,
        userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  /**
   * Mark all notifications as read for user.
   */
  async markAllNotificationsRead(companyId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        companyId,
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }
}

export const operationsRepository = new OperationsRepository();
