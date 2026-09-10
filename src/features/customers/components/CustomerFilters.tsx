"use client";

import Input from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CustomerStatus } from "@/generated/prisma/enums";

interface CustomerFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;

  status: CustomerStatus | "ALL";
  onStatusChange: (
    value: CustomerStatus | "ALL"
  ) => void;
}

export function CustomerFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: CustomerFiltersProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 md:flex-row md:items-center">
      <Input
        placeholder="Search by customer code, name, company, email or phone..."
        value={search}
        onChange={(e) =>
          onSearchChange(e.target.value)
        }
        className="w-full md:w-[420px]"
      />

      <Select
        value={status}
        onValueChange={(value) =>
          onStatusChange(
            value as CustomerStatus | "ALL"
          )
        }
      >
        <SelectTrigger className="w-full md:w-52">
          <SelectValue placeholder="Customer Status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="ALL">
            All Status
          </SelectItem>

          <SelectItem
            value={CustomerStatus.ACTIVE}
          >
            Active
          </SelectItem>

          <SelectItem
            value={CustomerStatus.INACTIVE}
          >
            Inactive
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}