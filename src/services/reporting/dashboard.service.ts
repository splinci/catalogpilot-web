/**
 * ============================================================================
 * Ondrio Commerce OS — Executive Dashboard Service
 * ============================================================================
 * Specification Reference: M10-002 / BSD-008 / SAD-001
 * Multi-tenant cross-module executive dashboard orchestration
 * ============================================================================
 */

import { ReportingDashboardRepository } from "@/repositories/reporting-dashboard.repository";
import { auditService, AuditService } from "../audit.service";
import { UserSessionPayload } from "@/types/auth.dto";
import { DashboardQueryInput } from "@/types/reporting.dto";
import { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class DashboardService {
  constructor(
    private dashboardRepo: ReportingDashboardRepository = new ReportingDashboardRepository(),
    private audit: AuditService = auditService
  ) {}

  /**
   * Get full executive dashboard across all business domains.
   */
  async getExecutiveDashboard(session: UserSessionPayload, query?: DashboardQueryInput) {
    const data = await this.dashboardRepo.getExecutiveDashboard(session.companyId, query);

    await prisma.outboxMessage.create({
      data: {
        companyId: session.companyId,
        eventType: "DashboardViewed",
        payload: {
          viewedBy: session.userId,
          timestamp: new Date().toISOString(),
        },
      },
    });

    await this.audit.log({
      companyId: session.companyId,
      userId: session.userId,
      action: AuditAction.LOGIN,
      entityName: "ExecutiveDashboard",
      entityId: session.companyId,
      details: {
        summary: data.summary,
      },
    });

    return data;
  }

  /**
   * Get high-level business summary.
   */
  async getBusinessSummary(session: UserSessionPayload) {
    return this.dashboardRepo.getBusinessSummary(session.companyId);
  }

  /**
   * Get executive snapshot for header widgets.
   */
  async getExecutiveSnapshot(session: UserSessionPayload) {
    const data = await this.dashboardRepo.getExecutiveDashboard(session.companyId);
    return {
      revenue: data.summary.totalRevenue,
      grossProfit: data.summary.grossProfit,
      orders: data.summary.totalOrdersCount,
      receivables: data.summary.receivables,
    };
  }

  /**
   * Get cross-module metrics.
   */
  async getCrossModuleMetrics(session: UserSessionPayload) {
    return this.dashboardRepo.getCrossModuleKPIs(session.companyId);
  }

  /**
   * Get monthly trend dashboard.
   */
  async getTrendDashboard(session: UserSessionPayload) {
    return this.dashboardRepo.getTrendSnapshots(session.companyId);
  }
}

export const dashboardService = new DashboardService();
