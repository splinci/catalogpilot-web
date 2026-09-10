import { Prisma, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

import type { CreateOrderDto } from "../dto/createOrder.dto";
import type { OrderFilters } from "../types/order";

function buildWhereClause(
  filters: OrderFilters
): Prisma.SalesOrderWhereInput {
  const where: Prisma.SalesOrderWhereInput = {};

  if (filters.search) {
    where.OR = [
      {
        orderNumber: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        customer: {
          legalName: {
            contains: filters.search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  if (filters.status) {
    where.status = filters.status as OrderStatus;
  }

  return where;
}

class OrderRepository {
  async findMany(filters: OrderFilters = {}) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    return prisma.salesOrder.findMany({
      where: buildWhereClause(filters),
      include: {
        customer: true,
        lines: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                title: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });
  }

  async count(filters: OrderFilters = {}) {
    return prisma.salesOrder.count({
      where: buildWhereClause(filters),
    });
  }

  async findById(id: string) {
    return prisma.salesOrder.findUnique({
      where: {
        id,
      },
      include: {
        customer: true,
        lines: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                title: true,
                price: true,
              },
            },
          },
        },
      },
    });
  }

  async create(data: CreateOrderDto) {
    const orderNumber = `ORD-${Date.now()}`;
    return prisma.salesOrder.create({
      data: {
        companyId: "cmp_atlas_01",
        customerId: data.customerId,
        orderNumber,
        subtotal: 0,
        taxTotal: data.tax ?? 0,
        shippingFee: data.shipping ?? 0,
        totalAmount: 0,
        status: OrderStatus.DRAFT,
      },
      include: {
        customer: true,
        lines: true,
      },
    });
  }

  async updateStatus(
    id: string,
    status: OrderStatus
  ) {
    return prisma.salesOrder.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }

  async updateStatusTx(
    tx: Prisma.TransactionClient,
    id: string,
    status: OrderStatus
  ) {
    return tx.salesOrder.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }
}

export const orderRepository = new OrderRepository();
