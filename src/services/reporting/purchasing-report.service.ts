/**
 * ============================================================================
 * Ondrio Commerce OS — Purchasing Report Domain Service
 * ============================================================================
 * Specification Reference: M10-002 / BSD-008 / SAD-001
 * Multi-tenant purchasing spend, supplier performance & lead times service
 * ============================================================================
 */

import { PurchasingReportRepository } from "@/repositories/purchasing-report.repository";
import { UserSessionPayload } from "@/types/auth.dto";
import { PurchasingReportQueryInput } from "@/types/reporting.dto";

export class PurchasingReportService {
  constructor(
    private purchasingRepo: PurchasingReportRepository = new PurchasingReportRepository()
  ) {}

  /**
   * High level purchasing spend KPIs.
   */
  async purchasingKPIs(session: UserSessionPayload, query?: PurchasingReportQueryInput) {
    return this.purchasingRepo.purchaseSpend(session.companyId, query);
  }

  /**
   * Supplier performance scorecards.
   */
  async supplierScorecards(session: UserSessionPayload, query?: PurchasingReportQueryInput) {
    return this.purchasingRepo.supplierPerformance(session.companyId, query);
  }

  /**
   * Monthly procurement spend trends.
   */
  async procurementSpend(session: UserSessionPayload, query?: PurchasingReportQueryInput) {
    return this.purchasingRepo.purchaseTrend(session.companyId, query);
  }

  /**
   * Supplier average lead times.
   */
  async supplierLeadTimes(session: UserSessionPayload) {
    return this.purchasingRepo.supplierLeadTimes(session.companyId);
  }

  /**
   * Receiving goods performance.
   */
  async receivingPerformance(session: UserSessionPayload, query?: PurchasingReportQueryInput) {
    return this.purchasingRepo.receivingPerformance(session.companyId, query);
  }
}

export const purchasingReportService = new PurchasingReportService();
