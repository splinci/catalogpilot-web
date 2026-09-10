"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createBrand,
  deleteBrand,
  getBrands,
  updateBrand,
} from "../api/brand.api";

export function useBrands() {
  const queryClient = useQueryClient();

  const brandsQuery = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  });

  const createMutation = useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["brands"],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateBrand>[1];
    }) => updateBrand(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["brands"],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["brands"],
      });
    },
  });

  return {
    brands: brandsQuery.data ?? [],
    loading: brandsQuery.isPending,
    error: brandsQuery.error,

    createBrand: createMutation.mutateAsync,
    updateBrand: updateMutation.mutateAsync,
    deleteBrand: deleteMutation.mutateAsync,

    refresh: brandsQuery.refetch,
  };
}