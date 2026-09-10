import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

import { customerRepository } from "@/domains/customer/repositories/customer.repository";
import { productRepository } from "@/domains/inventory/repositories/product.repository";
import { orderRepository } from "@/domains/order/repositories/order.repository";

import type { CreateOrderDto } from "@/domains/order/dto/createOrder.dto";
import { NotFoundError } from "@/lib/errors/NotFoundError";
import type { OrderFilters } from "@/domains/order/types/order";
import type { UpdateOrderDto } from "@/domains/order/dto/updateOrder.dto";

async function validateCustomer(customerId: string) {
  const customer = await customerRepository.findById(customerId);
  if (!customer) {
    throw new NotFoundError("Customer not found.");
  }
  return customer;
}

export const orderService = {
  async createOrder(data: CreateOrderDto) {
    const customer = await validateCustomer(data.customerId);
    const orderNumber = `ORD-${Date.now()}`;

    return prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.create({
        data: {
          companyId: "cmp_atlas_01",
          orderNumber,
          customerId: customer.id,
          subtotal: 100,
          taxTotal: data.tax ?? 0,
          shippingFee: data.shipping ?? 0,
          totalAmount: 100,
          status: OrderStatus.DRAFT,
        },
      });

      return order;
    });
  },

  async updateOrder(id: string, data: UpdateOrderDto) {
    const existingOrder = await orderRepository.findById(id);
    if (!existingOrder) {
      throw new NotFoundError("Order not found.");
    }

    return prisma.salesOrder.update({
      where: { id },
      data: {
        updatedAt: new Date(),
      },
    });
  },

  async cancelOrder(id: string) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError("Order not found.");
    }

    return prisma.salesOrder.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
    });
  },

  async returnOrder(id: string) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError("Order not found.");
    }

    return prisma.salesOrder.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
    });
  },

  async getOrderById(id: string) {
    return prisma.salesOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });
  },
  
  async getOrders(filters: OrderFilters = {}) {
    const [items, total] = await Promise.all([
      orderRepository.findMany(filters),
      orderRepository.count(filters),
    ]);

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async updateStatus(id: string, status: OrderStatus) {
    return orderRepository.updateStatus(id, status);
  },

  async updatePaymentStatus() {
    throw new Error("Not implemented.");
  },
};