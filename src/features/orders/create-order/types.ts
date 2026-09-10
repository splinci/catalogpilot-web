export interface OrderProduct {
  id: string;
  sku: string;
  name: string;
  sellingPrice: number;
}

export interface OrderItem {
  product: OrderProduct;
  quantity: number;
  unitPrice: number;
}