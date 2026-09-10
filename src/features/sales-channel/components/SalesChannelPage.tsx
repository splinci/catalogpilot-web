"use client";

import { useState } from "react";

import StatCard from "@/components/common/StatCard";

import { AdminPage } from "@/features/administration/components/AdminPage";
import { AdminToolbar } from "@/features/administration/components/AdminToolbar";
import { AdminStats } from "@/features/administration/components/AdminStats";

import { useSalesChannels } from "../hooks/useSalesChannels";
import { SalesChannelDialog } from "./SalesChannelDialog";
import { SalesChannelTable } from "./SalesChannelTable";

import type { SalesChannelModel } from "@/domains/sales-channel/types/sales-channel";

export function SalesChannelPage() {
  const {
    channels,
    deleteSalesChannel,
  } = useSalesChannels();

  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);

  const [selectedChannel, setSelectedChannel] =
    useState<SalesChannelModel | undefined>();

  // Statistics
  const total = channels.length;

  const enabled = channels.filter(
    (channel) => channel.enabled
  ).length;

  const disabled = channels.filter(
    (channel) => !channel.enabled
  ).length;

  const marketplaces = channels.filter(
    (channel) => channel.type === "MARKETPLACE"
  ).length;

  // Search
  const filteredChannels = channels.filter((channel) => {
    const keyword = search.toLowerCase();

    return (
      channel.name.toLowerCase().includes(keyword) ||
      channel.code.toLowerCase().includes(keyword) ||
      (channel.country ?? "")
        .toLowerCase()
        .includes(keyword)
    );
  });

  return (
    <>
      <AdminPage
        title="Sales Channels"
        description="Manage your marketplace and store integrations."
        toolbar={
          <AdminToolbar
            search={search}
            onSearchChange={setSearch}
            addLabel="+ Add Sales Channel"
            onAdd={() => {
              setSelectedChannel(undefined);
              setOpen(true);
            }}
          />
        }
      >
  <AdminStats
  stats={[
    {
      title: "Total",
      value: total,
    },
    {
      title: "Enabled",
      value: enabled,
    },
    {
      title: "Disabled",
      value: disabled,
    },
    {
      title: "Marketplace",
      value: marketplaces,
    },
  ]}
/>

        <SalesChannelTable
          channels={filteredChannels}
          onEdit={(channel) => {
            setSelectedChannel(channel);
            setOpen(true);
          }}
          onDelete={async (channel) => {
            const confirmed = window.confirm(
              `Delete "${channel.name}"?\n\nThis action cannot be undone.`
            );

            if (!confirmed) {
              return;
            }

            try {
              await deleteSalesChannel(channel.id);
            } catch (error) {
              console.error(error);
              alert("Failed to delete sales channel.");
            }
          }}
        />
      </AdminPage>

      <SalesChannelDialog
        open={open}
        channel={selectedChannel}
        onClose={() => {
          setOpen(false);
          setSelectedChannel(undefined);
        }}
      />
    </>
  );
}