import type { CreateProductDto } from "@/domains/product/dto/createProduct.dto";
import type { UpdateProductDto } from "@/domains/product/dto/updateProduct.dto";

import type { Product } from "@/domains/product/types/product";

type UpdateProductPayload = Omit<UpdateProductDto, "id">;

const BASE_URL = "/api/products";

async function request<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.message ?? "Request failed."
    );
  }

  return response.json();
}

export interface GetProductsParams {
  search?: string;
}

export async function getProducts(
  params?: GetProductsParams
) {
  const searchParams = new URLSearchParams();

  if (params?.search) {
    searchParams.set(
      "search",
      params.search
    );
  }

  const url = searchParams.toString()
    ? `${BASE_URL}?${searchParams.toString()}`
    : BASE_URL;

  return request<Product[]>(url);
}

export async function createProduct(
  dto: CreateProductDto
) {
  return request<Product>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function updateProduct(
  id: string,
  dto: UpdateProductPayload
) {
  return request<Product>(
    `${BASE_URL}/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(dto),
    }
  );
}

export async function archiveProduct(
  id: string
) {
  return request<void>(
    `${BASE_URL}/${id}/archive`,
    {
      method: "PATCH",
    }
  );
}