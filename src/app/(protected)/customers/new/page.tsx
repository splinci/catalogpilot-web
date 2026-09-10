"use client";

import Link from "next/link";
import { ArrowLeft, UserPlus, Save } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { useState } from "react";
import { CustomerForm } from "@/features/customers/CustomerForm";
import { useRouter } from "next/navigation";
import { useCreateCustomer } from "@/domains/customer/hooks/useCreateCustomer";

export default function CreateCustomerPage() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const router = useRouter();

  const { createCustomer, isCreating } = useCreateCustomer();

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Customer Name is required.");
      return;
    }

    try {
      await createCustomer({
        name,
        company,
        email,
        phone,
        taxNumber,
      });

      alert("Customer created successfully!");
      router.push("/customers");
    } catch (error) {
      console.error(error);
      alert("Failed to create customer.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHero
        title="Register New Customer"
        description="Add a new customer account, tax registration details, and contact profile to Atlas ERP."
        actions={
          <Link href="/customers">
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Customers</span>
            </button>
          </Link>
        }
      />

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <CustomerForm
          name={name}
          company={company}
          email={email}
          phone={phone}
          taxNumber={taxNumber}
          onNameChange={setName}
          onCompanyChange={setCompany}
          onEmailChange={setEmail}
          onPhoneChange={setPhone}
          onTaxNumberChange={setTaxNumber}
        />

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Link href="/customers">
            <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </Link>

          <button
            onClick={handleSubmit}
            disabled={isCreating}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all"
          >
            <Save className="h-4 w-4" />
            <span>{isCreating ? "Saving Customer..." : "Save Customer Profile"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}