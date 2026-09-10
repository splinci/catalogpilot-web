import { OrderStatus } from "@/generated/prisma/enums";

import type {
  CreateOrderDto,
} from "../dto/createOrder.dto";

import type {
  UpdateOrderDto,
} from "../dto/updateOrder.dto";

import type {
  OrderFilters,
  OrdersResponse,
  OrderDetails,
} from "../types/order";

const BASE_URL = "/api/orders";

function buildQuery(filters: OrderFilters = {}) {
  const params = new URLSearchParams();

  if (filters.search)
    params.set("search", filters.search);

  if (filters.customerId)
    params.set("customerId", filters.customerId);

  if (filters.status)
    params.set("status", filters.status);

  if (filters.paymentStatus)
    params.set(
      "paymentStatus",
      filters.paymentStatus
    );

  if (filters.page)
    params.set("page", filters.page.toString());

  if (filters.limit)
    params.set("limit", filters.limit.toString());

  return params.toString();
}

export const orderApi = {
  async getOrders(
    filters: OrderFilters = {}
  ): Promise<OrdersResponse> {
    const query = buildQuery(filters);

    const response = await fetch(
      query
        ? `${BASE_URL}?${query}`
        : BASE_URL
    );

    if (!response.ok) {
      throw new Error("Failed to fetch orders.");
    }

    return (await response.json()) as OrdersResponse;
  },

  async getOrder(
    id: string
  ): Promise<OrderDetails> {
    const response = await fetch(
      `${BASE_URL}/${id}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch order.");
    }

    return (await response.json()) as OrderDetails;
  },

  async createOrder(
    data: CreateOrderDto
  ): Promise<OrderDetails> {
    const response = await fetch(BASE_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();

      throw new Error(error.message);
    }

    return (await response.json()) as OrderDetails;
  },

async updateOrder(
  id: string,
  data: UpdateOrderDto
): Promise<OrderDetails> {
  const response = await fetch(
    `${BASE_URL}/${id}`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.message || "Failed to update order."
    );
  }

  return (await response.json()) as OrderDetails;
},

cancelOrder: async (id: string) => {
  const response = await fetch(
    `/api/orders/${id}/cancel`,
    {
      method: "PATCH",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to cancel order."
    );
  }

  return response.json();
},

updateStatus: async (
  id: string,
  status: OrderStatus
) => {
  const response = await fetch(
    `/api/orders/${id}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to update order status."
    );
  }

  return response.json();
},

async returnOrder(id: string) {
  const response = await fetch(`/api/orders/${id}/return`, {
    method: "PATCH",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ?? "Failed to return order."
    );
  }

  return data;
},

};