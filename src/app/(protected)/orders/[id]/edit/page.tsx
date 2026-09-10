"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { Customer } from "@/domains/customer/types/customer";

import { useCreateOrder } from "@/features/orders/create-order/hooks/useCreateOrder";

import { useOrder } from "@/domains/order/hooks/useOrder";

import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

import { CustomerSection } from "@/features/orders/create-order/CustomerSection";
import { ProductSection } from "@/features/orders/create-order/ProductSection";
import { OrderItemsTable } from "@/features/orders/create-order/OrderItemsTable";

import { useUpdateOrderMutation } from "@/features/orders/create-order/hooks/useUpdateOrderMutation";

export default function EditOrderPage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: order,
    isLoading,
    error,
  } = useOrder(id);

  const [selectedCustomer, setSelectedCustomer] =
  useState<Customer | null>(null);

const [productSearch, setProductSearch] = useState("");

const {
  items,
  subtotal,
  setOrderItems,
  handleAddProduct,
  handleQuantityChange,
  handleRemoveProduct,
} = useCreateOrder();

const [initialized, setInitialized] = useState(false);

const router = useRouter();

const { updateOrder, isUpdating } =
  useUpdateOrderMutation();

useEffect(() => {
  if (!order || initialized) return;

  setSelectedCustomer(order.customer);

  setOrderItems(
    order.items.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }))
  );
  setInitialized(true);
}, [order, setOrderItems]);

  if (isLoading) {
    return (
      
        <div>Loading order...</div>
      
    );
  }

  if (error) {
    return (
      
        <div>Failed to load order.</div>
      
    );
  }
  
  if (!order) {
    return (
      
        <div>Order not found.</div>
      
    );
  }

  const handleSave = async () => {
    if (!selectedCustomer) {
      alert("Please select a customer.");
      return;
    }
  
    if (items.length === 0) {
      alert("Please add at least one product.");
      return;
    }
  
    try {
      await updateOrder({
        id,
        data: {
          customerId: selectedCustomer.id,
  
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
  
          tax: 0,
          shipping: 0,
          discount: 0,
        },
      });
  
      router.push(`/orders/${id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to update order.");
    }
  };

  return (
    
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">
          Edit Order
        </h1>

        <div className="grid gap-6 lg:grid-cols-3">
  {/* Left Side */}
  <div className="space-y-6 lg:col-span-2">
    <CustomerSection
      selectedCustomer={selectedCustomer}
      onCustomerSelect={setSelectedCustomer}
    />

    <ProductSection
      search={productSearch}
      onSearchChange={setProductSearch}
      onProductSelect={handleAddProduct}
    />

    <OrderItemsTable
      items={items}
      onQuantityChange={handleQuantityChange}
      onRemove={handleRemoveProduct}
    />
  </div>

  {/* Right Side */}
  <div className="space-y-6">
    <Card title="Order Summary">
      <div className="space-y-3">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>Tax</span>
          <span>₹0.00</span>
        </div>

        <div className="flex justify-between">
          <span>Shipping</span>
          <span>₹0.00</span>
        </div>

        <div className="flex justify-between">
          <span>Discount</span>
          <span>₹0.00</span>
        </div>

        <hr />

        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
      </div>
    </Card>

    <div className="flex justify-end gap-3">
  <Button
    variant="outline"
    onClick={() => router.back()}
  >
    Cancel
  </Button>

  <Button
    onClick={handleSave}
    disabled={isUpdating}
  >
    {isUpdating
      ? "Saving..."
      : "Save Changes"}
  </Button>
</div>
  </div>
</div>
      </div>
    
  );
}