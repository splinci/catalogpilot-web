"use client";

import { use } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { useCustomer } from "@/features/crm/hooks/useCustomer";
import { useCustomerActivity } from "@/features/crm/hooks/useCustomerActivity";
import { CustomerStatusBadge } from "@/features/crm/components/CustomerStatusBadge";
import { ArrowLeft, ShoppingBag, Clock, Mail, Phone, MapPin, User } from "lucide-react";
import Link from "next/link";

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { customer, loading, error } = useCustomer(resolvedParams.id);
  const { timeline, loading: timelineLoading } = useCustomerActivity(resolvedParams.id);

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading customer profile...</div>;
  }

  if (error || !customer) {
    return (
      <div className="p-12 text-center">
        <h3 className="text-lg font-bold text-red-600">Customer Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">{error || "The requested customer profile does not exist."}</p>
        <Link href="/customers" className="inline-flex items-center gap-2 mt-4 text-xs font-bold text-blue-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/customers" className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <PageHero
          title={customer.legalName}
          description={`Customer Code: ${customer.customerCode} | Account Created: ${new Date(customer.createdAt).toLocaleDateString()}`}
          actions={<CustomerStatusBadge creditHold={customer.creditHold} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Account Overview</h3>
            <div className="space-y-3 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{customer.phone}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t">
              <p className="text-[11px] font-semibold uppercase text-slate-400">Credit Limit</p>
              <h4 className="text-xl font-black text-slate-900 mt-0.5">
                ${Number(customer.creditLimit).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </h4>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <User className="h-4 w-4" /> Contacts ({customer.contacts?.length || 0})
            </h3>
            {!customer.contacts || customer.contacts.length === 0 ? (
              <p className="text-xs text-slate-400">No contacts registered.</p>
            ) : (
              <div className="space-y-2">
                {customer.contacts.map((contact) => (
                  <div key={contact.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs">
                    <p className="font-bold text-slate-900">{contact.name}</p>
                    <p className="text-slate-500">{contact.role || "Contact"}</p>
                    {contact.email && <p className="text-slate-400">{contact.email}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Clock className="h-4 w-4" /> Unified Activity Timeline
            </h3>
            {timelineLoading ? (
              <div className="text-xs text-slate-400 p-4 text-center">Loading activity timeline...</div>
            ) : timeline.length === 0 ? (
              <div className="text-xs text-slate-400 p-4 text-center border rounded-xl bg-slate-50">
                No recent order or quotation activity logged for this customer account.
              </div>
            ) : (
              <div className="space-y-3">
                {timeline.map((item) => (
                  <div key={item.id} className="p-3.5 border border-slate-200 rounded-xl bg-white space-y-1 hover:border-blue-300 transition-colors">
                    <div className="flex justify-between text-xs font-bold text-slate-900">
                      <span className="flex items-center gap-1.5 text-blue-600">
                        <ShoppingBag className="h-4 w-4" /> {item.title}
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
      </div>
    </div>
  );
}