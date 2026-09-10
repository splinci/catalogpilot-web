"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { orderApi } from "@/domains/order/api/order.api";
import type { CreateOrderDto } from "@/domains/order/dto/createOrder.dto";

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateOrderDto) =>
      orderApi.createOrder(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
    },
  });

  return {
    createOrder: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}