/**
 * ============================================================================
 * Atlas Commerce OS — Procurement Analytics Service
 * ============================================================================
 * Specification Reference: PUR-002 / BSD-004 / M5-001
 * Domain: Procurement Intelligence & Metrics
 * 
 * Responsibilities:
 * - Calculate total supplier spend
 * - Track open purchase orders count
 * - Calculate pending approval totals
 * ============================================================================
 */

import { purchaseOrderRepository, PurchaseOrderRepository } from "@/repositories/purchase-order.repository";
import { UserSessionPayload } from "@/types/auth.dto";

export class ProcurementAnalyticsService {
  constructor(
    private purchasingRepo: PurchaseOrderRepository = purchaseOrderRepository
  ) {}

  async getProcurementMetrics(session: UserSessionPayload) {
    const stats = await this.purchasingRepo.findMany(session.companyId, { limit: 100 });
    
    const openOrdersCount = stats.items.filter(
      (po) => po.status === "SENT" || po.status === "PARTIALLY_RECEIVED"
    ).length;

    const pendingApprovalCount = stats.items.filter(
      (po) => po.status === "PENDING_APPROVAL"
    ).length;

    const totalSpend = stats.items.reduce(
      (sum, po) => sum + Number(po.totalAmount),
      0
    );

    return {
      totalOrders: stats.total,
      totalSpend,
      openOrdersCount,
      pendingApprovalCount,
    };
  }
}

export const procurementAnalyticsService = new ProcurementAnalyticsService();
