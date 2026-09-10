import type {
  OrderStatus,
  PaymentStatus,
} from "@/generated/prisma/enums";

import type { Customer } from "@/domains/customer/types/customer";

export interface OrderFilters {
  search?: string;
  customerId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  limit?: number;
}

export interface OrderItemSummary {
  id: string;
  quantity: number;
}

export interface CustomerSummary {
  id: string;
  name: string;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  customer: CustomerSummary;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  createdAt: string | Date;
  items: OrderItemSummary[];
}

export interface OrderDetails extends OrderSummary {
  customer: Customer;

  subtotal: number;
  tax: number;
  discount: number;
  shipping: number;
  total: number;

  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;

    product: {
      id: string;
      sku: string;
      name: string;
      sellingPrice: number;
    };
  }[];
}

export interface OrdersResponse {
  items: OrderSummary[];
  total: number;
  page: number;
  limit: number;
}