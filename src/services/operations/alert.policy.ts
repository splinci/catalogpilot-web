/**
 * ============================================================================
 * Splinci Commerce OS — Operational Alert Policy Engine
 * ============================================================================
 * Specification Reference: CI-003 / ALERT-001 / POL-001 / SEC-001
 * Domain: Pure Alerting Business Rules, Deduplication & Severity Mapping
 * Note: Pure functions ONLY — 0 Prisma imports, 0 database queries.
 * ============================================================================
 */

import {
  AlertSeverityEnum,
  AlertSourceEnum,
  AlertEventDto,
} from "../../types/operations-alert.dto";

export class AlertPolicy {
  static readonly DEFAULT_DEDUP_WINDOW_MS = 15 * 60 * 1000; // 15 Minutes

  /**
   * Determine alert severity based on event source and context.
   */
  static determineAlertSeverity(
    source: AlertSourceEnum,
    context: { isSecurityFailure?: boolean; isDatabaseDisconnected?: boolean; errorBudgetBreached?: boolean; retryCount?: number }
  ): AlertSeverityEnum {
    if (context.isDatabaseDisconnected || context.isSecurityFailure) {
      return AlertSeverityEnum.P1_CRITICAL;
    }
    if (source === AlertSourceEnum.SLO_BREACH && context.errorBudgetBreached) {
      return AlertSeverityEnum.P1_CRITICAL;
    }
    if (source === AlertSourceEnum.OUTBOX && (context.retryCount ?? 0) >= 5) {
      return AlertSeverityEnum.P1_CRITICAL;
    }
    if (source === AlertSourceEnum.SLO_BREACH || source === AlertSourceEnum.WORKER || source === AlertSourceEnum.INCIDENT) {
      return AlertSeverityEnum.P2_HIGH;
    }
    return AlertSeverityEnum.P3_MEDIUM;
  }

  /**
   * Calculate deterministic deduplication key for alert events.
   */
  static calculateDeduplicationKey(event: Partial<AlertEventDto>): string {
    const scope = event.companyId ? `tenant:${event.companyId}` : "platform";
    const entity = event.metadata?.entityId ? `:${event.metadata.entityId}` : "";
    return `${scope}:${event.source}:${event.eventType}:${event.severity}${entity}`;
  }

  /**
   * Determine if alert should be dispatched based on settings and severity threshold.
   */
  static shouldDispatch(
    eventSeverity: AlertSeverityEnum,
    minSeverityThreshold: AlertSeverityEnum = AlertSeverityEnum.P2_HIGH,
    isDispatchEnabled = true
  ): boolean {
    if (!isDispatchEnabled) return false;

    const severityLevels: Record<AlertSeverityEnum, number> = {
      [AlertSeverityEnum.P1_CRITICAL]: 4,
      [AlertSeverityEnum.P2_HIGH]: 3,
      [AlertSeverityEnum.P3_MEDIUM]: 2,
      [AlertSeverityEnum.P4_LOW]: 1,
    };

    return severityLevels[eventSeverity] >= severityLevels[minSeverityThreshold];
  }

  /**
   * Determine if duplicate alert within deduplication window should be suppressed.
   */
  static shouldSuppress(
    dedupKey: string,
    lastDispatchedAtMap: Map<string, number>,
    windowMs = AlertPolicy.DEFAULT_DEDUP_WINDOW_MS
  ): boolean {
    const lastDispatched = lastDispatchedAtMap.get(dedupKey);
    if (!lastDispatched) return false;
    return Date.now() - lastDispatched < windowMs;
  }

  /**
   * Sanitize alert metadata to prevent secret leakage in payloads or logs.
   */
  static sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> {
    if (!metadata) return {};
    const sensitiveKeys = ["token", "secret", "password", "key", "authorization", "webhookurl"];
    const sanitized: Record<string, any> = {};

    for (const [k, v] of Object.entries(metadata)) {
      if (sensitiveKeys.some((s) => k.toLowerCase().includes(s))) {
        sanitized[k] = "[REDACTED]";
      } else {
        sanitized[k] = v;
      }
    }
    return sanitized;
  }
}
