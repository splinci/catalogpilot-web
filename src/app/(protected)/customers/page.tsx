"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { useCustomers, CustomerAggregate } from "@/features/customers/hooks/useCustomers";
import { CustomerKPIs } from "@/features/customers/components/CustomerKPIs";
import { CustomerTable } from "@/features/customers/components/CustomerTable";
import { CreateCustomerModal } from "@/features/customers/components/CreateCustomerModal";
import { CustomerDetailsDrawer } from "@/features/customers/components/CustomerDetailsDrawer";

export default function CustomersPage() {
  const { customers, loading, refetch, createCustomer, archiveCustomer } = useCustomers();

  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerAggregate | null>(null);

  const safeCustomers = Array.isArray(customers) ? customers : [];
  const filteredCustomers = safeCustomers.filter(
    (c) =>
      c.legalName?.toLowerCase().includes(search.toLowerCase()) ||
      c.customerCode?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleArchive = async (customer: CustomerAggregate) => {
    if (confirm(`Are you sure you want to archive customer account '${customer.legalName}'?`)) {
      await archiveCustomer(customer.id);
      await refetch();
    }
  };

  return (
    <div className="space-y-6">
      <PageHero
        title="Customer Relationship Management (CRM)"
        description="Manage enterprise customer master accounts, contacts, shipping & billing addresses, credit limits, and purchase history timelines."
        actions={
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Customer</span>
          </button>
        }
      />

      <CustomerKPIs customers={customers} loading={loading} />

      <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers by code, legal name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border-0 py-2 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <CustomerTable
          customers={filteredCustomers}
          loading={loading}
          onSelectCustomer={(cust) => setSelectedCustomer(cust)}
          onArchiveCustomer={handleArchive}
        />
      </div>

      <CreateCustomerModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={createCustomer}
      />

      <CustomerDetailsDrawer
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
}