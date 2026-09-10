import { OrderStatus } from "@prisma/client";

import type { CreateCustomerDto } from "@/domains/customer/dto/createCustomer.dto";
import type { UpdateCustomerDto } from "@/domains/customer/dto/updateCustomer.dto";
import type { CustomerFilters } from "@/domains/customer/types/customerFilters";

import { customerRepository } from "@/domains/customer/repositories/customer.repository";

export class CustomerService {
  async getCustomers(filters: CustomerFilters = {}) {
    return customerRepository.findAll(filters);
  }

  async getCustomer(id: string) {
    const customer = await customerRepository.findById(id);

    if (!customer) {
      throw new Error("Customer not found.");
    }

    return customer;
  }

  async getCustomerDetails(id: string) {
    const customer = await customerRepository.findDetailedById(id);

    if (!customer) {
      throw new Error("Customer not found.");
    }

    const completedOrders = customer.orders.filter(
      (order) => order.status !== OrderStatus.CANCELLED
    );

    const totalOrders = completedOrders.length;

    const totalSpend = completedOrders.reduce(
      (sum, order) => sum + Number((order as any).totalAmount ?? 0),
      0
    );

    const lastPurchase =
      completedOrders.length > 0
        ? completedOrders[0].createdAt
        : null;

    return {
      customer,
      summary: {
        totalOrders,
        totalSpend,
        lastPurchase,
      },
      recentOrders: customer.orders,
    };
  }

  async createCustomer(data: CreateCustomerDto) {
    // Check duplicate email
    const existingEmail = await customerRepository.findByEmail(data.email);

    if (existingEmail) {
      throw new Error("Customer email already exists.");
    }

    // Get latest customer code
    const latestCode = await customerRepository.getLatestCustomerCode();

    // Generate next code
    const customerCode = this.generateCustomerCode(latestCode);

    // Create customer
    return customerRepository.create(data, customerCode);
  }

  private generateCustomerCode(latestCode: string | null): string {
    if (!latestCode) {
      return "CUST-000001";
    }

    const next = Number(latestCode.replace("CUST-", "")) + 1;

    return `CUST-${String(next).padStart(6, "0")}`;
  }

  async updateCustomer(id: string, data: UpdateCustomerDto) {
    await this.getCustomer(id);

    if (data.email) {
      const existingEmail = await customerRepository.findByEmail(data.email);

      if (existingEmail && existingEmail.id !== id) {
        throw new Error("Customer email already exists.");
      }
    }

    return customerRepository.update(id, data);
  }

  async archiveCustomer(id: string) {
    await this.getCustomer(id);

    return customerRepository.archive(id);
  }

  async deleteCustomer(id: string) {
    await this.getCustomer(id);

    return customerRepository.delete(id);
  }

  async exportCustomers(filters: CustomerFilters = {}) {
    return customerRepository.findAll(filters);
  }
}

export const customerService = new CustomerService();