import type { InventoryStatsDto } from "@/domains/inventory/dto/inventory-stats.dto";

export async function getInventoryStats(): Promise<InventoryStatsDto> {
  const response = await fetch("/api/inventory/stats");

  if (!response.ok) {
    throw new Error("Failed to load inventory statistics.");
  }

  return response.json();
}