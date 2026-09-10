/**
 * ============================================================================
 * Splinci Commerce OS — SLO & Error Budget Policy Engine
 * ============================================================================
 * Specification Reference: CI-002 / SLO-001 / OBS-001 / ENG-001
 * Domain: Pure Enterprise Service Level Objective (SLO) & Error Budget Rules
 * Note: Pure functions ONLY — 0 Prisma imports, 0 database queries.
 * ============================================================================
 */

export enum SLOStatusEnum {
  HEALTHY = "HEALTHY",
  WARNING = "WARNING",
  BREACHED = "BREACHED",
}

export interface SLOMetricDefinition {
  id: string;
  name: string;
  targetPercent: number; // e.g. 99.9
  warningThresholdPercent: number; // e.g. 99.5
  criticalThresholdPercent: number; // e.g. 99.0
  measurementWindow: string; // e.g. "30d"
}

export interface SLOEvaluationResult {
  sloId: string;
  name: string;
  targetPercent: number;
  observedPercent: number;
  errorBudgetTotalPercent: number; // (100 - targetPercent)
  errorBudgetRemainingPercent: number;
  status: SLOStatusEnum;
  isAlertTriggered: boolean;
  remediationAction?: string;
}

export class SLOPolicy {
  /** Core 10 Enterprise SLO Definitions */
  static readonly SLO_DEFINITIONS: Record<string, SLOMetricDefinition> = {
    APP_AVAILABILITY: {
      id: "APP_AVAILABILITY",
      name: "Application Availability",
      targetPercent: 99.9,
      warningThresholdPercent: 99.5,
      criticalThresholdPercent: 99.0,
      measurementWindow: "30d",
    },
    API_AVAILABILITY: {
      id: "API_AVAILABILITY",
      name: "REST API Availability",
      targetPercent: 99.9,
      warningThresholdPercent: 99.5,
      criticalThresholdPercent: 99.0,
      measurementWindow: "30d",
    },
    API_LATENCY: {
      id: "API_LATENCY",
      name: "API Latency (<200ms p95)",
      targetPercent: 99.0,
      warningThresholdPercent: 97.0,
      criticalThresholdPercent: 95.0,
      measurementWindow: "30d",
    },
    DB_LATENCY: {
      id: "DB_LATENCY",
      name: "Database Latency (<50ms p95)",
      targetPercent: 99.5,
      warningThresholdPercent: 98.0,
      criticalThresholdPercent: 95.0,
      measurementWindow: "30d",
    },
    AUTH_SUCCESS: {
      id: "AUTH_SUCCESS",
      name: "Authentication Success Rate",
      targetPercent: 99.9,
      warningThresholdPercent: 99.5,
      criticalThresholdPercent: 99.0,
      measurementWindow: "30d",
    },
    OUTBOX_RELIABILITY: {
      id: "OUTBOX_RELIABILITY",
      name: "Outbox Delivery Reliability",
      targetPercent: 99.95,
      warningThresholdPercent: 99.5,
      criticalThresholdPercent: 99.0,
      measurementWindow: "30d",
    },
    WORKER_AVAILABILITY: {
      id: "WORKER_AVAILABILITY",
      name: "Background Worker Uptime",
      targetPercent: 99.9,
      warningThresholdPercent: 99.5,
      criticalThresholdPercent: 99.0,
      measurementWindow: "30d",
    },
    WORKFLOW_RELIABILITY: {
      id: "WORKFLOW_RELIABILITY",
      name: "Workflow Execution Reliability",
      targetPercent: 99.5,
      warningThresholdPercent: 98.5,
      criticalThresholdPercent: 97.0,
      measurementWindow: "30d",
    },
    AI_JOB_RELIABILITY: {
      id: "AI_JOB_RELIABILITY",
      name: "AI Job Completion Reliability",
      targetPercent: 99.0,
      warningThresholdPercent: 97.0,
      criticalThresholdPercent: 95.0,
      measurementWindow: "30d",
    },
    INCIDENT_RESOLUTION: {
      id: "INCIDENT_RESOLUTION",
      name: "P1/P2 Incident SLA (<1h)",
      targetPercent: 95.0,
      warningThresholdPercent: 90.0,
      criticalThresholdPercent: 85.0,
      measurementWindow: "30d",
    },
  };

  /**
   * Evaluate SLO & Error Budget for a given metric.
   */
  static evaluateSLO(sloId: string, observedPercent: number): SLOEvaluationResult {
    const def = this.SLO_DEFINITIONS[sloId];
    if (!def) {
      throw new Error(`Unknown SLO metric identifier: ${sloId}`);
    }

    const totalErrorBudget = 100 - def.targetPercent;
    const observedFailureRate = 100 - observedPercent;

    let remainingPercent = 100;
    if (totalErrorBudget > 0) {
      remainingPercent = Math.max(0, ((totalErrorBudget - observedFailureRate) / totalErrorBudget) * 100);
    }

    let status = SLOStatusEnum.HEALTHY;
    let isAlertTriggered = false;
    let remediationAction: string | undefined;

    if (observedPercent < def.criticalThresholdPercent || remainingPercent <= 0) {
      status = SLOStatusEnum.BREACHED;
      isAlertTriggered = true;
      remediationAction = "FREEZE_NON_CRITICAL_DEPLOYS_TRIGGER_INCIDENT";
    } else if (observedPercent < def.warningThresholdPercent || remainingPercent <= 20) {
      status = SLOStatusEnum.WARNING;
      isAlertTriggered = true;
      remediationAction = "NOTIFY_OPERATIONS_PRIORITIZE_RELIABILITY";
    }

    return {
      sloId: def.id,
      name: def.name,
      targetPercent: def.targetPercent,
      observedPercent,
      errorBudgetTotalPercent: Number(totalErrorBudget.toFixed(2)),
      errorBudgetRemainingPercent: Number(remainingPercent.toFixed(2)),
      status,
      isAlertTriggered,
      remediationAction,
    };
  }
}
