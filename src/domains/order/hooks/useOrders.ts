import { useQuery } from "@tanstack/react-query";

import { orderApi } from "../api/order.api";

import type {
  OrderFilters,
  OrdersResponse,
} from "../types/order";

export function useOrders(
  filters: OrderFilters = {}
) {
  return useQuery<OrdersResponse>({
    queryKey: ["orders", filters],
    queryFn: () => orderApi.getOrders(filters),
  });
}