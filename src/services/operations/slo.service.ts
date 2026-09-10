/**
 * ============================================================================
 * Splinci Commerce OS — Enterprise Observability & SLO Service
 * ============================================================================
 * Specification Reference: CI-002 / OBS-001 / SLO-001 / SAD-001
 * Domain: Production Observability, SLO Telemetry & Error Budget Management
 * ============================================================================
 */

import { SLOPolicy, SLOEvaluationResult } from "./slo.policy";
import { HealthService } from "./health.service";

export class SLOService {
  constructor(private readonly healthService: HealthService = new HealthService()) {}

  /**
   * Get overall SLO & Error Budget summary across the 10 enterprise metrics.
   */
  async getSLOSummary(): Promise<{
    evaluatedAt: string;
    overallStatus: string;
    slos: SLOEvaluationResult[];
  }> {
    const health = await this.healthService.getHealth();
    const dbLatencyObserved = health.database.latencyMs <= 250 ? 99.8 : 99.2;

    const mockObservedMetrics: Record<string, number> = {
      APP_AVAILABILITY: 100.0,
      API_AVAILABILITY: 99.95,
      API_LATENCY: 99.6,
      DB_LATENCY: dbLatencyObserved,
      AUTH_SUCCESS: 99.95,
      OUTBOX_RELIABILITY: 99.98,
      WORKER_AVAILABILITY: 100.0,
      WORKFLOW_RELIABILITY: 99.7,
      AI_JOB_RELIABILITY: 99.6,
      INCIDENT_RESOLUTION: 97.5,
    };

    const evaluatedSlos: SLOEvaluationResult[] = Object.keys(SLOPolicy.SLO_DEFINITIONS).map((id) => {
      const observed = mockObservedMetrics[id] ?? 99.9;
      return SLOPolicy.evaluateSLO(id, observed);
    });

    const isAnyBreached = evaluatedSlos.some((s) => s.status === "BREACHED");
    const isAnyWarning = evaluatedSlos.some((s) => s.status === "WARNING");

    let overallStatus = "HEALTHY";
    if (isAnyBreached) overallStatus = "BREACHED";
    else if (isAnyWarning) overallStatus = "WARNING";

    return {
      evaluatedAt: new Date().toISOString(),
      overallStatus,
      slos: evaluatedSlos,
    };
  }
}

export const sloService = new SLOService();
