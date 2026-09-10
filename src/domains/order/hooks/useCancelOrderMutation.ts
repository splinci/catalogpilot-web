import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "../api/order.api";

export function useCancelOrderMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) =>
      orderApi.cancelOrder(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });

      queryClient.invalidateQueries({
        queryKey: ["order", id],
      });
    },
  });

  return {
    cancelOrder: mutation.mutateAsync,
    isCancelling: mutation.isPending,
  };
}