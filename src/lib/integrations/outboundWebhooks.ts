import { generateWebhookSignature } from "./webhookSecurity";

export type OutboundDeliveryStatus = "PENDING" | "DELIVERED" | "RETRYING" | "DEAD_LETTER";

export interface OutboundWebhookDelivery {
  deliveryId: string;
  endpointUrl: string;
  companyId: string;
  eventType: string;
  payload: any;
  status: OutboundDeliveryStatus;
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: string;
  error?: string;
  createdAt: string;
}

class OutboundWebhookService {
  private deliveries = new Map<string, OutboundWebhookDelivery>();

  createDelivery(
    endpointUrl: string,
    companyId: string,
    eventType: string,
    payload: any,
    maxAttempts = 3
  ): OutboundWebhookDelivery {
    const delivery: OutboundWebhookDelivery = {
      deliveryId: `dlv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      endpointUrl,
      companyId,
      eventType,
      payload,
      status: "PENDING",
      attempts: 0,
      maxAttempts,
      createdAt: new Date().toISOString(),
    };

    this.deliveries.set(delivery.deliveryId, delivery);
    return delivery;
  }

  async executeDelivery(deliveryId: string, webhookSecret: string, fetchFn?: typeof fetch): Promise<OutboundWebhookDelivery> {
    const delivery = this.deliveries.get(deliveryId);
    if (!delivery) {
      throw new Error(`Delivery ${deliveryId} not found`);
    }

    delivery.attempts += 1;
    delivery.lastAttemptAt = new Date().toISOString();
    const payloadStr = JSON.stringify(delivery.payload);
    const signature = generateWebhookSignature(payloadStr, webhookSecret);
    const timestamp = String(Math.floor(Date.now() / 1000));

    try {
      const execFetch = fetchFn || fetch;
      const res = await execFetch(delivery.endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Splinci-Signature": signature,
          "X-Splinci-Timestamp": timestamp,
          "X-Splinci-Event": delivery.eventType,
        },
        body: payloadStr,
      });

      if (res.ok) {
        delivery.status = "DELIVERED";
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err: any) {
      delivery.error = err?.message || "Delivery failed";
      if (delivery.attempts >= delivery.maxAttempts) {
        delivery.status = "DEAD_LETTER";
      } else {
        delivery.status = "RETRYING";
      }
    }

    return delivery;
  }

  getTenantDeliveries(companyId: string): OutboundWebhookDelivery[] {
    return Array.from(this.deliveries.values()).filter((d) => d.companyId === companyId);
  }

  clear(): void {
    this.deliveries.clear();
  }
}

export const outboundWebhookService = new OutboundWebhookService();
