"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getProducts,
  createProduct as createProductApi,
  updateProduct as updateProductApi,
  archiveProduct as archiveProductApi,
} from "@/services/product/product.api";

import type { Product } from "@/domains/product/types/product";
import type { CreateProductDto } from "@/domains/product/dto/createProduct.dto";
import type { UpdateProductDto } from "@/domains/product/dto/updateProduct.dto";

const QUERY_KEY = ["products"];

export function useProducts() {
  const queryClient = useQueryClient();

  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Product[]>({
    queryKey: QUERY_KEY,
    queryFn: () => getProducts(),
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateProductDto) =>
      createProductApi(dto),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEY,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Omit<UpdateProductDto, "id">;
    }) => updateProductApi(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEY,
      });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) =>
      archiveProductApi(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEY,
      });
    },
  });

  return {
    products: data,

    loading: isLoading,

    error:
      error instanceof Error
        ? error.message
        : null,

    refetch,

    createProduct:
      createMutation.mutateAsync,

    updateProduct:
      updateMutation.mutateAsync,

    archiveProduct:
      archiveMutation.mutateAsync,

    creating:
      createMutation.isPending,

    updating:
      updateMutation.isPending,

    archiving:
      archiveMutation.isPending,
  };
}