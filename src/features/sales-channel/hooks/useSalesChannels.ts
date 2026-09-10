"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createSalesChannel,
  deleteSalesChannel,
  getSalesChannels,
  updateSalesChannel,
} from "../api/sales-channel.api";

export function useSalesChannels() {
  const queryClient = useQueryClient();

  const channelsQuery = useQuery({
    queryKey: ["sales-channels"],
    queryFn: getSalesChannels,
  });

  const createMutation = useMutation({
    mutationFn: createSalesChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sales-channels"],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateSalesChannel>[1];
    }) => updateSalesChannel(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sales-channels"],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSalesChannel,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sales-channels"],
      });
    },
  });

  return {
    channels: channelsQuery.data ?? [],
    loading: channelsQuery.isPending,
    error: channelsQuery.error,

    createSalesChannel: createMutation.mutateAsync,
    updateSalesChannel: updateMutation.mutateAsync,
    deleteSalesChannel: deleteMutation.mutateAsync,

    refresh: channelsQuery.refetch,
  };
}