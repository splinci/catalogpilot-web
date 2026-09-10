import Badge from "@/components/ui/Badge";
import { PaymentStatus } from "@/generated/prisma/enums";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

const variants: Record<
  PaymentStatus,
  "default" | "info" | "success" | "warning" | "danger"
> = {
  PENDING: "warning",
  PAID: "success",
  PARTIALLY_PAID: "info",
  REFUNDED: "danger",
};

export function PaymentStatusBadge({
  status,
}: PaymentStatusBadgeProps) {
  return (
    <Badge variant={variants[status]}>
      {status.replaceAll("_", " ")}
    </Badge>
  );
}