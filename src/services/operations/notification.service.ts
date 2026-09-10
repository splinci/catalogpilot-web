/**
 * ============================================================================
 * Splinci Commerce OS — Notification Service
 * ============================================================================
 * Specification Reference: M12-002 / OPS-001 / SEC-001 / DAT-001
 * Domain: Operational System Alerts & User Notifications Service
 * Note: Applies NotificationPolicy, delegates persistence to OperationsRepository.
 * ============================================================================
 */

import { OperationsRepository, operationsRepository } from "../../repositories/operations.repository";
import { NotificationPolicy } from "./operations.policy";
import { CreateNotificationDto, NotificationQueryDto } from "../../types/operations.dto";

export class NotificationService {
  constructor(private readonly opsRepo: OperationsRepository = operationsRepository) {}

  /**
   * Create operational notification for user.
   */
  async createNotification(dto: CreateNotificationDto) {
    if (!dto.companyId || !dto.userId) {
      throw new Error("companyId and userId are required to create notification");
    }

    const check = NotificationPolicy.validatePayload(dto.title, dto.message);
    if (!check.valid) {
      throw new Error(`Invalid notification payload: ${check.error}`);
    }

    return this.opsRepo.createNotification(dto);
  }

  /**
   * List notifications for user in tenant context.
   */
  async listNotifications(query: NotificationQueryDto) {
    if (!query.companyId || !query.userId) {
      throw new Error("companyId and userId are required to list notifications");
    }
    return this.opsRepo.findNotifications(query);
  }

  /**
   * Mark notification as read.
   */
  async markAsRead(companyId: string, notificationId: string, userId: string) {
    if (!companyId || !notificationId || !userId) {
      throw new Error("companyId, notificationId, and userId are required");
    }
    return this.opsRepo.markNotificationRead(companyId, notificationId, userId);
  }

  /**
   * Mark all notifications as read for user.
   */
  async markAllAsRead(companyId: string, userId: string) {
    if (!companyId || !userId) {
      throw new Error("companyId and userId are required");
    }
    return this.opsRepo.markAllNotificationsRead(companyId, userId);
  }

  /**
   * Get unread notification count for user.
   */
  async getUnreadCount(companyId: string, userId: string): Promise<number> {
    if (!companyId || !userId) {
      throw new Error("companyId and userId are required");
    }
    const unread = await this.opsRepo.findNotifications({
      companyId,
      userId,
      isRead: false,
      limit: 100,
    });
    return unread.length;
  }
}

export const notificationService = new NotificationService();
