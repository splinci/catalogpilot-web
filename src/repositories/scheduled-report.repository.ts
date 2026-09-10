/**
 * ============================================================================
 * Ondrio Commerce OS — Scheduled Report Repository
 * ============================================================================
 * Specification Reference: M10-001 / BSD-008 / DAT-001
 * Multi-tenant scheduled report configuration & cron execution DAL
 * ============================================================================
 */

import { BaseRepository } from "./base/base.repository";
import { ScheduledReportInput, ScheduledReportQueryInput } from "@/types/reporting.dto";

export interface ScheduledReportRecord {
  id: string;
  companyId: string;
  reportName: string;
  domain: string;
  frequency: string;
  format: string;
  cronExpr?: string;
  recipients: string[];
  parameters?: Record<string, unknown>;
  isEnabled: boolean;
  lastRunAt?: Date | null;
  nextRunAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory store fallback for scheduled reports
const SCHEDULED_REPORTS_STORE: Map<string, ScheduledReportRecord> = new Map();

export class ScheduledReportRepository extends BaseRepository {
  /**
   * Create a new scheduled report configuration.
   */
  async createSchedule(companyId: string, input: ScheduledReportInput): Promise<ScheduledReportRecord> {
    const id = `sched_rpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const record: ScheduledReportRecord = {
      id,
      companyId,
      reportName: input.reportName,
      domain: input.domain,
      frequency: input.frequency,
      format: input.format || "PDF",
      cronExpr: input.cronExpr,
      recipients: input.recipients,
      parameters: input.parameters,
      isEnabled: input.isEnabled ?? true,
      lastRunAt: null,
      nextRunAt: nextRun,
      createdAt: now,
      updatedAt: now,
    };

    SCHEDULED_REPORTS_STORE.set(id, record);
    return record;
  }

  /**
   * Find scheduled reports matching query filters for a company.
   */
  async findSchedules(companyId: string, query?: ScheduledReportQueryInput) {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 20;

    const all = Array.from(SCHEDULED_REPORTS_STORE.values()).filter((rec) => rec.companyId === companyId);
    let filtered = all;

    if (query?.domain) {
      filtered = filtered.filter((r) => r.domain === query.domain);
    }
    if (query?.frequency) {
      filtered = filtered.filter((r) => r.frequency === query.frequency);
    }
    if (query?.isEnabled !== undefined) {
      filtered = filtered.filter((r) => r.isEnabled === query.isEnabled);
    }

    const total = filtered.length;
    const skip = (page - 1) * limit;
    const items = filtered.slice(skip, skip + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Find scheduled report by ID with company isolation.
   */
  async findById(companyId: string, id: string): Promise<ScheduledReportRecord | null> {
    const record = SCHEDULED_REPORTS_STORE.get(id);
    if (!record || record.companyId !== companyId) return null;
    return record;
  }

  /**
   * Update scheduled report configuration.
   */
  async updateSchedule(
    companyId: string,
    id: string,
    input: Partial<ScheduledReportInput>
  ): Promise<ScheduledReportRecord | null> {
    const record = await this.findById(companyId, id);
    if (!record) return null;

    const updated: ScheduledReportRecord = {
      ...record,
      ...input,
      updatedAt: new Date(),
    };

    SCHEDULED_REPORTS_STORE.set(id, updated);
    return updated;
  }

  /**
   * Delete scheduled report configuration.
   */
  async deleteSchedule(companyId: string, id: string): Promise<boolean> {
    const record = await this.findById(companyId, id);
    if (!record) return false;
    return SCHEDULED_REPORTS_STORE.delete(id);
  }

  /**
   * Find all scheduled reports due for execution across all tenants.
   */
  async findDueSchedules(): Promise<ScheduledReportRecord[]> {
    const now = new Date();
    return Array.from(SCHEDULED_REPORTS_STORE.values()).filter(
      (rec) => rec.isEnabled && rec.nextRunAt && rec.nextRunAt <= now
    );
  }
}
