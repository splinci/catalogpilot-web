export interface CreateOrderItemDto {
  productId: string;
  quantity: number;
}

export interface CreateOrderDto {
  customerId: string;

  items: CreateOrderItemDto[];

  tax?: number;
  discount?: number;
  shipping?: number;

  notes?: string;
}