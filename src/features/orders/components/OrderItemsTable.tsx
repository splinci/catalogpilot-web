import Card from "@/components/ui/Card";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    id: string;
    sku: string;
    name: string;
  };
}

interface Props {
  items: OrderItem[];
}

export default function OrderItemsTable({
  items,
}: Props) {
  return (
    <Card title="Order Items">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b">
            <tr className="text-left">
              <th className="py-2">SKU</th>
              <th className="py-2">Product</th>
              <th className="py-2 text-right">
                Qty
              </th>
              <th className="py-2 text-right">
                Unit Price
              </th>
              <th className="py-2 text-right">
                Total
              </th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b"
              >
                <td className="py-3">
                  {item.product.sku}
                </td>

                <td>{item.product.name}</td>

                <td className="text-right">
                  {item.quantity}
                </td>

                <td className="text-right">
                  ₹
                  {item.unitPrice.toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                    }
                  )}
                </td>

                <td className="text-right font-medium">
                ₹
                {Number(item.totalPrice).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    }
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}