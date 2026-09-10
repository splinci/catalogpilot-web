"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getSuppliers,
  createSupplier as createSupplierApi,
  updateSupplier as updateSupplierApi,
  archiveSupplier as archiveSupplierApi,
} from "@/services/supplier/supplier.api";

import type { Supplier } from "@/domains/supplier/types/supplier";
import type { CreateSupplierDto } from "@/domains/supplier/dto/create-supplier.dto";
import type { UpdateSupplierDto } from "@/domains/supplier/dto/update-supplier.dto";

const QUERY_KEY = ["suppliers"];

export function useSuppliers() {
  const queryClient = useQueryClient();

  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Supplier[]>({
    queryKey: QUERY_KEY,
    queryFn: getSuppliers,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateSupplierDto) =>
      createSupplierApi(dto),

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
      data: UpdateSupplierDto;
    }) =>
      updateSupplierApi(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEY,
      });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) =>
      archiveSupplierApi(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEY,
      });
    },
  });

  return {
    suppliers: data,

    loading: isLoading,

    error:
      error instanceof Error
        ? error.message
        : null,

    refetch,

    createSupplier:
      createMutation.mutateAsync,

    updateSupplier:
      updateMutation.mutateAsync,

    archiveSupplier:
      archiveMutation.mutateAsync,

    creating:
      createMutation.isPending,

    updating:
      updateMutation.isPending,

    archiving:
      archiveMutation.isPending,
  };
}