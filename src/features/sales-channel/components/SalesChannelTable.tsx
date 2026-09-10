"use client";

import { SquarePen, Trash2 } from "lucide-react";

import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/common/StatusBadge";

import type { SalesChannelModel } from "@/domains/sales-channel/types/sales-channel";

interface SalesChannelTableProps {
  channels: SalesChannelModel[];

  onEdit: (channel: SalesChannelModel) => void;
  onDelete: (channel: SalesChannelModel) => void;
}

export function SalesChannelTable({
  channels,
  onEdit,
  onDelete,
}: SalesChannelTableProps) {
  return (
    <DataTable>
      <thead>
        <tr className="border-b border-slate-200 bg-slate-100">
          <th className="px-4 py-4 text-left text-sm font-semibold">
            Code
          </th>

          <th className="px-4 py-4 text-left text-sm font-semibold">
            Name
          </th>

          <th className="px-4 py-4 text-left text-sm font-semibold">
            Type
          </th>

          <th className="px-4 py-4 text-left text-sm font-semibold">
            Country
          </th>

          <th className="px-4 py-4 text-center text-sm font-semibold">
            Status
          </th>

          <th className="px-4 py-4 text-center text-sm font-semibold">
            Actions
          </th>
        </tr>
      </thead>

      <tbody>
        {channels.map((channel) => (
          <tr
            key={channel.id}
            className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <td className="px-4 py-5 font-semibold">
              {channel.code}
            </td>

            <td className="px-4 py-5">
              {channel.name}
            </td>

            <td className="px-4 py-5">
              {channel.type}
            </td>

            <td className="px-4 py-5">
              {channel.country ?? "-"}
            </td>

            <td className="px-4 py-5 text-center">
              <StatusBadge
                status={
                  channel.enabled
                    ? "ACTIVE"
                    : "INACTIVE"
                }
              />
            </td>

            <td className="px-4 py-5">
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  title="Edit Sales Channel"
                  onClick={() => onEdit(channel)}
                >
                  <SquarePen className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon-sm"
                  title="Delete Sales Channel"
                  onClick={() => onDelete(channel)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
}