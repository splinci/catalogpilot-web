import type { CreateBrandDto } from "@/domains/brand/dto/create-brand.dto";
import type { UpdateBrandDto } from "@/domains/brand/dto/update-brand.dto";
import type { Brand } from "@/domains/brand/types/brand";

export async function getBrands(): Promise<Brand[]> {
  const response = await fetch("/api/brands");

  if (!response.ok) {
    throw new Error("Failed to load brands.");
  }

  return response.json();
}

export async function createBrand(
  data: CreateBrandDto
): Promise<Brand> {
  const response = await fetch("/api/brands", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create brand.");
  }

  return response.json();
}

export async function updateBrand(
  id: string,
  data: UpdateBrandDto
): Promise<Brand> {
  const response = await fetch(`/api/brands/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update brand.");
  }

  return response.json();
}

export async function deleteBrand(
  id: string
): Promise<void> {
  const response = await fetch(`/api/brands/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete brand.");
  }
}