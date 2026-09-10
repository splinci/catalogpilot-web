/**
 * ============================================================================
 * Ondrio Commerce OS — Finance Report Repository
 * ============================================================================
 * Specification Reference: M10-001 / BSD-008 / DAT-001
 * Multi-tenant receivables aging, revenue & payment trends DAL
 * ============================================================================
 */

import { BaseRepository } from "./base/base.repository";
import { FinanceReportQueryInput } from "@/types/reporting.dto";

export class FinanceReportRepository extends BaseRepository {
  /**
   * Aggregate Accounts Receivable aging buckets (Current, 1-30, 31-60, 61-90, 90+ days).
   */
  async receivablesAging(companyId: string, query?: FinanceReportQueryInput) {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        companyId,
        deletedAt: null,
        status: { in: ["ISSUED", "PARTIALLY_PAID", "OVERDUE"] },
      },
      select: {
        id: true,
        invoiceNumber: true,
        customerId: true,
        dueDate: true,
        totalAmount: true,
        customer: { select: { legalName: true } },
      },
    });

    const now = new Date();
    let current = 0;
    let days1_30 = 0;
    let days31_60 = 0;
    let days61_90 = 0;
    let days90Plus = 0;

    for (const inv of invoices) {
      const due = new Date(inv.dueDate);
      const diffMs = now.getTime() - due.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const amount = Number(inv.totalAmount || 0);

      if (diffDays <= 0) current += amount;
      else if (diffDays <= 30) days1_30 += amount;
      else if (diffDays <= 60) days31_60 += amount;
      else if (diffDays <= 90) days61_90 += amount;
      else days90Plus += amount;
    }

    const totalReceivables = current + days1_30 + days31_60 + days61_90 + days90Plus;

    return {
      companyId,
      totalReceivables: Math.round(totalReceivables * 100) / 100,
      buckets: {
        current: Math.round(current * 100) / 100,
        days1_30: Math.round(days1_30 * 100) / 100,
        days31_60: Math.round(days31_60 * 100) / 100,
        days61_90: Math.round(days61_90 * 100) / 100,
        days90Plus: Math.round(days90Plus * 100) / 100,
      },
      openInvoicesCount: invoices.length,
    };
  }

  /**
   * Invoice status summary.
   */
  async invoiceSummary(companyId: string, query?: FinanceReportQueryInput) {
    const invoices = await this.prisma.invoice.findMany({
      where: { companyId, deletedAt: null },
      select: { status: true, totalAmount: true },
    });

    let totalInvoicedUSD = 0;
    let totalOutstandingUSD = 0;

    const statusCounts: Record<string, number> = {};

    for (const inv of invoices) {
      totalInvoicedUSD += Number(inv.totalAmount || 0);
      if (inv.status !== "CANCELLED") {
        totalOutstandingUSD += Number(inv.totalAmount || 0);
      }
      statusCounts[inv.status] = (statusCounts[inv.status] || 0) + 1;
    }

    return {
      totalInvoicesCount: invoices.length,
      totalInvoicedUSD: Math.round(totalInvoicedUSD * 100) / 100,
      totalOutstandingUSD: Math.round(totalOutstandingUSD * 100) / 100,
      statusCounts,
    };
  }

  /**
   * Payment collections summary.
   */
  async paymentSummary(companyId: string, query?: FinanceReportQueryInput) {
    const payments = await this.prisma.payment.findMany({
      where: { companyId, deletedAt: null },
      select: { amount: true, method: true, createdAt: true },
    });

    const totalCollectedUSD = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    return {
      totalPaymentsCount: payments.length,
      totalCollectedUSD: Math.round(totalCollectedUSD * 100) / 100,
    };
  }

  /**
   * Revenue trend.
   */
  async revenueTrend(companyId: string, query?: FinanceReportQueryInput) {
    const invoices = await this.prisma.invoice.findMany({
      where: { companyId, deletedAt: null },
      select: { createdAt: true, totalAmount: true },
      orderBy: { createdAt: "asc" },
    });

    const monthMap: Record<string, { month: string; revenueUSD: number }> = {};

    for (const inv of invoices) {
      const mStr = inv.createdAt.toISOString().slice(0, 7);
      if (!monthMap[mStr]) monthMap[mStr] = { month: mStr, revenueUSD: 0 };
      monthMap[mStr].revenueUSD += Number(inv.totalAmount || 0);
    }

    return Object.values(monthMap);
  }

  /**
   * Payment collections trend.
   */
  async collectionsTrend(companyId: string, query?: FinanceReportQueryInput) {
    const payments = await this.prisma.payment.findMany({
      where: { companyId, deletedAt: null },
      select: { createdAt: true, amount: true },
      orderBy: { createdAt: "asc" },
    });

    const monthMap: Record<string, { month: string; collectedUSD: number }> = {};

    for (const p of payments) {
      const mStr = p.createdAt.toISOString().slice(0, 7);
      if (!monthMap[mStr]) monthMap[mStr] = { month: mStr, collectedUSD: 0 };
      monthMap[mStr].collectedUSD += Number(p.amount || 0);
    }

    return Object.values(monthMap);
  }

  /**
   * Find overdue invoices.
   */
  async overdueInvoices(companyId: string, query?: FinanceReportQueryInput) {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 20;
    const skip = (page - 1) * limit;

    const invoices = await this.prisma.invoice.findMany({
      where: {
        companyId,
        deletedAt: null,
        status: "OVERDUE",
      },
      take: limit,
      skip,
      orderBy: { dueDate: "asc" },
    });

    const total = await this.prisma.invoice.count({
      where: { companyId, deletedAt: null, status: "OVERDUE" },
    });

    return {
      items: invoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
