import type { CreateCategoryDto } from "@/domains/category/dto/create-category.dto";
import type { UpdateCategoryDto } from "@/domains/category/dto/update-category.dto";

import type { Category } from "@/domains/category/types/category";

type UpdateCategoryPayload = Omit<UpdateCategoryDto, "id">;

const BASE_URL = "/api/categories";

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

export async function getCategories() {
  return request<Category[]>(BASE_URL);
}

export async function createCategory(
  dto: CreateCategoryDto
) {
  return request<Category>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function updateCategory(
  id: string,
  dto: UpdateCategoryPayload
) {
  return request<Category>(
    `${BASE_URL}/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(dto),
    }
  );
}

export async function archiveCategory(
  id: string
) {
  return request<void>(
    `${BASE_URL}/${id}/archive`,
    {
      method: "PATCH",
    }
  );
}