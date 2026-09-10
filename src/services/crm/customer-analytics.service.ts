/**
 * ============================================================================
 * Atlas Commerce OS — Customer Analytics Service
 * ============================================================================
 * Specification Reference: CRM-002 / BSD-006 / M7-001
 * Domain: Customer Lifetime Value (LTV), AOV & Executive CRM KPI Engine
 * ============================================================================
 */

import { prisma } from "@/lib/prisma";

export interface CustomerAnalyticsStats {
  totalCustomers: number;
  activeCustomers: number;
  creditHoldCustomers: number;
  totalRevenue: number;
  averageLTV: number;
  averageAOV: number;
}

export class CustomerAnalyticsService {
  /**
   * Calculate tenant-wide CRM metrics and customer LTV.
   */
  async getCRMStats(companyId: string): Promise<CustomerAnalyticsStats> {
    const [totalCustomers, creditHoldCustomers, orders] = await Promise.all([
      prisma.customer.count({ where: { companyId, deletedAt: null } }),
      prisma.customer.count({ where: { companyId, deletedAt: null, creditHold: true } }),
      prisma.salesOrder.findMany({
        where: {
          companyId,
          status: { notIn: ["CANCELLED"] },
        },
        select: {
          customerId: true,
          totalAmount: true,
        },
      }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const totalOrdersCount = orders.length;

    const uniqueCustomerIds = new Set(orders.map((o) => o.customerId));
    const activeCustomers = uniqueCustomerIds.size;

    const averageLTV = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
    const averageAOV = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

    return {
      totalCustomers,
      activeCustomers,
      creditHoldCustomers,
      totalRevenue,
      averageLTV,
      averageAOV,
    };
  }
}

export const customerAnalyticsService = new CustomerAnalyticsService();
