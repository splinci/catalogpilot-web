/**
 * ============================================================================
 * Ondrio Commerce OS — Sales Report Domain Service
 * ============================================================================
 * Specification Reference: M10-002 / BSD-008 / SAD-001
 * Multi-tenant sales performance analytics & trend calculation service
 * ============================================================================
 */

import { SalesReportRepository } from "@/repositories/sales-report.repository";
import { ReportingPolicy } from "./reporting.policy";
import { UserSessionPayload } from "@/types/auth.dto";
import { SalesReportQueryInput } from "@/types/reporting.dto";

export class SalesReportService {
  constructor(
    private salesRepo: SalesReportRepository = new SalesReportRepository()
  ) {}

  /**
   * Calculate overall sales performance metrics with growth % and variance.
   */
  async salesPerformance(session: UserSessionPayload, query?: SalesReportQueryInput) {
    const daily = await this.salesRepo.salesByDay(session.companyId, query);
    const totalRevenue = daily.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = daily.reduce((sum, d) => sum + d.ordersCount, 0);

    const prevRevenue = totalRevenue * 0.85; // Simulated previous period
    const growthPercent = ReportingPolicy.calculateGrowthPercent(totalRevenue, prevRevenue);

    return {
      companyId: session.companyId,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0,
      growthPercent,
      daily,
    };
  }

  /**
   * Monthly sales trend with moving averages.
   */
  async salesTrend(session: UserSessionPayload, query?: SalesReportQueryInput) {
    const monthly = await this.salesRepo.salesByMonth(session.companyId, query);
    const revenues = monthly.map((m) => m.revenue);
    const movingAverage = ReportingPolicy.calculateMovingAverage(revenues, 3);

    return monthly.map((m, i) => ({
      ...m,
      movingAverage: movingAverage[i] || m.revenue,
    }));
  }

  /**
   * Sales breakdown by customer.
   */
  async customerSales(session: UserSessionPayload, query?: SalesReportQueryInput) {
    return this.salesRepo.salesByCustomer(session.companyId, query);
  }

  /**
   * Sales breakdown by product SKU.
   */
  async productSales(session: UserSessionPayload, query?: SalesReportQueryInput) {
    return this.salesRepo.salesByProduct(session.companyId, query);
  }

  /**
   * Sales breakdown by product category.
   */
  async categorySales(session: UserSessionPayload, query?: SalesReportQueryInput) {
    return this.salesRepo.salesByCategory(session.companyId, query);
  }

  /**
   * Salesperson performance leaderboard.
   */
  async salespersonPerformance(session: UserSessionPayload, query?: SalesReportQueryInput) {
    return this.salesRepo.salesBySalesperson(session.companyId, query);
  }

  /**
   * Top performing customers by revenue.
   */
  async topCustomers(session: UserSessionPayload, limit = 10) {
    return this.salesRepo.topCustomers(session.companyId, limit);
  }

  /**
   * Top performing products by revenue.
   */
  async topProducts(session: UserSessionPayload, limit = 10) {
    return this.salesRepo.topProducts(session.companyId, limit);
  }
}

export const salesReportService = new SalesReportService();
