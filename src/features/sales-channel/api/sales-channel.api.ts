import type { CreateSalesChannelDto } from "@/domains/sales-channel/dto/create-sales-channel.dto";
import type { UpdateSalesChannelDto } from "@/domains/sales-channel/dto/update-sales-channel.dto";
import type { SalesChannelModel } from "@/domains/sales-channel/types/sales-channel";

export async function getSalesChannels(): Promise<SalesChannelModel[]> {
  const response = await fetch("/api/sales-channels");

  if (!response.ok) {
    throw new Error("Failed to load sales channels.");
  }

  return response.json();
}

export async function createSalesChannel(
  data: CreateSalesChannelDto
): Promise<SalesChannelModel> {
  const response = await fetch("/api/sales-channels", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

console.error("API Error:", error);

throw new Error(
  error?.message ??
  error?.error ??
  "Failed to create sales channel."
);
  }

  return response.json();
}

export async function updateSalesChannel(
  id: string,
  data: UpdateSalesChannelDto
): Promise<SalesChannelModel> {
  const response = await fetch(`/api/sales-channels/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update sales channel.");
  }

  return response.json();
}

export async function deleteSalesChannel(
  id: string
): Promise<void> {
  const response = await fetch(`/api/sales-channels/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
  
    console.error("DELETE Error:", error);
  
    throw new Error(
      error?.message ??
      error?.error ??
      "Failed to delete sales channel."
    );
  }
}