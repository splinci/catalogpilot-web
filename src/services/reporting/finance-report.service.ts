/**
 * ============================================================================
 * Ondrio Commerce OS — Finance Report Domain Service
 * ============================================================================
 * Specification Reference: M10-002 / BSD-008 / SAD-001
 * Multi-tenant financial analytics, AR aging & profitability service
 * ============================================================================
 */

import { FinanceReportRepository } from "@/repositories/finance-report.repository";
import { UserSessionPayload } from "@/types/auth.dto";
import { FinanceReportQueryInput } from "@/types/reporting.dto";

export class FinanceReportService {
  constructor(
    private financeRepo: FinanceReportRepository = new FinanceReportRepository()
  ) {}

  /**
   * Revenue trends & dashboard.
   */
  async revenueDashboard(session: UserSessionPayload, query?: FinanceReportQueryInput) {
    return this.financeRepo.revenueTrend(session.companyId, query);
  }

  /**
   * Accounts Receivable aging dashboard.
   */
  async receivablesDashboard(session: UserSessionPayload, query?: FinanceReportQueryInput) {
    return this.financeRepo.receivablesAging(session.companyId, query);
  }

  /**
   * Payment collections trends dashboard.
   */
  async collectionsDashboard(session: UserSessionPayload, query?: FinanceReportQueryInput) {
    return this.financeRepo.collectionsTrend(session.companyId, query);
  }

  /**
   * High-level invoice status KPIs.
   */
  async invoiceKPIs(session: UserSessionPayload, query?: FinanceReportQueryInput) {
    return this.financeRepo.invoiceSummary(session.companyId, query);
  }

  /**
   * Payment collection KPIs.
   */
  async paymentKPIs(session: UserSessionPayload, query?: FinanceReportQueryInput) {
    return this.financeRepo.paymentSummary(session.companyId, query);
  }

  /**
   * Enterprise profitability metrics.
   */
  async profitabilityMetrics(session: UserSessionPayload, query?: FinanceReportQueryInput) {
    const invoices = await this.financeRepo.invoiceSummary(session.companyId, query);
    const grossMarginPercent = 40.0;
    return {
      companyId: session.companyId,
      totalInvoicedUSD: invoices.totalInvoicedUSD,
      estimatedProfitUSD: Math.round(invoices.totalInvoicedUSD * (grossMarginPercent / 100) * 100) / 100,
      grossMarginPercent,
    };
  }
}

export const financeReportService = new FinanceReportService();
