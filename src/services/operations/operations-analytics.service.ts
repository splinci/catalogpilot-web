/**
 * ============================================================================
 * Splinci Commerce OS — Operations Analytics & Readiness Service
 * ============================================================================
 * Specification Reference: M12-002 / OPS-001 / OBS-001 / SAD-001
 * Domain: Unified Operations Dashboard, Production Readiness & System Health Aggregator
 * Note: Aggregates strictly through existing domain services & repositories.
 * ============================================================================
 */

import { HealthService, healthService } from "./health.service";
import { IncidentService, incidentService } from "./incident.service";
import { OperationsMetricsService, operationsMetricsService } from "./operations-metrics.service";
import { OutboxOperationsService, outboxOperationsService } from "./outbox.service";

export class OperationsAnalyticsService {
  constructor(
    private readonly healthSvc: HealthService = healthService,
    private readonly incidentSvc: IncidentService = incidentService,
    private readonly metricsSvc: OperationsMetricsService = operationsMetricsService,
    private readonly outboxSvc: OutboxOperationsService = outboxOperationsService
  ) {}

  /**
   * Get overall system health summary (Platform Scope).
   */
  async getSystemHealthSummary() {
    return this.healthSvc.getSystemTelemetry();
  }

  /**
   * Get readiness score evaluation for tenant (Tenant Scope).
   */
  async getReadinessScore(companyId: string) {
    if (!companyId) {
      throw new Error("companyId is required for readiness evaluation");
    }
    return this.healthSvc.evaluateReadiness(companyId);
  }

  /**
   * Get unified operational command center dashboard payload.
   */
  async getOperationalDashboard(companyId: string) {
    if (!companyId) {
      throw new Error("companyId is required for operational dashboard");
    }

    const [telemetry, readiness, metrics, incidentSummary, queueHealth] = await Promise.all([
      this.healthSvc.getSystemTelemetry(),
      this.healthSvc.evaluateReadiness(companyId),
      this.metricsSvc.getMetricsSummary(companyId),
      this.incidentSvc.getIncidentSummary(companyId),
      this.outboxSvc.getQueueHealth(companyId),
    ]);

    return {
      companyId,
      timestamp: new Date().toISOString(),
      readiness,
      telemetry: {
        status: telemetry.status,
        version: telemetry.version,
        databaseLatencyMs: telemetry.database.latencyMs,
        uptimeSeconds: telemetry.uptimeSeconds,
        memoryHeapUsedMB: telemetry.system.memoryHeapUsedMB,
      },
      metrics,
      incidentSummary,
      queueHealth,
    };
  }

  /**
   * Get operational trend summary.
   */
  async getOperationalTrendSummary(companyId: string) {
    if (!companyId) {
      throw new Error("companyId is required for operational trend summary");
    }

    const kpis = await this.metricsSvc.getOperationalKPIs(companyId);
    const incidentSummary = await this.incidentSvc.getIncidentSummary(companyId);

    return {
      companyId,
      kpis,
      actionRequiredIncidents: incidentSummary.actionRequiredCount,
      timestamp: new Date().toISOString(),
    };
  }
}

export const operationsAnalyticsService = new OperationsAnalyticsService();
