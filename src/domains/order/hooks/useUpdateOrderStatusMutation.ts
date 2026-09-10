import {
    useMutation,
    useQueryClient,
  } from "@tanstack/react-query";
  
  import { OrderStatus } from "@/generated/prisma/enums";
  import { orderApi } from "../api/order.api";
  
  export function useUpdateOrderStatusMutation() {
    const queryClient = useQueryClient();
  
    const mutation = useMutation({
      mutationFn: ({
        id,
        status,
      }: {
        id: string;
        status: OrderStatus;
      }) =>
        orderApi.updateStatus(
          id,
          status
        ),
  
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: ["orders"],
        });
  
        queryClient.invalidateQueries({
          queryKey: [
            "order",
            variables.id,
          ],
        });
      },
    });
  
    return {
      updateStatus:
        mutation.mutateAsync,
  
      isUpdating:
        mutation.isPending,
    };
  }