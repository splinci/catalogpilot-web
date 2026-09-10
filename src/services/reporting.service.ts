/**
 * ============================================================================
 * Ondrio Commerce OS — Reporting Subsystem Facade
 * ============================================================================
 * Specification Reference: M10-002 / BSD-008 / SAD-001
 * Central entrypoint for all reporting, KPI, and analytics services
 * ============================================================================
 */

import { dashboardService, DashboardService } from "./reporting/dashboard.service";
import { salesReportService, SalesReportService } from "./reporting/sales-report.service";
import { inventoryReportService, InventoryReportService } from "./reporting/inventory-report.service";
import { purchasingReportService, PurchasingReportService } from "./reporting/purchasing-report.service";
import { financeReportService, FinanceReportService } from "./reporting/finance-report.service";
import { crmReportService, CRMReportService } from "./reporting/crm-report.service";
import { executiveKPIService, ExecutiveKPIService } from "./reporting/executive-kpi.service";
import { analyticsService, AnalyticsService } from "./reporting/analytics.service";
import { scheduledReportService, ScheduledReportService } from "./reporting/scheduled-report.service";

export class ReportingService {
  constructor(
    public readonly dashboard: DashboardService = dashboardService,
    public readonly sales: SalesReportService = salesReportService,
    public readonly inventory: InventoryReportService = inventoryReportService,
    public readonly purchasing: PurchasingReportService = purchasingReportService,
    public readonly finance: FinanceReportService = financeReportService,
    public readonly crm: CRMReportService = crmReportService,
    public readonly executiveKPI: ExecutiveKPIService = executiveKPIService,
    public readonly analytics: AnalyticsService = analyticsService,
    public readonly scheduled: ScheduledReportService = scheduledReportService
  ) {}
}

export const reportingService = new ReportingService();

export {
  dashboardService,
  salesReportService,
  inventoryReportService,
  purchasingReportService,
  financeReportService,
  crmReportService,
  executiveKPIService,
  analyticsService,
  scheduledReportService,
};
