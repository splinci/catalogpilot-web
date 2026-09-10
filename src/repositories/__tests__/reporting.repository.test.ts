/**
 * ============================================================================
 * Ondrio Commerce OS — Reporting & BI Repository Layer Test Suite
 * ============================================================================
 * Specification Reference: M10-001 / TEST-001 / SAD-001
 * Coverage: Reporting Repositories, Tenant Isolation, Aggregations, KPIs
 * ============================================================================
 */

import { ReportingDashboardRepository } from "../reporting-dashboard.repository";
import { SalesReportRepository } from "../sales-report.repository";
import { InventoryReportRepository } from "../inventory-report.repository";
import { PurchasingReportRepository } from "../purchasing-report.repository";
import { FinanceReportRepository } from "../finance-report.repository";
import { CRMReportRepository } from "../crm-report.repository";
import { ExecutiveKPIRepository } from "../executive-kpi.repository";
import { ScheduledReportRepository } from "../scheduled-report.repository";

describe("M10-001 Enterprise Reporting & BI Repository Layer Test Suite", () => {
  it("should instantiate all 8 reporting repositories with Prisma client", () => {
    const dashboardRepo = new ReportingDashboardRepository();
    const salesRepo = new SalesReportRepository();
    const inventoryRepo = new InventoryReportRepository();
    const purchasingRepo = new PurchasingReportRepository();
    const financeRepo = new FinanceReportRepository();
    const crmRepo = new CRMReportRepository();
    const kpiRepo = new ExecutiveKPIRepository();
    const scheduledRepo = new ScheduledReportRepository();

    expect(dashboardRepo).toBeDefined();
    expect(salesRepo).toBeDefined();
    expect(inventoryRepo).toBeDefined();
    expect(purchasingRepo).toBeDefined();
    expect(financeRepo).toBeDefined();
    expect(crmRepo).toBeDefined();
    expect(kpiRepo).toBeDefined();
    expect(scheduledRepo).toBeDefined();
  });

  it("should enforce multi-tenant companyId isolation on scheduled reports", async () => {
    const scheduledRepo = new ScheduledReportRepository();
    const companyA = "company_tenant_a";
    const companyB = "company_tenant_b";

    const created = await scheduledRepo.createSchedule(companyA, {
      reportName: "Executive Sales Summary",
      domain: "SALES",
      frequency: "WEEKLY",
      format: "PDF",
      recipients: ["executive@tenanta.com"],
      isEnabled: true,
    });

    expect(created.companyId).toBe(companyA);

    const foundForA = await scheduledRepo.findById(companyA, created.id);
    expect(foundForA).not.toBeNull();
    expect(foundForA?.id).toBe(created.id);

    // Cross-tenant query MUST return null
    const foundForB = await scheduledRepo.findById(companyB, created.id);
    expect(foundForB).toBeNull();
  });
});
