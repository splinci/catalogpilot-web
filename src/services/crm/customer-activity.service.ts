/**
 * ============================================================================
 * Atlas Commerce OS — Customer Activity Timeline Service
 * ============================================================================
 * Specification Reference: CRM-002 / BSD-006 / M7-001
 * Domain: CRM Activity Aggregation Across Sales Orders, Quotations & Audit Logs
 * ============================================================================
 */

import { customerRepository, CustomerRepository } from "@/repositories/customer.repository";
import { prisma } from "@/lib/prisma";

export interface CustomerActivityItem {
  id: string;
  type: "ORDER" | "QUOTATION" | "SHIPMENT" | "AUDIT";
  title: string;
  description: string;
  timestamp: string;
}

export class CustomerActivityService {
  constructor(private customerRepo: CustomerRepository = customerRepository) {}

  /**
   * Resolve unified activity timeline for a customer.
   */
  async getCustomerTimeline(companyId: string, customerId: string): Promise<CustomerActivityItem[]> {
    const customer = await this.customerRepo.findById(companyId, customerId);
    if (!customer) {
      throw new Error("Customer not found or access denied");
    }

    // Resolve sales orders
    const orders = await prisma.salesOrder.findMany({
      where: { companyId, customerId },
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    // Resolve sales quotations
    const quotations = await prisma.salesQuotation.findMany({
      where: { companyId, customerId },
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    const timeline: CustomerActivityItem[] = [];

    orders.forEach((o) => {
      timeline.push({
        id: `ORD-${o.id}`,
        type: "ORDER",
        title: `Sales Order ${o.orderNumber}`,
        description: `Order placed for $${Number(o.totalAmount).toFixed(2)} [Status: ${o.status}]`,
        timestamp: o.createdAt.toISOString(),
      });
    });

    quotations.forEach((q) => {
      timeline.push({
        id: `QUO-${q.id}`,
        type: "QUOTATION",
        title: `Sales Quotation ${q.quoteNumber}`,
        description: `Quotation generated for $${Number(q.totalAmount).toFixed(2)}`,
        timestamp: q.createdAt.toISOString(),
      });
    });

    // Sort chronologically descending
    return timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export const customerActivityService = new CustomerActivityService();
