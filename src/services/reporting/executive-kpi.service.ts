/**
 * ============================================================================
 * Ondrio Commerce OS — Executive KPI Service
 * ============================================================================
 * Specification Reference: M10-002 / BSD-008 / SAD-001
 * Unified Executive KPI aggregation & Business Health Score service
 * ============================================================================
 */

import { ExecutiveKPIRepository } from "@/repositories/executive-kpi.repository";
import { ReportingPolicy } from "./reporting.policy";
import { UserSessionPayload } from "@/types/auth.dto";
import { ExecutiveKPIQueryInput } from "@/types/reporting.dto";
import { prisma } from "@/lib/prisma";

export class ExecutiveKPIService {
  constructor(
    private kpiRepo: ExecutiveKPIRepository = new ExecutiveKPIRepository()
  ) {}

  /**
   * Aggregate 100% of domain modules into a single unified Executive KPI suite.
   */
  async getUnifiedExecutiveKPIs(session: UserSessionPayload, query?: ExecutiveKPIQueryInput) {
    const [rev, sales, inv, pur, fin, crm, ai] = await Promise.all([
      this.kpiRepo.revenueKPIs(session.companyId, query),
      this.kpiRepo.salesKPIs(session.companyId, query),
      this.kpiRepo.inventoryKPIs(session.companyId, query),
      this.kpiRepo.purchasingKPIs(session.companyId, query),
      this.kpiRepo.financeKPIs(session.companyId, query),
      this.kpiRepo.customerKPIs(session.companyId, query),
      this.kpiRepo.aiKPIs(session.companyId, query),
    ]);

    const health = ReportingPolicy.calculateBusinessHealthScore({
      revenueGrowthPercent: rev.monthlyGrowthPercent,
      grossProfitMarginPercent: 40.0,
      collectionEfficiencyPercent: fin.collectionEfficiencyPercent,
      onTimeDeliveryRate: pur.supplierOnTimeDeliveryRate,
    });

    await prisma.outboxMessage.create({
      data: {
        companyId: session.companyId,
        eventType: "KPICalculated",
        payload: {
          healthScore: health.score,
          healthRating: health.rating,
          calculatedAt: new Date().toISOString(),
        },
      },
    });

    return {
      companyId: session.companyId,
      businessHealthScore: health.score,
      businessHealthRating: health.rating,
      revenue: rev,
      sales,
      inventory: inv,
      purchasing: pur,
      finance: fin,
      crm,
      ai,
    };
  }
}

export const executiveKPIService = new ExecutiveKPIService();
