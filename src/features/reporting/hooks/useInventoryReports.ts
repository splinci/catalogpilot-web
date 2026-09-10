/**
 * ============================================================================
 * M10-004 — useInventoryReports Hook
 * Consumes GET /api/reporting/inventory
 * ============================================================================
 */
"use client";

import { useState, useEffect, useCallback } from "react";

export interface InventoryData {
  valuation: {
    totalCostValue: number;
    totalRetailValue: number;
    totalUnits: number;
    skuCount: number;
    topValueProducts: Array<{ sku: string; productName: string; quantityOnHand: number; unitCost: number; totalValue: number }>;
  };
  movement: Array<{ date: string; receipts: number; shipments: number; adjustments: number; net: number }>;
  warehouseKPIs: Array<{ warehouseName: string; totalLocations: number; occupiedLocations: number; utilizationRate: number; inventoryValue: number }>;
  turnover: { turnoverRatio: number; daysOnHand: number; avgInventory: number; cogs: number };
  reorderCandidates: Array<{ sku: string; productName: string; quantityOnHand: number; reorderPoint: number; suggestedOrderQty: number }>;
  slowMoving: Array<{ sku: string; productName: string; quantityOnHand: number; daysSinceLastSale: number; valueAtRisk: number }>;
  fastMoving: Array<{ sku: string; productName: string; unitsSold: number; turnoverRate: number; daysOfStock: number }>;
}

export interface UseInventoryReportsResult {
  data: InventoryData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useInventoryReports(): UseInventoryReportsResult {
  const [data, setData] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/reporting/inventory", { cache: "no-store" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Inventory report fetch failed");
      setData(json.data);
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}
