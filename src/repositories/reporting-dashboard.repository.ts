/**
 * ============================================================================
 * Ondrio Commerce OS — Executive Dashboard Repository
 * ============================================================================
 * Specification Reference: M10-001 / BSD-008 / DAT-001
 * Multi-tenant cross-module KPI & summary aggregation DAL
 * ============================================================================
 */

import { BaseRepository } from "./base/base.repository";
import { DashboardQueryInput } from "@/types/reporting.dto";

export class ReportingDashboardRepository extends BaseRepository {
  /**
   * Aggregate executive dashboard metrics across revenue, gross profit,
   * orders, inventory valuation, purchasing spend, receivables, AI utilization, and customers.
   */
  async getExecutiveDashboard(companyId: string, query?: DashboardQueryInput) {
    const startDate = query?.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query?.endDate ? new Date(query.endDate) : new Date();

    const [
      ordersCount,
      completedOrders,
      productsCount,
      inventoryItems,
      purchases,
      invoices,
      payments,
      customersCount,
      aiJobsCount,
    ] = await Promise.all([
      this.prisma.salesOrder.count({
        where: { companyId, deletedAt: null, createdAt: { gte: startDate, lte: endDate } },
      }),
      this.prisma.salesOrder.findMany({
        where: { companyId, status: "DELIVERED", deletedAt: null, createdAt: { gte: startDate, lte: endDate } },
        select: { totalAmount: true },
      }),
      this.prisma.product.count({
        where: { companyId, deletedAt: null },
      }),
      this.prisma.inventoryItem.findMany({
        where: { companyId },
        select: { onHandQty: true, product: { select: { costPrice: true, price: true } } },
      }),
      this.prisma.purchaseOrder.findMany({
        where: { companyId, deletedAt: null, createdAt: { gte: startDate, lte: endDate } },
        select: { totalAmount: true },
      }),
      this.prisma.invoice.findMany({
        where: { companyId, deletedAt: null },
        select: { totalAmount: true, status: true },
      }),
      this.prisma.payment.findMany({
        where: { companyId, deletedAt: null, createdAt: { gte: startDate, lte: endDate } },
        select: { amount: true },
      }),
      this.prisma.customer.count({
        where: { companyId, deletedAt: null },
      }),
      this.prisma.aIJob.count({
        where: { companyId, createdAt: { gte: startDate, lte: endDate } },
      }),
    ]);

    const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const totalPurchasingSpend = purchases.reduce((sum, p) => sum + Number(p.totalAmount || 0), 0);
    const totalPaymentsReceived = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const totalReceivables = invoices
      .filter((i) => i.status !== "CANCELLED")
      .reduce((sum, i) => sum + Number(i.totalAmount || 0), 0);

    let totalInventoryValuation = 0;
    for (const item of inventoryItems) {
      const cost = Number(item.product?.costPrice || item.product?.price || 0);
      totalInventoryValuation += item.onHandQty * cost;
    }

    const estimatedGrossProfit = totalRevenue - totalPurchasingSpend * 0.6;

    return {
      companyId,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        grossProfit: Math.round(estimatedGrossProfit * 100) / 100,
        totalOrdersCount: ordersCount,
        inventoryValuation: Math.round(totalInventoryValuation * 100) / 100,
        purchasingSpend: Math.round(totalPurchasingSpend * 100) / 100,
        receivables: Math.round(totalReceivables * 100) / 100,
        paymentsReceived: Math.round(totalPaymentsReceived * 100) / 100,
        activeProductsCount: productsCount,
        activeCustomersCount: customersCount,
        aiJobsExecuted: aiJobsCount,
      },
    };
  }

  /**
   * Get cross-module high level business summary.
   */
  async getBusinessSummary(companyId: string) {
    return this.getExecutiveDashboard(companyId);
  }

  /**
   * Get aggregated KPIs for cross-module dashboard widgets.
   */
  async getCrossModuleKPIs(companyId: string) {
    const dashboard = await this.getExecutiveDashboard(companyId);
    return dashboard.summary;
  }

  /**
   * Get trend snapshots over the past 6 periods.
   */
  async getTrendSnapshots(companyId: string) {
    const now = new Date();
    const snapshots = [];

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const orders = await this.prisma.salesOrder.findMany({
        where: {
          companyId,
          deletedAt: null,
          createdAt: { gte: monthStart, lte: monthEnd },
        },
        select: { totalAmount: true },
      });

      const monthRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

      snapshots.push({
        period: monthStart.toLocaleString("default", { month: "short", year: "numeric" }),
        startDate: monthStart.toISOString(),
        endDate: monthEnd.toISOString(),
        revenue: Math.round(monthRevenue * 100) / 100,
        ordersCount: orders.length,
      });
    }

    return snapshots;
  }
}
