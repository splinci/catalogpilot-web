"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, CheckCircle2, DollarSign } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { CustomerSection } from "@/features/orders/create-order/CustomerSection";
import { ProductSection } from "@/features/orders/create-order/ProductSection";
import { OrderItemsTable } from "@/features/orders/create-order/OrderItemsTable";
import { useCreateOrder } from "@/features/orders/create-order/hooks/useCreateOrder";
import type { Customer } from "@/domains/customer/types/customer";
import { useCreateOrderMutation } from "@/features/orders/create-order/hooks/useCreateOrderMutation";

export default function CreateOrderPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [productSearch, setProductSearch] = useState("");

  const {
    items,
    subtotal,
    handleAddProduct,
    handleQuantityChange,
    handleRemoveProduct,
  } = useCreateOrder();

  const { createOrder, isCreating } = useCreateOrderMutation();

  const handleSubmit = async () => {
    if (!selectedCustomer) return;

    try {
      await createOrder({
        customerId: selectedCustomer.id,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        tax: 0,
        shipping: 0,
        discount: 0,
        notes: "",
      });

      alert("Sales Order created successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to create order.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHero
        title="Create Sales Order"
        description="Select customer, add products to cart, and issue new multi-channel sales order."
        actions={
          <Link href="/orders">
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sales Orders</span>
            </button>
          </Link>
        }
      />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Left Column: Customer & Product Pickers */}
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

        {/* Right Column: Financial Order Summary */}
        <div className="space-y-6 sticky top-20">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-indigo-600" />
              <span>Financial Summary</span>
            </h3>

            <div className="space-y-3 text-xs font-semibold text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({items.length} items)</span>
                <span className="text-slate-900 font-bold">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Tax (0%)</span>
                <span>$0.00</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping & Dispatch</span>
                <span>$0.00</span>
              </div>

              <div className="flex justify-between">
                <span>Promotional Discount</span>
                <span>$0.00</span>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-black text-slate-900">
                <span>Total Order Amount</span>
                <span className="text-indigo-600">${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isCreating || !selectedCustomer || items.length === 0}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isCreating ? "Processing Order..." : "Confirm & Issue Sales Order"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}