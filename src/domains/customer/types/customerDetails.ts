import type { Customer } from "./customer";

import type {
  OrderStatus,
  PaymentStatus,
} from "@/generated/prisma/enums";

export interface CustomerOrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  createdAt: Date;
}

export interface CustomerSummary {
  totalOrders: number;
  totalSpend: number;
  lastPurchase: Date | null;
}

export interface CustomerDetailsResponse {
  customer: Customer;

  summary: CustomerSummary;

  recentOrders: CustomerOrderSummary[];
}