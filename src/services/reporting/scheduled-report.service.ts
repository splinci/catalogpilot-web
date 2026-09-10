/**
 * ============================================================================
 * Ondrio Commerce OS — Scheduled Report Service
 * ============================================================================
 * Specification Reference: M10-002 / BSD-008 / SAD-001
 * Multi-tenant scheduled report creation, validation, cron execution & outbox dispatching
 * ============================================================================
 */

import { ScheduledReportRepository } from "@/repositories/scheduled-report.repository";
import { ReportingPolicy } from "./reporting.policy";
import { auditService, AuditService } from "../audit.service";
import { UserSessionPayload } from "@/types/auth.dto";
import { ScheduledReportInput, ScheduledReportQueryInput } from "@/types/reporting.dto";
import { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class ScheduledReportService {
  constructor(
    private scheduledRepo: ScheduledReportRepository = new ScheduledReportRepository(),
    private audit: AuditService = auditService
  ) {}

  /**
   * Create a new scheduled report configuration.
   */
  async createSchedule(session: UserSessionPayload, input: ScheduledReportInput) {
    ReportingPolicy.validateScheduledReportExecution({
      isEnabled: input.isEnabled ?? true,
      recipients: input.recipients,
    });

    const schedule = await this.scheduledRepo.createSchedule(session.companyId, input);

    await prisma.outboxMessage.create({
      data: {
        companyId: session.companyId,
        eventType: "ReportScheduled",
        payload: {
          scheduleId: schedule.id,
          reportName: schedule.reportName,
          frequency: schedule.frequency,
          recipients: schedule.recipients,
        },
      },
    });

    await this.audit.log({
      companyId: session.companyId,
      userId: session.userId,
      action: AuditAction.USER_CREATED,
      entityName: "ScheduledReport",
      entityId: schedule.id,
      details: {
        reportName: schedule.reportName,
        frequency: schedule.frequency,
      },
    });

    return schedule;
  }

  /**
   * Find paginated scheduled reports.
   */
  async findSchedules(session: UserSessionPayload, query?: ScheduledReportQueryInput) {
    return this.scheduledRepo.findSchedules(session.companyId, query);
  }

  /**
   * Find single scheduled report by ID.
   */
  async findById(session: UserSessionPayload, id: string) {
    return this.scheduledRepo.findById(session.companyId, id);
  }

  /**
   * Update scheduled report configuration.
   */
  async updateSchedule(session: UserSessionPayload, id: string, input: Partial<ScheduledReportInput>) {
    const updated = await this.scheduledRepo.updateSchedule(session.companyId, id, input);

    if (updated) {
      await this.audit.log({
        companyId: session.companyId,
        userId: session.userId,
        action: AuditAction.USER_UPDATED,
        entityName: "ScheduledReport",
        entityId: id,
        details: { input },
      });
    }

    return updated;
  }

  /**
   * Delete scheduled report configuration.
   */
  async deleteSchedule(session: UserSessionPayload, id: string) {
    const deleted = await this.scheduledRepo.deleteSchedule(session.companyId, id);

    if (deleted) {
      await this.audit.log({
        companyId: session.companyId,
        userId: session.userId,
        action: AuditAction.USER_UPDATED,
        entityName: "ScheduledReport",
        entityId: id,
        details: { action: "DELETED", id },
      });
    }

    return deleted;
  }

  /**
   * Execute due scheduled reports across all tenants.
   */
  async executeScheduledReports() {
    const dueSchedules = await this.scheduledRepo.findDueSchedules();
    const results = [];

    for (const schedule of dueSchedules) {
      try {
        await prisma.outboxMessage.create({
          data: {
            companyId: schedule.companyId,
            eventType: "ReportGenerated",
            payload: {
              scheduleId: schedule.id,
              reportName: schedule.reportName,
              format: schedule.format,
              generatedAt: new Date().toISOString(),
            },
          },
        });

        await prisma.outboxMessage.create({
          data: {
            companyId: schedule.companyId,
            eventType: "ScheduledReportExecuted",
            payload: {
              scheduleId: schedule.id,
              recipients: schedule.recipients,
            },
          },
        });

        results.push({ id: schedule.id, status: "SUCCESS" });
      } catch (err: any) {
        await prisma.outboxMessage.create({
          data: {
            companyId: schedule.companyId,
            eventType: "ScheduledReportFailed",
            payload: {
              scheduleId: schedule.id,
              error: err.message,
            },
          },
        });
        results.push({ id: schedule.id, status: "FAILED", error: err.message });
      }
    }

    return results;
  }
}

export const scheduledReportService = new ScheduledReportService();
