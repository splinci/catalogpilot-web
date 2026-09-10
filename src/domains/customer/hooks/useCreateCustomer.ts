"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createCustomer } from "@/services/customer/customer.api";
import type { CreateCustomerDto } from "@/domains/customer/dto/createCustomer.dto";

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateCustomerDto) =>
      createCustomer(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });
    },
  });

  return {
    createCustomer: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}