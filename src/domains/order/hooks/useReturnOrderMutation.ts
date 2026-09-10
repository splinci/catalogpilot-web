import { useMutation, useQueryClient } from "@tanstack/react-query";

import { orderApi } from "../api/order.api";

export function useReturnOrderMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: orderApi.returnOrder,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });

      queryClient.invalidateQueries({
        queryKey: ["order"],
      });
    },
  });

  return {
    returnOrder: mutation.mutateAsync,
    isReturning: mutation.isPending,
  };
}