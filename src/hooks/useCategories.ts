"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getCategories,
  createCategory as createCategoryApi,
  updateCategory as updateCategoryApi,
  archiveCategory as archiveCategoryApi,
} from "@/services/category/category.api";

import type { Category } from "@/domains/category/types/category";
import type { CreateCategoryDto } from "@/domains/category/dto/create-category.dto";
import type { UpdateCategoryDto } from "@/domains/category/dto/update-category.dto";

const QUERY_KEY = ["categories"];

export function useCategories() {
  const queryClient = useQueryClient();

  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Category[]>({
    queryKey: QUERY_KEY,
    queryFn: getCategories,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateCategoryDto) =>
      createCategoryApi(dto),

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
      data: UpdateCategoryDto;
    }) => updateCategoryApi(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEY,
      });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) =>
      archiveCategoryApi(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEY,
      });
    },
  });

  return {
    categories: data,

    loading: isLoading,

    error:
      error instanceof Error
        ? error.message
        : null,

    refetch,

    createCategory:
      createMutation.mutateAsync,

    updateCategory:
      updateMutation.mutateAsync,

    archiveCategory:
      archiveMutation.mutateAsync,

    creating:
      createMutation.isPending,

    updating:
      updateMutation.isPending,

    archiving:
      archiveMutation.isPending,
  };
}