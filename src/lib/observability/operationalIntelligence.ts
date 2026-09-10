export interface OperationalHealthScorecard {
  systemHealth: "HEALTHY" | "DEGRADED" | "CRITICAL";
  affectedTenantsCount: number;
  openIncidentsCount: number;
  sloCompliancePercentage: number;
}

export function evaluateOperationalHealth(
  openIncidentsCount: number,
  affectedTenantsCount: number,
  sloCompliancePercentage: number
): OperationalHealthScorecard {
  let systemHealth: "HEALTHY" | "DEGRADED" | "CRITICAL" = "HEALTHY";

  if (openIncidentsCount > 0 || sloCompliancePercentage < 99.5) {
    systemHealth = "DEGRADED";
  }

  if (openIncidentsCount >= 3 || sloCompliancePercentage < 95.0) {
    systemHealth = "CRITICAL";
  }

  return {
    systemHealth,
    affectedTenantsCount,
    openIncidentsCount,
    sloCompliancePercentage,
  };
}
