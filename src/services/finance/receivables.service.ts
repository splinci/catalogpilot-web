/**
 * ============================================================================
 * Atlas Commerce OS — Receivables Service
 * ============================================================================
 * Specification Reference: FIN-003 / M8-001 / DDD-001
 * Domain: Accounts Receivable Aging & Customer Balances
 * ============================================================================
 */

import { invoiceRepository, InvoiceRepository } from "@/repositories/invoice.repository";
import { FinancePolicy } from "./finance.policy";
import { InvoiceStatus } from "@prisma/client";

export interface AgingReport {
  current: number;
  days1_30: number;
  days31_60: number;
  days61_90: number;
  days90Plus: number;
  totalReceivables: number;
}

export class ReceivablesService {
  constructor(private invoiceRepo: InvoiceRepository = invoiceRepository) {}

  /**
   * Calculate AR aging report for a tenant.
   */
  async getAgingReport(companyId: string): Promise<AgingReport> {
    const result = await this.invoiceRepo.findMany(companyId, { page: 1, limit: 1000 });
    const invoices = result.items;

    const report: AgingReport = {
      current: 0,
      days1_30: 0,
      days31_60: 0,
      days61_90: 0,
      days90Plus: 0,
      totalReceivables: 0,
    };

    invoices.forEach((inv) => {
      if (inv.status === InvoiceStatus.PAID || inv.status === InvoiceStatus.CANCELLED) {
        return;
      }

      const totalPaid = inv.payments ? inv.payments.reduce((sum, p) => sum + Number(p.amount), 0) : 0;
      const balance = Number(inv.totalAmount) - totalPaid;
      if (balance <= 0) return;

      report.totalReceivables += balance;
      const bucket = FinancePolicy.calculateAgingBucket(new Date(inv.dueDate), false);

      switch (bucket) {
        case "CURRENT":
          report.current += balance;
          break;
        case "1-30":
          report.days1_30 += balance;
          break;
        case "31-60":
          report.days31_60 += balance;
          break;
        case "61-90":
          report.days61_90 += balance;
          break;
        case "90+":
          report.days90Plus += balance;
          break;
      }
    });

    return report;
  }
}

export const receivablesService = new ReceivablesService();
