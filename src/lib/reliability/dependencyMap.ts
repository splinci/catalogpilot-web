export type ServiceHealthStatus = "HEALTHY" | "DEGRADED" | "OUTAGE";

export interface DependencyStatus {
  name: string;
  critical: boolean;
  status: ServiceHealthStatus;
  lastChecked: string;
  error?: string;
}

const dependencyRegistry: Map<string, DependencyStatus> = new Map([
  ["Database", { name: "Database", critical: true, status: "HEALTHY", lastChecked: new Date().toISOString() }],
  ["CacheStore", { name: "CacheStore", critical: false, status: "HEALTHY", lastChecked: new Date().toISOString() }],
  ["AiVertexProvider", { name: "AiVertexProvider", critical: false, status: "HEALTHY", lastChecked: new Date().toISOString() }],
  ["WebhookGateway", { name: "WebhookGateway", critical: false, status: "HEALTHY", lastChecked: new Date().toISOString() }],
]);

export function updateDependencyHealth(name: string, status: ServiceHealthStatus, error?: string): DependencyStatus {
  const current = dependencyRegistry.get(name);
  if (!current) {
    throw new Error(`Unknown dependency '${name}'.`);
  }

  current.status = status;
  current.lastChecked = new Date().toISOString();
  current.error = error;

  return current;
}

export function evaluatePlatformDegradationState(): "HEALTHY" | "DEGRADED" | "CRITICAL_FAILURE" {
  let hasCriticalOutage = false;
  let hasDegraded = false;

  for (const dep of dependencyRegistry.values()) {
    if (dep.status === "OUTAGE") {
      if (dep.critical) hasCriticalOutage = true;
      else hasDegraded = true;
    } else if (dep.status === "DEGRADED") {
      hasDegraded = true;
    }
  }

  if (hasCriticalOutage) return "CRITICAL_FAILURE";
  if (hasDegraded) return "DEGRADED";
  return "HEALTHY";
}
