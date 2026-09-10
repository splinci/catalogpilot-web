import Card from "@/components/ui/Card";

import type { OrderDetails } from "@/domains/order/types/order";

interface CustomerCardProps {
  order: OrderDetails;
}

export default function CustomerCard({
  order,
}: CustomerCardProps) {
  const customer = order.customer;

  return (
    <Card title="Customer Details">
      <div>
        <p className="text-sm text-muted-foreground">
          Customer Name
        </p>

        <p className="font-semibold">
          {customer?.name ?? "-"}
        </p>
      </div>
    </Card>
  );
}