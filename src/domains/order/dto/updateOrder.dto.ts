import type { CreateOrderItemDto } from "./createOrder.dto";

export interface UpdateOrderDto {
  customerId: string;

  items: CreateOrderItemDto[];

  tax?: number;
  discount?: number;
  shipping?: number;

  notes?: string;
}