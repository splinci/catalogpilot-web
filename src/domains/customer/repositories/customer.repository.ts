import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

import type { CreateCustomerDto } from "@/domains/customer/dto/createCustomer.dto";
import type { UpdateCustomerDto } from "@/domains/customer/dto/updateCustomer.dto";
import type { CustomerFilters } from "@/domains/customer/types/customerFilters";

/**
 * Builds the Prisma where clause from filters.
 */
function buildWhereClause(
  filters: CustomerFilters
): Prisma.CustomerWhereInput {
  const where: Prisma.CustomerWhereInput = {};

  if (filters.search) {
    where.OR = [
      {
        legalName: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        customerCode: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        phone: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
    ];
  }

  return where;
}

export class CustomerRepository {
  async findAll(filters: CustomerFilters = {}) {
    return prisma.customer.findMany({
      where: buildWhereClause(filters),
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async count(filters: CustomerFilters = {}) {
    return prisma.customer.count({
      where: buildWhereClause(filters),
    });
  }

  async findById(id: string) {
    return prisma.customer.findUnique({
      where: {
        id,
      },
    });
  }

  async getLatestCustomerCode(): Promise<string | null> {
    const customer = await prisma.customer.findFirst({
      orderBy: {
        customerCode: "desc",
      },
      select: {
        customerCode: true,
      },
    });
  
    return customer?.customerCode ?? null;
  }

  async findDetailedById(id: string) {
    return prisma.customer.findUnique({
      where: {
        id,
      },
      include: {
        orders: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async findByCustomerCode(customerCode: string) {
    return prisma.customer.findFirst({
      where: {
        customerCode,
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.customer.findFirst({
      where: {
        email,
      },
    });
  }

  async create(
    data: CreateCustomerDto,
    customerCode: string
  ) {
    return prisma.customer.create({
      data: {
        companyId: "cmp_atlas_01",
        customerCode,
        legalName: data.name,
        email: data.email,
        phone: data.phone || null,
      },
    });
  }

  async update(id: string, data: UpdateCustomerDto) {
    return prisma.customer.update({
      where: {
        id,
      },
      data: {
        legalName: data.name,
        email: data.email,
        phone: data.phone || null,
      },
    });
  }

  async archive(id: string) {
    return prisma.customer.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async delete(id: string) {
    return prisma.customer.delete({
      where: {
        id,
      },
    });
  }

  async getActiveCustomers() {
    return prisma.customer.findMany({
      orderBy: {
        legalName: "asc",
      },
    });
  }
}

export const customerRepository = new CustomerRepository();