"use client";

import { useQuery } from "@tanstack/react-query";

import { getCustomer } from "@/services/customer/customer.api";

import type { Customer } from "@/domains/customer/types/customer";

export function useCustomer(id: string) {
  return useQuery<Customer>({
    queryKey: ["customer", id],
    queryFn: () => getCustomer(id),
    enabled: !!id,
  });
}