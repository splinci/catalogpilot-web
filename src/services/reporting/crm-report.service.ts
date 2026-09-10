/**
 * ============================================================================
 * Ondrio Commerce OS — CRM Report Domain Service
 * ============================================================================
 * Specification Reference: M10-002 / BSD-008 / SAD-001
 * Multi-tenant customer growth, LTV & RFM segmentation service
 * ============================================================================
 */

import { CRMReportRepository } from "@/repositories/crm-report.repository";
import { UserSessionPayload } from "@/types/auth.dto";
import { CRMReportQueryInput } from "@/types/reporting.dto";

export class CRMReportService {
  constructor(
    private crmRepo: CRMReportRepository = new CRMReportRepository()
  ) {}

  /**
   * Executive customer relationship dashboard.
   */
  async customerDashboard(session: UserSessionPayload, query?: CRMReportQueryInput) {
    const [retention, ltv, growth] = await Promise.all([
      this.crmRepo.customerRetention(session.companyId, query),
      this.crmRepo.customerLifetimeValue(session.companyId, query),
      this.crmRepo.customerGrowth(session.companyId, query),
    ]);

    return {
      companyId: session.companyId,
      retention,
      ltv,
      growth,
    };
  }

  /**
   * Customer onboarding growth trends.
   */
  async customerGrowth(session: UserSessionPayload, query?: CRMReportQueryInput) {
    return this.crmRepo.customerGrowth(session.companyId, query);
  }

  /**
   * Customer retention rate.
   */
  async retentionMetrics(session: UserSessionPayload, query?: CRMReportQueryInput) {
    return this.crmRepo.customerRetention(session.companyId, query);
  }

  /**
   * Customer Lifetime Value (CLV).
   */
  async LTVMetrics(session: UserSessionPayload, query?: CRMReportQueryInput) {
    return this.crmRepo.customerLifetimeValue(session.companyId, query);
  }

  /**
   * RFM customer segmentation.
   */
  async customerSegmentation(session: UserSessionPayload, query?: CRMReportQueryInput) {
    return this.crmRepo.customerSegmentation(session.companyId, query);
  }

  /**
   * Credit risk customer dashboard.
   */
  async creditRiskDashboard(session: UserSessionPayload, query?: CRMReportQueryInput) {
    return this.crmRepo.creditRiskCustomers(session.companyId, query);
  }
}

export const crmReportService = new CRMReportService();
