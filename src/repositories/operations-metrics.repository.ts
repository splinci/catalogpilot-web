/**
 * ============================================================================
 * Splinci Commerce OS — Operations Metrics Repository
 * ============================================================================
 * Specification Reference: M12-001 / OPS-001 / OBS-001 / DAT-001
 * Tenant-Scoped Operational Performance Metrics Repository
 * ============================================================================
 */

import { BaseRepository } from "./base/base.repository";
import { OperationsMetricsSummaryDto } from "../types/operations.dto";

export class OperationsMetricsRepository extends BaseRepository {
  /**
   * Aggregate comprehensive tenant operational metrics.
   * Enforces strict tenant boundary via companyId.
   */
  async getMetricsSummary(companyId: string, startDate?: Date, endDate?: Date): Promise<OperationsMetricsSummaryDto> {
    const dateFilter = startDate || endDate ? {
      createdAt: {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      },
    } : {};

    // 1. Outbox Metrics
    const [outboxTotal, outboxPending, outboxProcessed, outboxFailed, outboxRetryAvg] = await Promise.all([
      this.prisma.outboxMessage.count({ where: { companyId, ...dateFilter } }),
      this.prisma.outboxMessage.count({ where: { companyId, status: "PENDING", ...dateFilter } }),
      this.prisma.outboxMessage.count({ where: { companyId, status: "PROCESSED", ...dateFilter } }),
      this.prisma.outboxMessage.count({ where: { companyId, status: "FAILED", ...dateFilter } }),
      this.prisma.outboxMessage.aggregate({
        where: { companyId, ...dateFilter },
        _avg: { retryCount: true },
      }),
    ]);

    // 2. AI Job Ingestion Metrics
    const [aiTotal, aiCompleted, aiProcessing, aiFailed] = await Promise.all([
      this.prisma.aIJob.count({ where: { companyId, ...dateFilter } }),
      this.prisma.aIJob.count({ where: { companyId, status: "COMPLETED", ...dateFilter } }),
      this.prisma.aIJob.count({ where: { companyId, status: "PROCESSING", ...dateFilter } }),
      this.prisma.aIJob.count({ where: { companyId, status: "FAILED", ...dateFilter } }),
    ]);

    // 3. Workflow Execution Metrics
    const [wfTotal, wfPending, wfApproved, wfRejected, wfExpired] = await Promise.all([
      this.prisma.workflowExecution.count({
        where: {
          definition: { companyId },
          ...(startDate || endDate ? { createdAt: dateFilter.createdAt } : {}),
        },
      }),
      this.prisma.workflowExecution.count({
        where: {
          definition: { companyId },
          status: "PENDING",
          ...(startDate || endDate ? { createdAt: dateFilter.createdAt } : {}),
        },
      }),
      this.prisma.workflowExecution.count({
        where: {
          definition: { companyId },
          status: "APPROVED",
          ...(startDate || endDate ? { createdAt: dateFilter.createdAt } : {}),
        },
      }),
      this.prisma.workflowExecution.count({
        where: {
          definition: { companyId },
          status: "REJECTED",
          ...(startDate || endDate ? { createdAt: dateFilter.createdAt } : {}),
        },
      }),
      this.prisma.workflowExecution.count({
        where: {
          definition: { companyId },
          status: "EXPIRED",
          ...(startDate || endDate ? { createdAt: dateFilter.createdAt } : {}),
        },
      }),
    ]);

    // 4. Security Audit Metrics
    const [auditTotal, auditFailedLogins, activeSessions] = await Promise.all([
      this.prisma.auditLog.count({ where: { companyId, ...dateFilter } }),
      this.prisma.auditLog.count({
        where: {
          companyId,
          action: "LOGIN_FAILED",
          ...dateFilter,
        },
      }),
      this.prisma.session.count({
        where: {
          user: { companyId },
          expiresAt: { gt: new Date() },
        },
      }),
    ]);

    // 5. System Notifications / Alerts
    const [alertsUnread, alertsTotal] = await Promise.all([
      this.prisma.notification.count({ where: { companyId, isRead: false } }),
      this.prisma.notification.count({ where: { companyId } }),
    ]);

    return {
      companyId,
      outbox: {
        totalMessages: outboxTotal,
        pendingCount: outboxPending,
        processedCount: outboxProcessed,
        failedCount: outboxFailed,
        avgRetryCount: Math.round((outboxRetryAvg._avg.retryCount ?? 0) * 100) / 100,
      },
      aiJobs: {
        totalJobs: aiTotal,
        completedCount: aiCompleted,
        processingCount: aiProcessing,
        failedCount: aiFailed,
      },
      workflows: {
        totalExecutions: wfTotal,
        pendingCount: wfPending,
        approvedCount: wfApproved,
        rejectedCount: wfRejected,
        expiredCount: wfExpired,
      },
      securityAudit: {
        totalLogs: auditTotal,
        failedLogins: auditFailedLogins,
        activeUserSessions: activeSessions,
      },
      alerts: {
        unreadCount: alertsUnread,
        totalCount: alertsTotal,
      },
    };
  }
}

export const operationsMetricsRepository = new OperationsMetricsRepository();
