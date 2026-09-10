/**
 * ============================================================================
 * Atlas Commerce OS — Order Analytics Domain Service
 * ============================================================================
 * Specification Reference: ORD-002 / BSD-005 / M6-001
 * Domain: Order Management Systems Intelligence & Metrics
 * 
 * Responsibilities:
 * - Calculate total orders, open orders, shipped orders, and total revenue
 * ============================================================================
 */

import { OrderStats } from "@/types/order.dto";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class OrderAnalyticsService {
  /**
   * Resolve order stats for company tenant.
   */
  async getOrderStats(companyId: string): Promise<OrderStats> {
    const [totalOrders, openOrdersCount, shippedOrdersCount, revenueAggregate] = await Promise.all([
      prisma.salesOrder.count({
        where: { companyId, deletedAt: null },
      }),
      prisma.salesOrder.count({
        where: {
          companyId,
          deletedAt: null,
          status: {
            in: [OrderStatus.DRAFT, OrderStatus.PENDING_APPROVAL, OrderStatus.CONFIRMED, OrderStatus.RESERVED, OrderStatus.PICKING, OrderStatus.PACKING],
          },
        },
      }),
      prisma.salesOrder.count({
        where: {
          companyId,
          deletedAt: null,
          status: { in: [OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.COMPLETED] },
        },
      }),
      prisma.salesOrder.aggregate({
        where: {
          companyId,
          deletedAt: null,
          status: { notIn: [OrderStatus.CANCELLED] },
        },
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    return {
      totalOrders,
      openOrdersCount,
      shippedOrdersCount,
      totalRevenue: Number(revenueAggregate._sum.totalAmount || 0),
    };
  }
}

export const orderAnalyticsService = new OrderAnalyticsService();
