import type { CreateCustomerDto } from "@/domains/customer/dto/createCustomer.dto";
import type { UpdateCustomerDto } from "@/domains/customer/dto/updateCustomer.dto";
import type { CustomerFilters } from "@/domains/customer/types/customerFilters";
import type { Customer } from "@/domains/customer/types/customer";

import type { CustomerDetailsResponse } from "@/domains/customer/types/customerDetails";

const BASE_URL = "/api/customers";

export async function getCustomers(
  filters: CustomerFilters = {}
): Promise<Customer[]> {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  const response = await fetch(
    `${BASE_URL}?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch customers.");
  }

  return response.json();
}

export async function getCustomer(
  id: string
): Promise<Customer> {
  const response = await fetch(`${BASE_URL}/${id}`);

  if (!response.ok) {
    throw new Error("Customer not found.");
  }

  return response.json();
}

export async function getCustomerDetails(
  id: string
): Promise<CustomerDetailsResponse> {
  const response = await fetch(`${BASE_URL}/${id}/details`);

  if (!response.ok) {
    throw new Error("Customer not found.");
  }

  return response.json();
}

export async function createCustomer(
  data: CreateCustomerDto
): Promise<Customer> {
  const response = await fetch(BASE_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create customer.");
  }

  return response.json();
}

export async function updateCustomer(
  id: string,
  data: UpdateCustomerDto
): Promise<Customer> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update customer.");
  }

  return response.json();
}

export async function deleteCustomer(
  id: string
): Promise<void> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete customer.");
  }
}