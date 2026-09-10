"use client";

import { useEffect, useState } from "react";

import { getCustomerDetails } from "@/services/customer/customer.api";

import type { CustomerDetailsResponse } from "@/domains/customer/types/customerDetails";

export function useCustomerDetails(id: string) {
  const [data, setData] =
    useState<CustomerDetailsResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<unknown>(null);

  useEffect(() => {
    async function loadCustomer() {
      try {
        setLoading(true);

        const customer =
          await getCustomerDetails(id);

        setData(customer);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    loadCustomer();
  }, [id]);

  return {
    data,
    loading,
    error,
  };
}