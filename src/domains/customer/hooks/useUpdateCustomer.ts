"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateCustomer } from "@/services/customer/customer.api";

import type { UpdateCustomerDto } from "@/domains/customer/dto/updateCustomer.dto";

interface UpdateCustomerPayload {
  id: string;
  data: UpdateCustomerDto;
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateCustomerPayload) =>
      updateCustomer(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });

      queryClient.invalidateQueries({
        queryKey: ["customers", variables.id],
      });
    },
  });
}