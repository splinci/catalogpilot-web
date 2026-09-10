"use client";

import { useCustomerDetails } from "../hooks/useCustomerDetails";
import { CustomerAggregate } from "../hooks/useCustomers";
import { X, Clock, ShoppingBag, ShieldAlert, CheckCircle2 } from "lucide-react";

interface Props {
  customer: CustomerAggregate | null;
  onClose: () => void;
}

export function CustomerDetailsDrawer({ customer, onClose }: Props) {
  const { timeline, loading } = useCustomerDetails(customer?.id);

  if (!customer) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl border-l border-slate-200 p-6 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              {customer.customerCode}
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">{customer.legalName}</h2>
            <p className="text-xs text-slate-500">{customer.email}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Credit Limit</p>
            <h4 className="text-lg font-black text-slate-900">${Number(customer.creditLimit).toLocaleString("en-US", { minimumFractionDigits: 2 })}</h4>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Credit Standing</p>
            {customer.creditHold ? (
              <span className="inline-flex items-center gap-1 mt-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700 border border-red-200">
                <ShieldAlert className="h-3.5 w-3.5" /> Credit Hold
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 mt-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" /> Good Standing
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Clock className="h-4 w-4" /> Activity Timeline & History
          </h3>
          {loading ? (
            <div className="text-xs text-slate-400 p-4 text-center">Loading timeline activity...</div>
          ) : timeline.length === 0 ? (
            <div className="text-xs text-slate-400 p-4 text-center border rounded-xl bg-slate-50">
              No recent order or quotation activity logged for this customer account.
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {timeline.map((item) => (
                <div key={item.id} className="p-3 border border-slate-200 rounded-xl bg-white space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-900">
                    <span className="flex items-center gap-1 text-blue-600">
                      <ShoppingBag className="h-3.5 w-3.5" /> {item.title}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t flex justify-end">
        <button
          onClick={onClose}
          className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
        >
          Close Panel
        </button>
      </div>
    </div>
  );
}
