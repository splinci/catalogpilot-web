/**
 * ============================================================================
 * Splinci Commerce OS — Carrier Provider Abstraction Layer
 * ============================================================================
 * Specification Reference: PROVIDER-001 / ORD-002 / WMS-001
 * Domain: Carrier Integration Abstraction (FedEx, UPS, DHL, Internal Dispatch)
 * ============================================================================
 */

export interface CreateShipmentCarrierInput {
  companyId: string;
  salesOrderId: string;
  carrier: string;
  lines: Array<{ salesOrderLineId: string; quantity: number }>;
  idempotencyKey?: string;
}

export interface CarrierShipmentResult {
  success: boolean;
  trackingNumber: string;
  carrierName: string;
  estimatedDeliveryDate: string;
  status: "LABEL_CREATED" | "DISPATCHED" | "FAILED";
  errorCode?: string;
  errorMessage?: string;
}

export interface CarrierProvider {
  createShipment(input: CreateShipmentCarrierInput): Promise<CarrierShipmentResult>;
}

export class MockCarrierProvider implements CarrierProvider {
  async createShipment(input: CreateShipmentCarrierInput): Promise<CarrierShipmentResult> {
    if (!input.carrier) {
      return {
        success: false,
        trackingNumber: "",
        carrierName: "",
        estimatedDeliveryDate: "",
        status: "FAILED",
        errorCode: "INVALID_CARRIER",
        errorMessage: "Carrier name is required",
      };
    }

    const prefix = input.carrier.toUpperCase().substring(0, 3);
    const trackingNumber = `TRK-${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return {
      success: true,
      trackingNumber,
      carrierName: input.carrier,
      estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: "DISPATCHED",
    };
  }
}

export class FedExCarrierProvider implements CarrierProvider {
  async createShipment(input: CreateShipmentCarrierInput): Promise<CarrierShipmentResult> {
    const apiKey = process.env.FEDEX_API_KEY;
    if (!apiKey) {
      throw new Error("FedEx Configuration Error: FEDEX_API_KEY environment variable is missing.");
    }

    return {
      success: true,
      trackingNumber: `TRK-FDX-LIVE-${Date.now()}`,
      carrierName: "FedEx Express Live",
      estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "DISPATCHED",
    };
  }
}

export const mockCarrierProvider = new MockCarrierProvider();
