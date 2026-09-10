import { useQuery } from "@tanstack/react-query";

import { orderApi } from "../api/order.api";

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => orderApi.getOrder(id),
    enabled: !!id,
  });
}