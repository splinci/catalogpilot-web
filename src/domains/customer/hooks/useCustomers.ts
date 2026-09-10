"use client";

import { useQuery } from "@tanstack/react-query";

import { getCustomers } from "@/services/customer/customer.api";

import type { Customer } from "@/domains/customer/types/customer";
import type { CustomerFilters } from "@/domains/customer/types/customerFilters";

export function useCustomers(
  filters: CustomerFilters = {}
) {
  const query = useQuery<Customer[]>({
    queryKey: ["customers", filters],
    queryFn: () => getCustomers(filters),
  });

  return {
    customers: query.data ?? [],
    loading: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
}