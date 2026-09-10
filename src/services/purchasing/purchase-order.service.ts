/**
 * ============================================================================
 * Atlas Commerce OS — Purchase Order Domain Service
 * ============================================================================
 * Specification Reference: PUR-002 / BSD-004 / M5-001
 * Domain: Purchase Order Aggregate Root & Lifecycle Management
 * 
 * Responsibilities:
 * - Purchase Order Creation & Line Item Validation
 * - Status transition state machine execution
 * - Multi-stage approvals (`DRAFT` -> `PENDING_APPROVAL` -> `APPROVED` -> `SENT`)
 * - Audit logging and domain event outbox publishing
 * ============================================================================
 */

import { purchaseOrderRepository, PurchaseOrderRepository } from "@/repositories/purchase-order.repository";
import { supplierRepository, SupplierRepository } from "@/repositories/supplier.repository";
import { procurementPolicy, ProcurementPolicy } from "./procurement.policy";
import { auditService, AuditService } from "../audit.service";
import { CreatePurchaseOrderInput, PurchaseOrderQueryInput } from "@/types/purchasing.dto";
import { UserSessionPayload } from "@/types/auth.dto";
import { AuditAction, POStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class PurchaseOrderService {
  constructor(
    private purchasingRepo: PurchaseOrderRepository = purchaseOrderRepository,
    private supplierRepo: SupplierRepository = supplierRepository,
    private policy: ProcurementPolicy = procurementPolicy,
    private audit: AuditService = auditService
  ) {}

  async listPurchaseOrders(session: UserSessionPayload, query: PurchaseOrderQueryInput = { page: 1, limit: 20 }) {
    return this.purchasingRepo.findMany(session.companyId, query);
  }

  async getPurchaseOrderById(session: UserSessionPayload, id: string) {
    const po = await this.purchasingRepo.findById(session.companyId, id);
    if (!po) {
      throw new Error("Purchase order not found or access denied");
    }
    return po;
  }

  async getProcurementStats(session: UserSessionPayload) {
    const stats = await this.purchasingRepo.findMany(session.companyId, { limit: 100 });
    
    const openOrdersCount = stats.items.filter(
      (po) => po.status === POStatus.SENT || po.status === POStatus.PARTIALLY_RECEIVED
    ).length;

    const pendingApprovalCount = stats.items.filter(
      (po) => po.status === POStatus.PENDING_APPROVAL
    ).length;

    const totalSpend = stats.items.reduce(
      (sum, po) => sum + Number(po.totalAmount),
      0
    );

    return {
      totalOrders: stats.total,
      totalSpend,
      openOrdersCount,
      pendingApprovalCount,
    };
  }

  async createPurchaseOrder(session: UserSessionPayload, input: CreatePurchaseOrderInput) {
    const supplier = await this.supplierRepo.findById(session.companyId, input.supplierId);
    if (!supplier) {
      throw new Error("Supplier not found or access denied");
    }

    const po = await this.purchasingRepo.create(session.companyId, input, session.userId);

    await prisma.outboxMessage.create({
      data: {
        companyId: session.companyId,
        eventType: "PurchaseOrderCreated",
        payload: { poId: po.id, poNumber: po.poNumber, totalAmount: Number(po.totalAmount) },
      },
    });

    await this.audit.log({
      companyId: session.companyId,
      userId: session.userId,
      action: AuditAction.PO_APPROVED,
      entityName: "PurchaseOrder",
      entityId: po.id,
      details: { poNumber: po.poNumber, status: po.status, totalAmount: Number(po.totalAmount), event: "PO_CREATED" },
    });

    return po;
  }

  async transitionStatus(session: UserSessionPayload, id: string, targetStatus: POStatus, reason?: string) {
    const po = await this.getPurchaseOrderById(session, id);

    this.policy.validateStatusTransition(po.status, targetStatus);

    await this.purchasingRepo.updateStatus(session.companyId, id, targetStatus, session.userId);

    await prisma.outboxMessage.create({
      data: {
        companyId: session.companyId,
        eventType: `PurchaseOrder${targetStatus}`,
        payload: { poId: id, poNumber: po.poNumber, status: targetStatus, reason },
      },
    });

    await this.audit.log({
      companyId: session.companyId,
      userId: session.userId,
      action: AuditAction.PO_APPROVED,
      entityName: "PurchaseOrder",
      entityId: id,
      details: { previousStatus: po.status, newStatus: targetStatus, reason },
    });

    return this.getPurchaseOrderById(session, id);
  }
}

export const purchaseOrderService = new PurchaseOrderService();
