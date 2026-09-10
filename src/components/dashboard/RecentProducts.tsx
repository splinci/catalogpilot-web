"use client";

import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RecentProduct } from "@/types/dashboard";

interface RecentProductsProps {
  products: RecentProduct[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export default function RecentProducts({
  products,
  loading,
  error,
}: RecentProductsProps) {
  if (loading) {
    return (
      <Card title="Recent Products">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-10 rounded bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Recent Products">
        <div className="text-red-600">
          Unable to load recent products.
        </div>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card
        title="Recent Products"
        action={
          <Button size="sm">
            + New Product
          </Button>
        }
      >
        <div className="py-8 text-center">
          <div className="text-4xl mb-3">📦</div>
          <h3 className="text-lg font-semibold">
            No products found
          </h3>
          <p className="text-gray-500 mt-2">
            Create your first product to get started.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Recent Products"
      action={
        <Button variant="outline" size="sm">
          View All
        </Button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-3">SKU</th>
              <th className="py-3">Product</th>
              <th className="py-3">Brand</th>
              <th className="py-3">Stock</th>
              <th className="py-3">Status</th>
              <th className="py-3">Created</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b last:border-0"
              >
                <td className="py-3">{product.sku}</td>

                <td className="py-3 font-medium">
                  {product.name}
                </td>

                <td className="py-3">
                  {product.brand ?? "-"}
                </td>

                <td className="py-3">
                  {product.currentStock}
                </td>

                <td className="py-3">
                  {product.status}
                </td>

                <td className="py-3">
                  {new Date(product.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}