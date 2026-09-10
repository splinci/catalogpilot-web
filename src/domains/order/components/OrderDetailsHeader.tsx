"use client";

import { CheckCircle2 } from "lucide-react";
import { useUpdateOrderStatusMutation } from "@/domains/order/hooks/useUpdateOrderStatusMutation";

import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Pencil,
  Printer,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { OrderStatusBadge } from "./OrderStatusBadge";
import { PaymentStatusBadge } from "./PaymentStatusBadge";

import { useCancelOrderMutation } from "@/domains/order/hooks/useCancelOrderMutation";
import { OrderStatus } from "@/generated/prisma/enums";

import type { OrderDetails } from "@/domains/order/types/order";

import { useReturnOrderMutation } from "@/domains/order/hooks/useReturnOrderMutation";

interface OrderDetailsHeaderProps {
  order: OrderDetails;
}

export default function OrderDetailsHeader({
  order,
}: OrderDetailsHeaderProps) {
  const router = useRouter();

  const {
    cancelOrder,
    isCancelling,
  } = useCancelOrderMutation();

  const editableStatuses: OrderStatus[] = [
    OrderStatus.DRAFT,
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
    OrderStatus.PACKED,
  ];
  
  const canEdit = editableStatuses.includes(order.status);

  const canCancel =
    order.status === OrderStatus.DRAFT ||
    order.status === OrderStatus.CONFIRMED ||
    order.status === OrderStatus.PROCESSING ||
    order.status === OrderStatus.PACKED;

  const {
      updateStatus,
      isUpdating,
    } = useUpdateOrderStatusMutation();

  const {
      returnOrder,
      isReturning,
    } = useReturnOrderMutation();

    const canReturn =
    order.status === OrderStatus.DELIVERED;

  async function handleCancelOrder() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?\n\nThis will restore inventory."
    );

    if (!confirmed) {
      return;
    }

    try {
      await cancelOrder(order.id);

      router.refresh();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to cancel order."
      );
    }
  }

  const ORDER_WORKFLOW: Record<
  OrderStatus,
  {
    next?: OrderStatus;
    label?: string;
    canEdit: boolean;
    canCancel: boolean;
    canReturn: boolean;
  }
> = {
  [OrderStatus.DRAFT]: {
    next: OrderStatus.CONFIRMED,
    label: "Confirm Order",
    canEdit: true,
    canCancel: true,
    canReturn: false,
  },

  [OrderStatus.CONFIRMED]: {
    next: OrderStatus.PROCESSING,
    label: "Start Processing",
    canEdit: true,
    canCancel: true,
    canReturn: false,
  },

  [OrderStatus.PROCESSING]: {
    next: OrderStatus.PACKED,
    label: "Mark as Packed",
    canEdit: true,
    canCancel: true,
    canReturn: false,
  },

  [OrderStatus.PACKED]: {
    next: OrderStatus.SHIPPED,
    label: "Mark as Shipped",
    canEdit: true,
    canCancel: true,
    canReturn: false,
  },

  [OrderStatus.SHIPPED]: {
    next: OrderStatus.DELIVERED,
    label: "Mark as Delivered",
    canEdit: false,
    canCancel: false,
    canReturn: false,
  },

  [OrderStatus.DELIVERED]: {
    canEdit: false,
    canCancel: false,
    canReturn: true,
  },

  [OrderStatus.CANCELLED]: {
    canEdit: false,
    canCancel: false,
    canReturn: false,
  },

  [OrderStatus.RETURNED]: {
    canEdit: false,
    canCancel: false,
    canReturn: false,
  },
};

const workflow = ORDER_WORKFLOW[order.status];

const nextAction = workflow.next
  ? {
      status: workflow.next,
      label: workflow.label!,
    }
  : null;

  async function handleStatusUpdate() {
    if (!nextAction) return;
  
    try {
      await updateStatus({
        id: order.id,
        status: nextAction.status,
      });
  
      router.refresh();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update status."
      );
    }
  }

  async function handleReturnOrder() {
    const confirmed = window.confirm(
      "Are you sure you want to return this order?\n\nThis will restore inventory."
    );
  
    if (!confirmed) {
      return;
    }
  
    try {
      await returnOrder(order.id);
  
      router.refresh();
    } catch (error) {
      console.error(error);
  
      alert(
        error instanceof Error
          ? error.message
          : "Failed to return order."
      );
    }
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <Button
          variant="ghost"
          className="mb-2 px-0"
          onClick={() => router.push("/orders")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>

        <h1 className="text-3xl font-bold">
          {order.orderNumber}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge
            status={order.paymentStatus}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() => window.print()}
      >
      <Printer className="mr-2 h-4 w-4" />
        Print
      </Button>

        {canCancel && (
          <Button
            variant="destructive"
            onClick={handleCancelOrder}
            disabled={isCancelling}
          >
            <XCircle className="mr-2 h-4 w-4" />
            {isCancelling
              ? "Cancelling..."
              : "Cancel Order"}
          </Button>
        )}

{nextAction && (
  <Button
    variant="default"
    onClick={handleStatusUpdate}
    disabled={isUpdating}
  >
    <CheckCircle2 className="mr-2 h-4 w-4" />
    {isUpdating
      ? "Updating..."
      : nextAction.label}
  </Button>
)}

{canReturn && (
  <Button
    variant="outline"
    onClick={handleReturnOrder}
    disabled={isReturning}
  >
    <CheckCircle2 className="mr-2 h-4 w-4" />
    {isReturning
      ? "Returning..."
      : "Return Order"}
  </Button>
)}

        {canEdit && (
          <Button
            onClick={() =>
              router.push(`/orders/${order.id}/edit`)
            }
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Order
          </Button>
        )}
      </div>
    </div>
  );
}