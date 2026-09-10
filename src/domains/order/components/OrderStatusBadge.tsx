import Badge from "@/components/ui/Badge";
import { OrderStatus } from "@/generated/prisma/enums";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const variants: Record<
  OrderStatus,
  "default" | "info" | "success" | "warning" | "danger"
> = {
  DRAFT: "default",
  CONFIRMED: "info",
  PROCESSING: "warning",
  PACKED: "warning",
  SHIPPED: "info",
  DELIVERED: "success",
  CANCELLED: "danger",
  RETURNED: "danger",
};

export function OrderStatusBadge({
  status,
}: OrderStatusBadgeProps) {
  return (
    <Badge variant={variants[status]}>
      {status.replaceAll("_", " ")}
    </Badge>
  );
}