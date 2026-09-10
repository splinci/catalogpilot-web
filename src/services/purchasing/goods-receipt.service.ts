/**
 * ============================================================================
 * Atlas Commerce OS — Goods Receipt Domain Service
 * ============================================================================
 * Specification Reference: PUR-002 / BSD-004 / M5-001
 * Domain: Goods Receiving Engine & WMS Inventory Integration
 * 
 * Responsibilities:
 * - Validate receiving payload using InventoryIntegrationPolicy & ProcurementPolicy
 * - Execute atomic Goods Receipt inside prisma.$transaction
 * - Automatically update InventoryItem stock and write InventoryTransaction (PURCHASE)
 * - Recalculate PO status and publish GoodsReceived outbox event
 * ============================================================================
 */

import { goodsReceiptRepository, GoodsReceiptRepository } from "@/repositories/goods-receipt.repository";
import { procurementPolicy, ProcurementPolicy } from "./procurement.policy";
import { inventoryIntegrationPolicy, InventoryIntegrationPolicy } from "./inventory-integration.policy";
import { auditService, AuditService } from "../audit.service";
import { ReceiveGoodsInput } from "@/types/purchasing.dto";
import { UserSessionPayload } from "@/types/auth.dto";
import { AuditAction } from "@prisma/client";

export class GoodsReceiptService {
  constructor(
    private goodsReceiptRepo: GoodsReceiptRepository = goodsReceiptRepository,
    private policy: ProcurementPolicy = procurementPolicy,
    private integrationPolicy: InventoryIntegrationPolicy = inventoryIntegrationPolicy,
    private audit: AuditService = auditService
  ) {}

  async receiveGoods(session: UserSessionPayload, poId: string, input: ReceiveGoodsInput) {
    this.integrationPolicy.validateReceivingPayload(input.lines);

    const receipt = await this.goodsReceiptRepo.createReceipt(
      session.companyId,
      poId,
      input.lines,
      input.notes,
      session.userId
    );

    await this.audit.log({
      companyId: session.companyId,
      userId: session.userId,
      action: AuditAction.STOCK_ADJUSTED,
      entityName: "GoodsReceipt",
      entityId: receipt.id,
      details: {
        receiptNumber: receipt.receiptNumber,
        poId,
        lineCount: input.lines.length,
      },
    });

    return receipt;
  }
}

export const goodsReceiptService = new GoodsReceiptService();
