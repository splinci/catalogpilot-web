"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { orderApi } from "@/domains/order/api/order.api";
import type { UpdateOrderDto } from "@/domains/order/dto/updateOrder.dto";

export function useUpdateOrderMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateOrderDto;
    }) => orderApi.updateOrder(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });

      queryClient.invalidateQueries({
        queryKey: ["order", variables.id],
      });
    },
  });

  return {
    updateOrder: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}