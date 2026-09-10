"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  adjustStock,
  getProductHistory,
} from "@/services/inventory/inventory-transaction.api";

export function useInventoryTransactions(
  productId?: string
) {
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: [
      "inventory-transactions",
      productId,
    ],
    queryFn: () =>
      getProductHistory(productId!),
    enabled: !!productId,
  });

  const adjustMutation = useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: any;
    }) => adjustStock(productId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "inventory-transactions",
        ],
      });
    },
  });

  return {
    history:
      historyQuery.data ?? [],

    loading:
      historyQuery.isPending,

    error:
      historyQuery.error,

    adjustStock:
      adjustMutation.mutateAsync,

    refresh:
      historyQuery.refetch,
  };
}