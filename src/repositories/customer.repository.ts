/**
 * ============================================================================
 * Atlas Commerce OS — Customer Repository Layer
 * ============================================================================
 * Specification Reference: CRM-001 / M7-001 / DAT-001
 * Domain: Customer Relationship Management (CRM) Data Access Layer
 * 
 * Responsibilities:
 * - Multi-tenant Customer aggregate persistence (companyId isolated)
 * - Customer contact and address management
 * - Paginated list queries with keyword search
 * - Optimistic concurrency versioning
 * - Soft deletion
 * ============================================================================
 */

import { prisma } from "@/lib/prisma";
import { CreateCustomerInput, CustomerQueryInput, UpdateCustomerInput } from "@/types/crm.dto";
import { Prisma } from "@prisma/client";

export class CustomerRepository {
  /**
   * Find paginated Customer aggregates for a specific tenant.
   */
  async findMany(companyId: string, query: CustomerQueryInput) {
    const { page, limit, search, creditHold } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {
      companyId,
      deletedAt: null,
      ...(creditHold !== undefined ? { creditHold } : {}),
      ...(search
        ? {
            OR: [
              { customerCode: { contains: search, mode: "insensitive" } },
              { legalName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          contacts: true,
          addresses: true,
        },
      }),
      prisma.customer.count({ where }),
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
   * Find a single Customer aggregate by ID with full entity graph.
   */
  async findById(companyId: string, id: string) {
    return prisma.customer.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        contacts: true,
        addresses: true,
        orders: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  /**
   * Create a new Customer aggregate with contacts and default addresses.
   */
  async create(companyId: string, data: CreateCustomerInput, userId?: string) {
    const customerCode = data.customerCode || `CUST-${Math.floor(100000 + Math.random() * 900000)}`;

    return prisma.customer.create({
      data: {
        companyId,
        customerCode,
        legalName: data.legalName,
        email: data.email,
        phone: data.phone,
        creditLimit: data.creditLimit,
        creditHold: data.creditHold,
        createdBy: userId,
        contacts: {
          create: data.contacts.map((c) => ({
            name: `${c.firstName} ${c.lastName}`,
            email: c.email,
            phone: c.phone,
            role: c.isPrimary ? "Primary Contact" : "Secondary Contact",
          })),
        },
        addresses: {
          create: data.addresses.map((a) => ({
            addressType: a.type,
            street: a.street2 ? `${a.street1}, ${a.street2}` : a.street1,
            city: a.city,
            state: a.state,
            postalCode: a.postalCode,
            country: a.country,
            isDefault: a.isDefault,
          })),
        },
      },
      include: {
        contacts: true,
        addresses: true,
      },
    });
  }

  /**
   * Update existing Customer aggregate properties.
   */
  async update(companyId: string, id: string, data: UpdateCustomerInput, userId?: string) {
    const existing = await this.findById(companyId, id);
    if (!existing) {
      throw new Error("Customer not found or access denied");
    }

    return prisma.customer.update({
      where: { id },
      data: {
        legalName: data.legalName,
        email: data.email,
        phone: data.phone,
        creditLimit: data.creditLimit,
        creditHold: data.creditHold,
        updatedBy: userId,
        version: { increment: 1 },
      },
      include: {
        contacts: true,
        addresses: true,
      },
    });
  }

  /**
   * Update credit terms and hold status.
   */
  async updateCreditStatus(companyId: string, id: string, creditLimit: number, creditHold: boolean, userId?: string) {
    const existing = await this.findById(companyId, id);
    if (!existing) {
      throw new Error("Customer not found or access denied");
    }

    return prisma.customer.update({
      where: { id },
      data: {
        creditLimit,
        creditHold,
        updatedBy: userId,
        version: { increment: 1 },
      },
    });
  }

  /**
   * Soft delete Customer aggregate.
   */
  async archive(companyId: string, id: string, userId?: string) {
    const existing = await this.findById(companyId, id);
    if (!existing) {
      throw new Error("Customer not found or access denied");
    }

    return prisma.customer.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
  }
}

export const customerRepository = new CustomerRepository();
