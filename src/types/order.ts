export enum OrderStatus {
  DRAFT = "DRAFT",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  PACKED = "PACKED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  REFUNDED = "REFUNDED",
}

export interface OrderItem {
  id: string;

  orderId: string;

  productId: string;

  quantity: number;

  unitPrice: number;

  totalPrice: number;

  product?: {
    id: string;
    sku: string;
    name: string;
    sellingPrice: number;
  };
}

export interface Order {
  id: string;

  orderNumber: string;

  customerId: string;

  customer?: {
    id: string;
    customerCode: string;
    name: string;
    email: string | null;
    phone: string | null;
  };

  status: OrderStatus;

  paymentStatus: PaymentStatus;

  subtotal: number;

  tax: number;

  discount: number;

  shipping: number;

  total: number;

  notes: string | null;

  items: OrderItem[];

  createdAt: Date;

  updatedAt: Date;
}

export interface OrderFilters {
  page?: number;

  limit?: number;

  search?: string;

  customerId?: string;

  status?: OrderStatus;

  paymentStatus?: PaymentStatus;

  fromDate?: Date;

  toDate?: Date;
}

export interface OrderPagination {
  total: number;

  page: number;

  limit: number;

  totalPages: number;
}

export interface OrderListResponse {
  data: Order[];

  pagination: OrderPagination;
}

export interface OrderStatistics {
  totalOrders: number;

  draftOrders: number;

  confirmedOrders: number;

  processingOrders: number;

  packedOrders: number;

  shippedOrders: number;

  deliveredOrders: number;

  cancelledOrders: number;

  returnedOrders: number;

  totalRevenue: number;

  averageOrderValue: number;
}