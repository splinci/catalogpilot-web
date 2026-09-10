"use client";

import { useQuery } from "@tanstack/react-query";

import { getProducts } from "@/services/product/product.api";

import type { Product } from "@/domains/product/types/product";

export function useProductSearch(
  search: string
) {
  const {
    data = [],
    isLoading,
    error,
  } = useQuery<Product[]>({
    queryKey: [
      "products",
      "search",
      search,
    ],

    queryFn: () =>
      getProducts({
        search,
      }),

    enabled:
      search.trim().length >= 2,
  });

  return {
    products: data,

    loading: isLoading,

    error:
      error instanceof Error
        ? error.message
        : null,
  };
}