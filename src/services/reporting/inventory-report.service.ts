/**
 * ============================================================================
 * Ondrio Commerce OS — Inventory Report Domain Service
 * ============================================================================
 * Specification Reference: M10-002 / BSD-008 / SAD-001
 * WMS inventory valuation, stock turnover & movement analytics service
 * ============================================================================
 */

import { InventoryReportRepository } from "@/repositories/inventory-report.repository";
import { UserSessionPayload } from "@/types/auth.dto";
import { InventoryReportQueryInput } from "@/types/reporting.dto";

export class InventoryReportService {
  constructor(
    private inventoryRepo: InventoryReportRepository = new InventoryReportRepository()
  ) {}

  /**
   * Get high-level inventory valuation KPIs.
   */
  async inventoryKPIs(session: UserSessionPayload, query?: InventoryReportQueryInput) {
    return this.inventoryRepo.inventoryValuation(session.companyId, query);
  }

  /**
   * Stock movement transaction history.
   */
  async inventoryMovement(session: UserSessionPayload, query?: InventoryReportQueryInput) {
    return this.inventoryRepo.inventoryMovement(session.companyId, query);
  }

  /**
   * Stock turnover ratio.
   */
  async inventoryTurnover(session: UserSessionPayload) {
    return this.inventoryRepo.stockTurnover(session.companyId);
  }

  /**
   * Warehouse capacity & stock breakdown.
   */
  async warehousePerformance(session: UserSessionPayload) {
    return this.inventoryRepo.warehouseSummary(session.companyId);
  }

  /**
   * Slow-moving inventory items.
   */
  async slowMovingItems(session: UserSessionPayload, limit = 10) {
    return this.inventoryRepo.slowMovingItems(session.companyId, limit);
  }

  /**
   * Fast-moving high velocity products.
   */
  async fastMovingItems(session: UserSessionPayload, limit = 10) {
    return this.inventoryRepo.fastMovingItems(session.companyId, limit);
  }

  /**
   * Reorder candidates requiring replenishment.
   */
  async reorderAnalysis(session: UserSessionPayload) {
    return this.inventoryRepo.reorderCandidates(session.companyId);
  }
}

export const inventoryReportService = new InventoryReportService();
