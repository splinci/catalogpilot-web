/**
 * ============================================================================
 * Atlas Commerce OS — Finance Analytics Service
 * ============================================================================
 * Specification Reference: FIN-003 / M8-001 / BSD-007
 * Domain: Executive Financial Dashboard Metrics & Revenue Analytics
 * ============================================================================
 */

import { invoiceRepository, InvoiceRepository } from "@/repositories/invoice.repository";
import { receivablesService, ReceivablesService } from "./receivables.service";
import { InvoiceStatus } from "@prisma/client";

export interface FinanceSummaryMetrics {
  totalRevenue: number;
  totalReceivables: number;
  paidRevenue: number;
  openInvoicesCount: number;
  overdueInvoicesCount: number;
  averageInvoiceValue: number;
}

export class FinanceAnalyticsService {
  constructor(
    private invoiceRepo: InvoiceRepository = invoiceRepository,
    private receivables: ReceivablesService = receivablesService
  ) {}

  /**
   * Calculate executive financial KPI metrics for a tenant.
   */
  async getSummaryMetrics(companyId: string): Promise<FinanceSummaryMetrics> {
    const [invResult, agingReport] = await Promise.all([
      this.invoiceRepo.findMany(companyId, { page: 1, limit: 1000 }),
      this.receivables.getAgingReport(companyId),
    ]);

    const invoices = invResult.items;
    let totalRevenue = 0;
    let paidRevenue = 0;
    let openInvoicesCount = 0;
    let overdueInvoicesCount = 0;

    invoices.forEach((inv) => {
      if (inv.status !== InvoiceStatus.CANCELLED) {
        totalRevenue += Number(inv.totalAmount);
      }

      const totalPaid = inv.payments ? inv.payments.reduce((sum, p) => sum + Number(p.amount), 0) : 0;
      paidRevenue += totalPaid;

      if (inv.status === InvoiceStatus.ISSUED || inv.status === InvoiceStatus.DRAFT) {
        openInvoicesCount++;
        if (new Date(inv.dueDate).getTime() < Date.now()) {
          overdueInvoicesCount++;
        }
      }
    });

    const averageInvoiceValue = invoices.length > 0 ? totalRevenue / invoices.length : 0;

    return {
      totalRevenue,
      totalReceivables: agingReport.totalReceivables,
      paidRevenue,
      openInvoicesCount,
      overdueInvoicesCount,
      averageInvoiceValue,
    };
  }
}

export const financeAnalyticsService = new FinanceAnalyticsService();
