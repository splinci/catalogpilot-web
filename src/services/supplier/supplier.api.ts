import type { CreateSupplierDto } from "@/domains/supplier/dto/create-supplier.dto";
import type { UpdateSupplierDto } from "@/domains/supplier/dto/update-supplier.dto";
import type { Supplier } from "@/domains/supplier/types/supplier";

const BASE_URL = "/api/suppliers";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.message ?? "Something went wrong."
    );
  }

  return response.json();
}

export async function getSuppliers(): Promise<Supplier[]> {
  const response = await fetch(BASE_URL, {
    cache: "no-store",
  });

  return handleResponse(response);
}

export async function createSupplier(
  dto: CreateSupplierDto
): Promise<Supplier> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
  });

  return handleResponse(response);
}

export async function updateSupplier(
  id: string,
  dto: UpdateSupplierDto
): Promise<Supplier> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
  });

  return handleResponse(response);
}

export async function archiveSupplier(
  id: string
): Promise<void> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  await handleResponse(response);
}