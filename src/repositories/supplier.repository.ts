/**
 * ============================================================================
 * Atlas Commerce OS — Supplier Repository Implementation
 * ============================================================================
 * Specification Reference: PUR-001 / BSD-004 / M5-001
 * Aggregate Root: Supplier
 * Encapsulated Entities: SupplierContact
 * 
 * Responsibilities:
 * - Multi-tenant isolated querying (companyId)
 * - Supplier Master CRUD operations
 * - Contact management
 * - Soft deletion and optimistic concurrency (versioning)
 * ============================================================================
 */

import { BaseRepository } from "./base/base.repository";
import { CreateSupplierInput } from "@/types/purchasing.dto";
import { Prisma } from "@prisma/client";

export interface SupplierFilters {
  search?: string;
  code?: string;
  email?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export class SupplierRepository extends BaseRepository {
  /**
   * Find paginated suppliers matching tenant and search filters.
   */
  async findMany(
    companyId: string,
    filters: SupplierFilters = {},
    pagination: PaginationOptions = {}
  ) {
    const page = pagination.page && pagination.page > 0 ? pagination.page : 1;
    const limit = pagination.limit && pagination.limit > 0 ? Math.min(pagination.limit, 100) : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.SupplierWhereInput = {
      companyId,
      deletedAt: null,
      ...(filters.code && { code: filters.code.toUpperCase().trim() }),
      ...(filters.email && { email: filters.email.toLowerCase().trim() }),
      ...(filters.search && {
        OR: [
          { code: { contains: filters.search, mode: "insensitive" } },
          { name: { contains: filters.search, mode: "insensitive" } },
          { email: { contains: filters.search, mode: "insensitive" } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
        include: {
          contacts: true,
          _count: { select: { pos: true, products: true } },
        },
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Resolve supplier aggregate root by ID with mandatory companyId tenant guard.
   */
  async findById(companyId: string, id: string) {
    return this.prisma.supplier.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        contacts: true,
        pos: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
  }

  /**
   * Find supplier by unique vendor code within company tenant.
   */
  async findByCode(companyId: string, code: string) {
    return this.prisma.supplier.findFirst({
      where: { companyId, code: code.toUpperCase().trim(), deletedAt: null },
    });
  }

  /**
   * Create a new supplier master record.
   */
  async create(companyId: string, data: CreateSupplierInput, userId?: string) {
    return this.prisma.supplier.create({
      data: {
        companyId,
        code: data.code.toUpperCase().trim(),
        name: data.name.trim(),
        email: data.email ? data.email.toLowerCase().trim() : null,
        phone: data.phone ?? null,
        createdBy: userId,
      },
      include: { contacts: true },
    });
  }

  /**
   * Update supplier details with optimistic concurrency check.
   */
  async update(
    companyId: string,
    id: string,
    data: Partial<CreateSupplierInput> & { version?: number },
    userId?: string
  ) {
    if (data.version !== undefined) {
      const existing = await this.prisma.supplier.findFirst({
        where: { id, companyId, deletedAt: null },
        select: { version: true },
      });

      if (!existing) {
        throw new Error("Supplier not found or access denied");
      }

      if (existing.version !== data.version) {
        throw new Error("Concurrency Conflict: Supplier has been updated by another transaction");
      }
    }

    return this.prisma.supplier.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.email !== undefined && { email: data.email ? data.email.toLowerCase().trim() : null }),
        ...(data.phone !== undefined && { phone: data.phone }),
        updatedBy: userId,
        version: { increment: 1 },
      },
      include: { contacts: true },
    });
  }

  /**
   * Soft-delete supplier master record.
   */
  async archive(companyId: string, id: string, userId?: string) {
    return this.prisma.supplier.updateMany({
      where: { id, companyId, deletedAt: null },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
  }
}

export const supplierRepository = new SupplierRepository();
