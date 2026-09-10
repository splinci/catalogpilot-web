import Card from "@/components/ui/Card";

interface Props {
  subtotal: number;
  tax: number;
  discount: number;
  shipping: number;
  total: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(value));
}

export default function OrderSummary({
  subtotal,
  tax,
  discount,
  shipping,
  total,
}: Props) {
  return (
    <Card title="Order Summary">
      <div className="max-w-sm ml-auto space-y-3">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between">
          <span>Tax</span>
          <span>{formatCurrency(tax)}</span>
        </div>

        <div className="flex justify-between">
          <span>Discount</span>
          <span>{formatCurrency(discount)}</span>
        </div>

        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{formatCurrency(shipping)}</span>
        </div>

        <hr />

        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </Card>
  );
}