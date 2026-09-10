/**
 * ============================================================================
 * Splinci Commerce OS — Operations Policy Engine
 * ============================================================================
 * Specification Reference: M12-002 / OPS-001 / SAD-001 / ENG-001
 * Domain: Pure Operational Business Policies, Rules & Readiness Evaluation
 * Note: Pure functions ONLY — 0 Prisma imports, 0 database queries.
 * ============================================================================
 */

import {
  SystemHealthStatusEnum,
  IncidentSeverityEnum,
  IncidentSourceEnum,
  OutboxStatusEnum,
  IncidentItemDto,
  SystemHealthTelemetryDto,
  OperationsMetricsSummaryDto,
} from "../../types/operations.dto";

// ==========================================
// 1. HEALTH POLICY
// ==========================================

export class HealthPolicy {
  /** Acceptable database latency thresholds in milliseconds */
  static readonly LATENCY_HEALTHY_MAX_MS = 100;
  static readonly LATENCY_DEGRADED_MAX_MS = 300;

  /**
   * Evaluate health status based on database latency and connectivity.
   */
  static evaluateHealthStatus(isConnected: boolean, latencyMs: number): SystemHealthStatusEnum {
    if (!isConnected) {
      return SystemHealthStatusEnum.UNHEALTHY;
    }
    if (latencyMs <= this.LATENCY_HEALTHY_MAX_MS) {
      return SystemHealthStatusEnum.HEALTHY;
    }
    if (latencyMs <= this.LATENCY_DEGRADED_MAX_MS) {
      return SystemHealthStatusEnum.DEGRADED;
    }
    return SystemHealthStatusEnum.UNHEALTHY;
  }

  /**
   * Determine if telemetry data indicates healthy system state.
   */
  static isTelemetryHealthy(telemetry: SystemHealthTelemetryDto): boolean {
    return (
      telemetry.status === SystemHealthStatusEnum.HEALTHY &&
      telemetry.database.latencyMs <= this.LATENCY_DEGRADED_MAX_MS
    );
  }
}

// ==========================================
// 2. INCIDENT POLICY
// ==========================================

export class IncidentPolicy {
  /** Incident freshness window (24 hours) */
  static readonly FRESHNESS_WINDOW_MS = 24 * 3600 * 1000;

  /**
   * Determine if an incident requires immediate action.
   */
  static requiresImmediateAttention(incident: IncidentItemDto): boolean {
    return (
      incident.severity === IncidentSeverityEnum.CRITICAL ||
      (incident.severity === IncidentSeverityEnum.HIGH &&
        Date.now() - new Date(incident.occurredAt).getTime() < this.FRESHNESS_WINDOW_MS)
    );
  }

  /**
   * Classify incident severity based on error details and retry count.
   */
  static classifySeverity(source: IncidentSourceEnum, errorContext: { retryCount?: number; status?: string; isSecurityFailure?: boolean }): IncidentSeverityEnum {
    if (errorContext.isSecurityFailure) {
      return IncidentSeverityEnum.HIGH;
    }
    if (source === IncidentSourceEnum.OUTBOX) {
      if (errorContext.status === "FAILED" || (errorContext.retryCount ?? 0) >= 5) {
        return IncidentSeverityEnum.CRITICAL;
      }
      if ((errorContext.retryCount ?? 0) >= 3) {
        return IncidentSeverityEnum.HIGH;
      }
      return IncidentSeverityEnum.MEDIUM;
    }
    if (source === IncidentSourceEnum.AI_JOB && errorContext.status === "FAILED") {
      return IncidentSeverityEnum.HIGH;
    }
    if (source === IncidentSourceEnum.WORKFLOW && errorContext.status === "EXPIRED") {
      return IncidentSeverityEnum.MEDIUM;
    }
    return IncidentSeverityEnum.LOW;
  }
}

// ==========================================
// 3. OUTBOX POLICY
// ==========================================

export class OutboxPolicy {
  static readonly MAX_RETRY_LIMIT = 5;
  static readonly MIN_PURGE_AGE_DAYS = 7;

  /**
   * Check if an outbox message is eligible for retry.
   */
  static canRetry(message: { status: string; retryCount: number }): { eligible: boolean; reason?: string } {
    if (message.status === OutboxStatusEnum.PROCESSED) {
      return { eligible: false, reason: "Message has already been processed successfully" };
    }
    if (message.status === OutboxStatusEnum.CANCELLED) {
      return { eligible: false, reason: "Message processing was explicitly cancelled" };
    }
    if (message.retryCount >= this.MAX_RETRY_LIMIT) {
      return { eligible: false, reason: `Maximum retry limit of ${this.MAX_RETRY_LIMIT} reached` };
    }
    return { eligible: true };
  }

  /**
   * Calculate next retry delay in milliseconds (exponential backoff).
   */
  static calculateRetryDelayMs(retryCount: number): number {
    const baseDelayMs = 5000; // 5 seconds
    return Math.min(300000, baseDelayMs * Math.pow(2, Math.max(0, retryCount - 1)));
  }

