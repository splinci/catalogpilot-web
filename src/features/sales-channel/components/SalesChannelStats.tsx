"use client";

import StatCard from "@/components/common/StatCard";

import { useSalesChannels } from "../hooks/useSalesChannels";

export function SalesChannelStats() {
  const {
    channels,
    deleteSalesChannel,
  } = useSalesChannels();

  const total = channels.length;

  const enabled = channels.filter(
    (channel) => channel.enabled
  ).length;

  const disabled = total - enabled;

  const marketplaces = channels.filter(
    (channel) => channel.type === "MARKETPLACE"
  ).length;

  return (
    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Channels"
        value={total}
        subtitle="Total sales channels"
      />

      <StatCard
        title="Enabled"
        value={enabled}
        subtitle="Available channels"
      />

      <StatCard
        title="Marketplace"
        value={marketplaces}
        subtitle="Marketplace integrations"
      />

      <StatCard
        title="Disabled"
        value={disabled}
        subtitle="Inactive channels"
      />
    </div>
  );
}