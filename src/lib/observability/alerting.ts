import { logger } from "./logger";
import { SLIMetrics } from "./metrics";

export type AlertSeverity = "SEV-1" | "SEV-2" | "SEV-3" | "SEV-4";

export interface OperationalAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  source: string;
  timestamp: string;
  acknowledged: boolean;
}

const recentAlerts: OperationalAlert[] = [];
const alertCooldowns = new Map<string, number>();

export function dispatchAlert(severity: AlertSeverity, title: string, description: string, source: string): OperationalAlert | null {
  const cooldownKey = `${severity}_${title}`;
  const now = Date.now();
  const lastDispatched = alertCooldowns.get(cooldownKey) || 0;

  // 5 minute alert cooldown per alert type
  if (now - lastDispatched < 5 * 60 * 1000) {
    return null;
  }

  alertCooldowns.set(cooldownKey, now);

  const alert: OperationalAlert = {
    id: `alt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    severity,
    title,
    description,
    source,
    timestamp: new Date().toISOString(),
    acknowledged: false,
  };

  recentAlerts.unshift(alert);
  if (recentAlerts.length > 50) {
    recentAlerts.pop();
  }

  logger.error(`OPERATIONAL ALERT DISPATCHED [${severity}]: ${title}`, {
    errorCode: "OPERATIONAL_ALERT",
    severity,
    title,
    description,
    source,
  });

  return alert;
}

export function evaluateSLOAlerts(metrics: SLIMetrics) {
  if (metrics.errorBudgetRemainingPercent < 20 && metrics.totalRequests >= 10) {
    dispatchAlert(
      "SEV-2",
      "SLO Error Budget Depletion Warning",
      `Error budget remaining has fallen to ${metrics.errorBudgetRemainingPercent}%. Error rate is ${metrics.errorRatePercent}%.`,
      "SLO_MONITOR"
    );
  }

  if (metrics.crossTenantBlocks > 0) {
    dispatchAlert(
      "SEV-1",
      "Cross-Tenant Security Boundary Breach Blocked",
      `Detected and blocked ${metrics.crossTenantBlocks} unauthorized cross-tenant data access attempts.`,
      "SECURITY_MONITOR"
    );
  }
}

export function getActiveAlerts(): OperationalAlert[] {
  return recentAlerts;
}