  /**
   * Check if message purge is allowed.
   */
  static isEligibleForPurge(messageDate: Date, cutoffDate: Date): boolean {
    return messageDate.getTime() < cutoffDate.getTime();
  }
}

// ==========================================
// 4. SYSTEM SETTING POLICY
// ==========================================

export class SystemSettingPolicy {
  /** Protected settings keys that cannot be arbitrarily modified or deleted */
  static readonly PROTECTED_KEYS = [
    "SYSTEM_MAINTENANCE_MODE",
    "SYSTEM_SECURITY_LOCKDOWN",
    "SYSTEM_TENANT_ISOLATION_STRICT",
  ];

  /** Key format regex: Uppercase letters, numbers, underscores (3-100 chars) */
  static readonly KEY_REGEX = /^[A-Z0-9_]{3,100}$/;

  /**
   * Validate system setting key format.
   */
  static isValidKey(key: string): boolean {
    return this.KEY_REGEX.test(key);
  }

  /**
   * Check if setting key is protected.
   */
  static isProtectedKey(key: string): boolean {
    return this.PROTECTED_KEYS.includes(key.toUpperCase());
  }

  /**
   * Validate setting value payload.
   */
  static isValidValue(value: string): boolean {
    return typeof value === "string" && value.trim().length > 0 && value.length <= 10000;
  }
}

// ==========================================
// 5. NOTIFICATION POLICY
// ==========================================

export class NotificationPolicy {
  /**
   * Validate notification title and message.
   */
  static validatePayload(title: string, message: string): { valid: boolean; error?: string } {
    if (!title || title.trim().length === 0 || title.length > 255) {
      return { valid: false, error: "Title must be non-empty and up to 255 characters" };
    }
    if (!message || message.trim().length === 0) {
      return { valid: false, error: "Notification message body cannot be empty" };
    }
    return { valid: true };
  }
}

// ==========================================
// 6. COMPOSITE READINESS EVALUATION POLICY
// ==========================================

export interface OperationalReadinessResult {
  score: number; // 0 to 100
  status: "READY" | "DEGRADED" | "NOT_READY";
  evaluatedAt: string;
  blockers: string[];
  warnings: string[];
  passedChecks: string[];
}

export class OperationsReadinessPolicy {
  /**
   * Evaluate production operational readiness signal composite.
   */
  static evaluateReadiness(params: {
    telemetry: SystemHealthTelemetryDto;
    metrics: OperationsMetricsSummaryDto;
    criticalIncidentCount: number;
  }): OperationalReadinessResult {
    const { telemetry, metrics, criticalIncidentCount } = params;
    const blockers: string[] = [];
    const warnings: string[] = [];
    const passedChecks: string[] = [];
    let score = 100;

    // 1. Database Health Check
    if (telemetry.status === SystemHealthStatusEnum.UNHEALTHY) {
      blockers.push("Database connectivity failure or extreme latency");
      score -= 50;
    } else if (telemetry.status === SystemHealthStatusEnum.DEGRADED) {
      warnings.push(`Database latency elevated (${telemetry.database.latencyMs}ms)`);
      score -= 15;
    } else {
      passedChecks.push("Database latency & connectivity within healthy limits");
    }

    // 2. Critical Incidents Check
    if (criticalIncidentCount > 0) {
      blockers.push(`${criticalIncidentCount} critical operational incidents require immediate action`);
      score -= 30 * Math.min(3, criticalIncidentCount);
    } else {
      passedChecks.push("Zero active critical operational incidents");
    }

    // 3. Outbox Queue Failure Check
    if (metrics.outbox.failedCount > 0) {
      warnings.push(`${metrics.outbox.failedCount} failed outbox messages pending retry`);
      score -= Math.min(20, metrics.outbox.failedCount * 5);
    } else {
      passedChecks.push("Outbox queue delivery healthy with 0 failed messages");
    }

    // 4. Background AI Jobs Check
    if (metrics.aiJobs.failedCount > 0) {
      warnings.push(`${metrics.aiJobs.failedCount} AI ingestion jobs failed`);
      score -= Math.min(15, metrics.aiJobs.failedCount * 3);
    } else {
      passedChecks.push("AI catalog job ingestion queue operating cleanly");
    }

    // 5. Security Audit Log Failures
    if (metrics.securityAudit.failedLogins > 10) {
      warnings.push(`Elevated failed login attempts (${metrics.securityAudit.failedLogins} failures recorded)`);
      score -= 10;
    } else {
      passedChecks.push("Security authentication failure rates normal");
    }

    score = Math.max(0, Math.min(100, score));

    let status: "READY" | "DEGRADED" | "NOT_READY" = "READY";
    if (blockers.length > 0 || score < 50) {
      status = "NOT_READY";
    } else if (warnings.length > 0 || score < 85) {
      status = "DEGRADED";
    }

    return {
      score,
      status,
      evaluatedAt: new Date().toISOString(),
      blockers,
      warnings,
      passedChecks,
    };
  }
}
