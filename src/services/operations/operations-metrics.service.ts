/**
 * ============================================================================
 * Splinci Commerce OS — Operations Metrics Service
 * ============================================================================
 * Specification Reference: M12-002 / OPS-001 / OBS-001 / SAD-001
 * Domain: Tenant Operational Metrics & KPI Aggregation Service
 * Note: Delegates persistence to OperationsMetricsRepository, enforces companyId isolation.
 * ============================================================================
 */

import { OperationsMetricsRepository, operationsMetricsRepository } from "../../repositories/operations-metrics.repository";
import { OperationsMetricsSummaryDto } from "../../types/operations.dto";

export class OperationsMetricsService {
  constructor(private readonly metricsRepo: OperationsMetricsRepository = operationsMetricsRepository) {}

  /**
   * Get full operational metrics summary for tenant.
   */
  async getMetricsSummary(companyId: string, startDate?: Date, endDate?: Date): Promise<OperationsMetricsSummaryDto> {
    if (!companyId) {
      throw new Error("companyId is required for tenant metrics summary");
    }
    return this.metricsRepo.getMetricsSummary(companyId, startDate, endDate);
  }

  /**
   * Get high-level operational KPIs for tenant dashboard.
   */
  async getOperationalKPIs(companyId: string) {
    const summary = await this.getMetricsSummary(companyId);

    const queueSuccessRate = summary.outbox.totalMessages > 0
      ? Math.round((summary.outbox.processedCount / summary.outbox.totalMessages) * 100)
      : 100;

    const aiJobSuccessRate = summary.aiJobs.totalJobs > 0
      ? Math.round((summary.aiJobs.completedCount / summary.aiJobs.totalJobs) * 100)
      : 100;

    return {
      companyId,
      queueSuccessRate,
      aiJobSuccessRate,
      pendingOutboxCount: summary.outbox.pendingCount,
      failedOutboxCount: summary.outbox.failedCount,
      activeSessionsCount: summary.securityAudit.activeUserSessions,
      unreadAlertsCount: summary.alerts.unreadCount,
    };
  }

  /**
   * Get outbox queue metrics.
   */
  async getQueueMetrics(companyId: string) {
    const summary = await this.getMetricsSummary(companyId);
    return summary.outbox;
  }

  /**
   * Get AI background job processing metrics.
   */
  async getBackgroundJobMetrics(companyId: string) {
    const summary = await this.getMetricsSummary(companyId);
    return summary.aiJobs;
  }

  /**
   * Get workflow execution operational metrics.
   */
  async getWorkflowOperationalMetrics(companyId: string) {
    const summary = await this.getMetricsSummary(companyId);
    return summary.workflows;
  }

  /**
   * Get security audit log metrics.
   */
  async getSecurityEventMetrics(companyId: string) {
    const summary = await this.getMetricsSummary(companyId);
    return summary.securityAudit;
  }

  /**
   * Get unread notifications alert metrics.
   */
  async getNotificationMetrics(companyId: string) {
    const summary = await this.getMetricsSummary(companyId);
    return summary.alerts;
  }
}

export const operationsMetricsService = new OperationsMetricsService();
