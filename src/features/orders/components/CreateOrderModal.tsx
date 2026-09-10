"use client";

import { useState, useEffect } from "react";
import { CreateSalesOrderInput } from "@/types/order.dto";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSalesOrderInput) => Promise<void>;
}

export function CreateOrderModal({ isOpen, onClose, onSubmit }: Props) {
  const [customers, setCustomers] = useState<{ id: string; customerCode: string; legalName: string }[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [products, setProducts] = useState<{ id: string; sku: string; title: string; price: number }[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [qty, setQty] = useState(1);
  const [unitPrice, setUnitPrice] = useState(99.0);
  const [lines, setLines] = useState<{ productId: string; productTitle: string; quantity: number; unitPrice: number }[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [custRes, prodRes] = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/products"),
        ]);
        const custJson = await custRes.json();
        const prodJson = await prodRes.json();

        const custItems = custJson.data || [];
        setCustomers(custItems.map((c: any) => ({ id: c.id, customerCode: c.customerCode || "", legalName: c.legalName || c.name || "Customer" })));
        if (custItems.length > 0) setSelectedCustomerId(custItems[0].id);

        const prodItems = Array.isArray(prodJson) ? prodJson : (prodJson.data ?? prodJson.products ?? []);
        setProducts(prodItems.map((p: any) => ({ id: p.id, sku: p.sku || "", title: p.title || p.name || "Product", price: Number(p.price || 99) })));
        if (prodItems.length > 0) {
          setSelectedProductId(prodItems[0].id);
          setUnitPrice(Number(prodItems[0].price || 99));
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (isOpen) loadData();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddLine = () => {
    if (!selectedProductId) return;
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    setLines((prev) => [
      ...prev,
      {
        productId: prod.id,
        productTitle: `${prod.title} (${prod.sku})`,
        quantity: qty,
        unitPrice,
      },
    ]);
  };

  const handleFormSubmit = async () => {
    setError("");
    if (!selectedCustomerId) {
      setError("Please select a customer.");
      return;
    }

    let finalLines = [...lines];
    if (finalLines.length === 0 && selectedProductId) {
      const prod = products.find((p) => p.id === selectedProductId);
      if (prod) {
        finalLines.push({
          productId: prod.id,
          productTitle: `${prod.title} (${prod.sku})`,
          quantity: qty,
          unitPrice,
        });
      }
    }

    if (finalLines.length === 0) {
      setError("At least one line item is required.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        customerId: selectedCustomerId,
        currency: "USD",
        lines: finalLines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          discountAmount: 0,
          taxAmount: 0,
        })),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create sales order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl space-y-5">
        <h2 className="text-xl font-bold text-slate-900">Create Sales Order</h2>

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Select Customer</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-800"
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.legalName} ({c.customerCode})
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Add Order Line Item</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const p = products.find((x) => x.id === e.target.value);
                    if (p) setUnitPrice(p.price);
                  }}
                  className="w-full rounded-lg border bg-white p-2 text-sm font-semibold text-slate-800"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="w-full rounded-lg border bg-white p-2 text-sm font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Unit Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  className="w-full rounded-lg border bg-white p-2 text-sm font-semibold text-slate-800"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddLine}
              className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
            >
              + Add Item Line
            </button>
          </div>

          {lines.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-500">Order Lines ({lines.length})</h4>
              <div className="divide-y border rounded-xl overflow-hidden bg-white">
                {lines.map((l, idx) => (
                  <div key={idx} className="flex justify-between p-2.5 text-xs font-semibold text-slate-800">
                    <span>{l.productTitle}</span>
                    <span className="font-bold">{l.quantity} units @ ${l.unitPrice.toFixed(2)}/ea</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={handleFormSubmit}
            disabled={submitting}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Creating Order..." : "Create Sales Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
