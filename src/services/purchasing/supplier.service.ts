/**
 * ============================================================================
 * Atlas Commerce OS — Supplier Domain Service
 * ============================================================================
 * Specification Reference: PUR-002 / BSD-004 / M5-001
 * Domain: Supplier Management
 * 
 * Responsibilities:
 * - Vendor master CRUD operations
 * - Code uniqueness validation
 * - Audit logging and domain event outbox publishing
 * ============================================================================
 */

import { supplierRepository, SupplierRepository } from "@/repositories/supplier.repository";
import { auditService, AuditService } from "../audit.service";
import { CreateSupplierInput } from "@/types/purchasing.dto";
import { UserSessionPayload } from "@/types/auth.dto";
import { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class SupplierService {
  constructor(
    private supplierRepo: SupplierRepository = supplierRepository,
    private audit: AuditService = auditService
  ) {}

  async listSuppliers(session: UserSessionPayload) {
    return this.supplierRepo.findMany(session.companyId);
  }

  async getSupplierById(session: UserSessionPayload, id: string) {
    const supplier = await this.supplierRepo.findById(session.companyId, id);
    if (!supplier) {
      throw new Error("Supplier not found or access denied");
    }
    return supplier;
  }

  async createSupplier(session: UserSessionPayload, input: CreateSupplierInput) {
    const existingCode = await this.supplierRepo.findByCode(session.companyId, input.code);
    if (existingCode) {
      throw new Error(`Supplier code '${input.code}' already exists`);
    }

    const supplier = await this.supplierRepo.create(session.companyId, input, session.userId);

    await prisma.outboxMessage.create({
      data: {
        companyId: session.companyId,
        eventType: "SupplierCreated",
        payload: { supplierId: supplier.id, code: supplier.code, name: supplier.name },
      },
    });

    await this.audit.log({
      companyId: session.companyId,
      userId: session.userId,
      action: AuditAction.PO_APPROVED,
      entityName: "Supplier",
      entityId: supplier.id,
      details: { code: supplier.code, name: supplier.name },
    });

    return supplier;
  }

  async updateSupplier(session: UserSessionPayload, id: string, input: Partial<CreateSupplierInput>) {
    const supplier = await this.supplierRepo.update(session.companyId, id, input, session.userId);
    return supplier;
  }

  async archiveSupplier(session: UserSessionPayload, id: string) {
    const supplier = await this.getSupplierById(session, id);
    await this.supplierRepo.archive(session.companyId, id, session.userId);

    await prisma.outboxMessage.create({
      data: {
        companyId: session.companyId,
        eventType: "SupplierArchived",
        payload: { supplierId: id, code: supplier.code },
      },
    });

    return { success: true };
  }
}

export const supplierService = new SupplierService();
