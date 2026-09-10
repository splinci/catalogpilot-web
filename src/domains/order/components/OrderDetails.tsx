"use client";

import Card from "@/components/ui/Card";

import OrderItemsTable from "@/features/orders/components/OrderItemsTable";
import OrderSummary from "@/features/orders/components/OrderSummary";
import { OrderStatusBadge } from "@/domains/order/components/OrderStatusBadge";
import { PaymentStatusBadge } from "@/domains/order/components/PaymentStatusBadge";
import OrderDetailsHeader from "./OrderDetailsHeader";
import type { OrderDetails as OrderDetailsType } from "@/domains/order/types/order";
import CustomerCard from "./CustomerCard";

interface OrderDetailsProps {
  order: OrderDetailsType;
}

export default function OrderDetails({
  order,
}: OrderDetailsProps) {
  return (
    <div className="space-y-6">
      <OrderDetailsHeader order={order} />
      <Card title="Order Information">
  <div className="grid gap-6 md:grid-cols-2">
    <div>
      <p className="text-sm text-muted-foreground">
        Order Number
      </p>
      <p className="font-semibold text-lg">
        {order.orderNumber}
      </p>
    </div>

    <div>
      <p className="text-sm text-muted-foreground">
        Customer
      </p>
      <p className="font-semibold">
        {order.customer?.name ?? "-"}
      </p>
    </div>

    <div>
      <p className="text-sm text-muted-foreground">
        Order Status
      </p>

      <div className="mt-1">
        <OrderStatusBadge status={order.status} />
      </div>
    </div>

    <div>
      <p className="text-sm text-muted-foreground">
        Payment Status
      </p>

      <div className="mt-1">
        <PaymentStatusBadge
          status={order.paymentStatus}
        />
      </div>
    </div>
  </div>
</Card>

      <CustomerCard order={order} />
      
      <OrderItemsTable items={order.items} />

      <OrderSummary
        subtotal={Number(order.subtotal)}
        tax={Number(order.tax)}
        discount={Number(order.discount)}
        shipping={Number(order.shipping)}
        total={Number(order.total)}
      />
    </div>
  );
}