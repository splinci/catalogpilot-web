/**
 * ============================================================================
 * Splinci Commerce OS — Incident Service
 * ============================================================================
 * Specification Reference: M12-002 / OPS-001 / OBS-001 / SAD-001
 * Domain: Operational Incidents & Action Gate Service
 * Note: Delegates persistence to IncidentRepository, applies IncidentPolicy.
 * ============================================================================
 */

import { IncidentRepository, incidentRepository } from "../../repositories/incident.repository";
import { IncidentPolicy } from "./operations.policy";
import { IncidentQueryDto, IncidentItemDto, IncidentSeverityEnum } from "../../types/operations.dto";

export class IncidentService {
  constructor(private readonly incidentRepo: IncidentRepository = incidentRepository) {}

  /**
   * List incidents for tenant with filtering and pagination.
   */
  async listIncidents(query: IncidentQueryDto) {
    if (!query.companyId) {
      throw new Error("companyId is required for tenant incident queries");
    }

    const result = await this.incidentRepo.findIncidents(query);

    // Annotate items with policy attention flags
    const annotated = result.incidents.map((inc) => ({
      ...inc,
      requiresAttention: IncidentPolicy.requiresImmediateAttention(inc),
    }));

    return {
      incidents: annotated,
      total: result.total,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    };
  }

  /**
   * Get operational incidents summary aggregated by severity.
   */
  async getIncidentSummary(companyId: string) {
    if (!companyId) {
      throw new Error("companyId is required for incident summary");
    }

    const { incidents, total } = await this.incidentRepo.findIncidents({
      companyId,
      limit: 100,
    });

    const criticalCount = incidents.filter((i) => i.severity === IncidentSeverityEnum.CRITICAL).length;
    const highCount = incidents.filter((i) => i.severity === IncidentSeverityEnum.HIGH).length;
    const mediumCount = incidents.filter((i) => i.severity === IncidentSeverityEnum.MEDIUM).length;
    const lowCount = incidents.filter((i) => i.severity === IncidentSeverityEnum.LOW).length;
    const actionRequiredCount = incidents.filter((i) => IncidentPolicy.requiresImmediateAttention(i)).length;

    return {
      companyId,
      totalIncidents: total,
      actionRequiredCount,
      bySeverity: {
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
      },
    };
  }

  /**
   * Get critical incidents requiring immediate attention.
   */
  async getCriticalIncidents(companyId: string): Promise<IncidentItemDto[]> {
    if (!companyId) {
      throw new Error("companyId is required for critical incidents");
    }

    const { incidents } = await this.incidentRepo.findIncidents({
      companyId,
      severity: IncidentSeverityEnum.CRITICAL,
      limit: 50,
    });

    return incidents;
  }

  /**
   * Evaluate if a specific incident requires immediate attention.
   */
  evaluateIncidentAttention(incident: IncidentItemDto): boolean {
    return IncidentPolicy.requiresImmediateAttention(incident);
  }
}

export const incidentService = new IncidentService();
