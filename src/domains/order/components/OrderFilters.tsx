"use client";

import Input from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type {
  OrderStatus,
  PaymentStatus,
} from "@/generated/prisma/enums";

interface OrderFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;

  status: OrderStatus | "ALL";
  onStatusChange: (
    value: OrderStatus | "ALL"
  ) => void;

  paymentStatus: PaymentStatus | "ALL";
  onPaymentStatusChange: (
    value: PaymentStatus | "ALL"
  ) => void;
}

export function OrderFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  paymentStatus,
  onPaymentStatusChange,
}: OrderFiltersProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 md:flex-row md:items-center">
      <Input
        placeholder="Search by Order # or Customer..."
        value={search}
        onChange={(e) =>
          onSearchChange(e.target.value)
        }
        className="w-full md:w-[420px]"
      />

      <Select
        value={status}
        onValueChange={(value) =>
          onStatusChange(value as OrderStatus | "ALL")
        }
      >
        <SelectTrigger className="w-full md:w-52">
          <SelectValue placeholder="Order Status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="ALL">All Status</SelectItem>
          <SelectItem value="DRAFT">Draft</SelectItem>
          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
          <SelectItem value="PROCESSING">Processing</SelectItem>
          <SelectItem value="PACKED">Packed</SelectItem>
          <SelectItem value="SHIPPED">Shipped</SelectItem>
          <SelectItem value="DELIVERED">Delivered</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={paymentStatus}
        onValueChange={(value) =>
          onPaymentStatusChange(
            value as PaymentStatus | "ALL"
          )
        }
      >
        <SelectTrigger className="w-full md:w-52">
          <SelectValue placeholder="Payment Status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="ALL">All Payments</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="PAID">Paid</SelectItem>
          <SelectItem value="PARTIALLY_PAID">
            Partially Paid
          </SelectItem>
          <SelectItem value="REFUNDED">Refunded</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}