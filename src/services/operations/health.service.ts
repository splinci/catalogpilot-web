/**
 * ============================================================================
 * Splinci Commerce OS — Health Service
 * ============================================================================
 * Specification Reference: M12-002 / OPS-001 / OBS-001 / SAD-001
 * Domain: Platform Health & Diagnostic Telemetry Service
 * Note: Delegates persistence to HealthRepository, applies HealthPolicy.
 * ============================================================================
 */

import { HealthRepository, healthRepository } from "../../repositories/health.repository";
import { HealthPolicy, OperationsReadinessPolicy, OperationalReadinessResult } from "./operations.policy";
import { SystemHealthTelemetryDto } from "../../types/operations.dto";
import { operationsMetricsRepository, OperationsMetricsRepository } from "../../repositories/operations-metrics.repository";
import { incidentRepository, IncidentRepository } from "../../repositories/incident.repository";

export class HealthService {
  constructor(
    private readonly healthRepo: HealthRepository = healthRepository,
    private readonly metricsRepo: OperationsMetricsRepository = operationsMetricsRepository,
    private readonly incidentRepo: IncidentRepository = incidentRepository
  ) {}

  /**
   * Get basic health status (Platform Scope).
   */
  async getHealth() {
    const ping = await this.healthRepo.pingDatabase();
    const status = HealthPolicy.evaluateHealthStatus(ping.isConnected, ping.latencyMs);

    return {
      status,
      timestamp: new Date().toISOString(),
      database: {
        connected: ping.isConnected,
        latencyMs: ping.latencyMs,
        error: ping.error,
      },
    };
  }

  /**
   * Get history of platform health checks (Platform Scope).
   */
  async getHealthHistory(limit = 20) {
    return this.healthRepo.getRecentHealthChecks(limit);
  }

  /**
   * Get full system telemetry (Platform Scope).
   */
  async getSystemTelemetry(): Promise<SystemHealthTelemetryDto> {
    return this.healthRepo.getSystemTelemetry();
  }

  /**
   * Record a new health check entry (Platform Scope).
   */
  async performHealthCheck() {
    const ping = await this.healthRepo.pingDatabase();
    const status = HealthPolicy.evaluateHealthStatus(ping.isConnected, ping.latencyMs);
    return this.healthRepo.recordHealthCheck(status);
  }

  /**
   * Evaluate overall operational production readiness for a tenant context.
   */
  async evaluateReadiness(companyId: string): Promise<OperationalReadinessResult> {
    if (!companyId) {
      throw new Error("companyId is required for tenant readiness evaluation");
    }

    const [telemetry, metrics, incidentData] = await Promise.all([
      this.healthRepo.getSystemTelemetry(),
      this.metricsRepo.getMetricsSummary(companyId),
      this.incidentRepo.findIncidents({ companyId, page: 1, limit: 100 }),
    ]);

    const criticalIncidents = incidentData.incidents.filter(
      (inc) => inc.severity === "CRITICAL"
    ).length;

    return OperationsReadinessPolicy.evaluateReadiness({
      telemetry,
      metrics,
      criticalIncidentCount: criticalIncidents,
    });
  }
}

export const healthService = new HealthService();
