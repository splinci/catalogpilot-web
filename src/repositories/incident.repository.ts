/**
 * ============================================================================
 * Splinci Commerce OS — Operational Incident Repository
 * ============================================================================
 * Specification Reference: M12-001 / OPS-001 / OBS-001 / DAT-001
 * Derived Tenant Operational Incidents & Action Gate Repository
 * ============================================================================
 */

import { BaseRepository } from "./base/base.repository";
import {
  IncidentQueryDto,
  IncidentItemDto,
  IncidentSourceEnum,
  IncidentSeverityEnum,
} from "../types/operations.dto";

export class IncidentRepository extends BaseRepository {
  /**
   * Aggregate & fetch tenant operational incidents.
   * Enforces strict tenant boundary via companyId.
   */
  async findIncidents(query: Partial<IncidentQueryDto> & { companyId: string }): Promise<{ incidents: IncidentItemDto[]; total: number }> {
    const { companyId, source, severity, page = 1, limit = 20, startDate, endDate } = query;
    const incidents: IncidentItemDto[] = [];

    const dateFilter = startDate || endDate ? {
      createdAt: {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      },
    } : {};

    // 1. Fetch Failed or High-Retry Outbox Messages
    if (!source || source === IncidentSourceEnum.OUTBOX) {
      const failedOutbox = await this.prisma.outboxMessage.findMany({
        where: {
          companyId,
          OR: [{ status: "FAILED" }, { retryCount: { gte: 3 } }],
          ...dateFilter,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      for (const msg of failedOutbox) {
        const isCritical = msg.status === "FAILED" || msg.retryCount >= 5;
        incidents.push({
          id: `INC-OUTBOX-${msg.id}`,
          source: IncidentSourceEnum.OUTBOX,
          severity: isCritical ? IncidentSeverityEnum.CRITICAL : IncidentSeverityEnum.HIGH,
          title: `Outbox Event Delivery Failure: ${msg.eventType}`,
          details: `Message payload failed delivery after ${msg.retryCount} attempts. Status: ${msg.status}`,
          entityId: msg.id,
          occurredAt: msg.createdAt,
          metadata: {
            eventType: msg.eventType,
            retryCount: msg.retryCount,
            status: msg.status,
          },
        });
      }
    }

    // 2. Fetch Failed AI Processing Jobs
    if (!source || source === IncidentSourceEnum.AI_JOB) {
      const failedJobs = await this.prisma.aIJob.findMany({
        where: {
          companyId,
          status: "FAILED",
          ...dateFilter,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      for (const job of failedJobs) {
        incidents.push({
          id: `INC-AI-${job.id}`,
          source: IncidentSourceEnum.AI_JOB,
          severity: IncidentSeverityEnum.HIGH,
          title: `AI Catalog Processing Job Failure`,
          details: `Ingestion job for source document failed processing. Target: ${job.fileUrl}`,
          entityId: job.id,
          occurredAt: job.createdAt,
          metadata: {
            fileUrl: job.fileUrl,
            status: job.status,
          },
        });
      }
    }

    // 3. Fetch Security Audit Login Failures
    if (!source || source === IncidentSourceEnum.SECURITY_AUDIT) {
      const auditFailures = await this.prisma.auditLog.findMany({
        where: {
          companyId,
          action: "LOGIN_FAILED",
          ...dateFilter,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      for (const log of auditFailures) {
        incidents.push({
          id: `INC-SEC-${log.id}`,
          source: IncidentSourceEnum.SECURITY_AUDIT,
          severity: IncidentSeverityEnum.MEDIUM,
          title: `Security Warning: Authentication Failure`,
          details: `Failed login attempt recorded from IP ${log.ipAddress || "Unknown"}. Entity: ${log.entityName}`,
          entityId: log.id,
          occurredAt: log.createdAt,
          metadata: {
            action: log.action,
            ipAddress: log.ipAddress,
            details: log.details,
          },
        });
      }
    }

    // 4. Fetch Expired Workflow Executions
    if (!source || source === IncidentSourceEnum.WORKFLOW) {
      const expiredWorkflows = await this.prisma.workflowExecution.findMany({
        where: {
          definition: { companyId },
          status: "EXPIRED",
          ...(startDate || endDate ? { createdAt: dateFilter.createdAt } : {}),
        },
        include: { definition: true },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      for (const wf of expiredWorkflows) {
        incidents.push({
          id: `INC-WF-${wf.id}`,
          source: IncidentSourceEnum.WORKFLOW,
          severity: IncidentSeverityEnum.MEDIUM,
          title: `Workflow Execution Expired: ${wf.definition.name}`,
          details: `Workflow execution timed out awaiting response. Trigger: ${wf.triggerEvent}`,
          entityId: wf.id,
          occurredAt: wf.createdAt,
          metadata: {
            triggerEvent: wf.triggerEvent,
            definitionId: wf.definitionId,
          },
        });
      }
    }

    // Sort all incidents by occurredAt descending
    incidents.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

    // Apply severity filter if requested
    let filtered = incidents;
    if (severity) {
      filtered = filtered.filter((inc) => inc.severity === severity);
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return { incidents: paginated, total };
  }
}

export const incidentRepository = new IncidentRepository();
