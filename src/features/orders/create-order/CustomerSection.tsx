"use client";

import { useState } from "react";
import {
  Search,
  Building2,
  Mail,
  Phone,
  BadgeCheck,
} from "lucide-react";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

import { useCustomers } from "@/domains/customer/hooks/useCustomers";
import type { Customer } from "@/domains/customer/types/customer";

interface CustomerSectionProps {
  selectedCustomer: Customer | null;
  onCustomerSelect: (customer: Customer | null) => void;
}

export function CustomerSection({
  selectedCustomer,
  onCustomerSelect,
}: CustomerSectionProps) {
  const [search, setSearch] = useState("");

  const { customers, loading } = useCustomers();

  const filteredCustomers = customers.filter((customer) => {
    if (!search.trim()) return false;

    const query = search.toLowerCase();

    return (
      customer.name.toLowerCase().includes(query) ||
      customer.company?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.includes(query)
    );
  });

  const handleSelectCustomer = (customer: Customer) => {
    onCustomerSelect(customer);
    setSearch("");
  };

  const handleChangeCustomer = () => {
    onCustomerSelect(null);
    setSearch("");
  };

  return (
    <Card title="Customer Information">
      <div className="space-y-5">
        {!selectedCustomer && (
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                placeholder="Search customer by name, company, email or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {search && (
              <div className="absolute left-0 right-0 z-20 mt-2 max-h-72 overflow-y-auto rounded-xl border bg-white shadow-xl">
                {loading ? (
                  <div className="p-5 text-sm text-slate-500">
                    Loading customers...
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="p-5 text-sm text-slate-500">
                    No customers found.
                  </div>
                ) : (
                  filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() =>
                        handleSelectCustomer(customer)
                      }
                      className="block w-full border-b px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-slate-50"
                    >
                      <div className="font-semibold">
                        {customer.name}
                      </div>

                      {customer.company && (
                        <div className="text-sm text-slate-500">
                          {customer.company}
                        </div>
                      )}

                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
                        {customer.email && (
                          <span>{customer.email}</span>
                        )}

                        {customer.phone && (
                          <span>{customer.phone}</span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {selectedCustomer ? (
          <div className="rounded-xl border bg-slate-50 p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4 flex-1">
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedCustomer.name}
                  </h3>

                  {selectedCustomer.company && (
                    <p className="text-sm text-slate-500">
                      {selectedCustomer.company}
                    </p>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {selectedCustomer.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-slate-500" />
                      {selectedCustomer.email}
                    </div>
                  )}

                  {selectedCustomer.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-slate-500" />
                      {selectedCustomer.phone}
                    </div>
                  )}

                  {selectedCustomer.company && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-slate-500" />
                      {selectedCustomer.company}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <BadgeCheck className="h-4 w-4 text-green-600" />

                    <span
                      className={`font-medium ${
                        selectedCustomer.status === "ACTIVE"
                          ? "text-green-600"
                          : "text-slate-500"
                      }`}
                    >
                      {selectedCustomer.status}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleChangeCustomer}
              >
                Change Customer
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed bg-slate-50 p-8 text-center">
            <p className="font-medium">
              No customer selected
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Search and select a customer to continue.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}