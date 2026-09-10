"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";

import { CustomerForm } from "@/features/customers/CustomerForm";

import { useCustomer } from "@/domains/customer/hooks/useCustomer";
import { useUpdateCustomer } from "@/domains/customer/hooks/useUpdateCustomer";

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const {
    data: customer,
    isLoading,
    error,
  } = useCustomer(id);

  const { mutateAsync: updateCustomer, isPending } =
    useUpdateCustomer();

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [taxNumber, setTaxNumber] = useState("");

  useEffect(() => {
    if (!customer) return;

    setName(customer.name ?? "");
    setCompany(customer.company ?? "");
    setEmail(customer.email ?? "");
    setPhone(customer.phone ?? "");
    setTaxNumber(customer.taxNumber ?? "");
  }, [customer]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Customer Name is required.");
      return;
    }

    try {
      await updateCustomer({
        id,
        data: {
          name,
          company,
          email,
          phone,
          taxNumber,
        },
      });

      alert("Customer updated successfully!");

      router.push("/customers");
    } catch (error) {
      console.error(error);
      alert("Failed to update customer.");
    }
  };

  if (isLoading) {
    return (
      
        <p>Loading customer...</p>
      
    );
  }

  if (error || !customer) {
    return (
      
        <p>Customer not found.</p>
      
    );
  }

  return (
    
      <div className="space-y-6">
        <div>
          <Link
            href="/customers"
            className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Link>

          <h1 className="text-3xl font-bold">
            Edit Customer
          </h1>

          <p className="text-muted-foreground">
            Update customer information.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground">
              Customer Code
            </label>

            <p className="mt-1 text-lg font-semibold">
              {customer.customerCode}
            </p>
          </div>

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
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/customers">
            <Button variant="outline">
              Cancel
            </Button>
          </Link>

          <Button
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending
              ? "Updating..."
              : "Update Customer"}
          </Button>
        </div>
      </div>
    
  );
}