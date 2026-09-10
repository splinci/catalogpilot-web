export type DomainEventType =
  | "PRODUCT_CREATED"
  | "PRODUCT_UPDATED"
  | "PRODUCT_PUBLISHED"
  | "INVENTORY_ADJUSTED"
  | "STOCK_TRANSFERRED"
  | "PURCHASE_ORDER_CREATED"
  | "USER_INVITED";

export interface DomainEvent<T = any> {
  eventId: string;
  eventType: DomainEventType;
  companyId: string;
  actorUserId?: string;
  timestamp: string;
  payload: T;
}

type EventHandler<T = any> = (event: DomainEvent<T>) => Promise<void> | void;

class DomainEventBus {
  private handlers = new Map<DomainEventType, EventHandler[]>();
  private eventHistory: DomainEvent[] = [];

  subscribe(eventType: DomainEventType, handler: EventHandler): () => void {
    const list = this.handlers.get(eventType) || [];
    list.push(handler);
    this.handlers.set(eventType, list);

    return () => {
      const current = this.handlers.get(eventType) || [];
      this.handlers.set(
        eventType,
        current.filter((h) => h !== handler)
      );
    };
  }

  async publish<T = any>(
    eventType: DomainEventType,
    companyId: string,
    payload: T,
    actorUserId?: string
  ): Promise<DomainEvent<T>> {
    const event: DomainEvent<T> = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      eventType,
      companyId,
      actorUserId,
      timestamp: new Date().toISOString(),
      payload,
    };

    this.eventHistory.unshift(event);
    if (this.eventHistory.length > 100) {
      this.eventHistory.pop();
    }

    const listeners = this.handlers.get(eventType) || [];
    for (const listener of listeners) {
      try {
        await listener(event);
      } catch (error) {
        console.error(`DomainEventBus handler failed for ${eventType}:`, error);
      }
    }

    return event;
  }

  getEventHistory(companyId?: string): DomainEvent[] {
    if (!companyId) return this.eventHistory;
    return this.eventHistory.filter((evt) => evt.companyId === companyId);
  }

  clear(): void {
    this.handlers.clear();
    this.eventHistory = [];
  }
}

export const domainEventBus = new DomainEventBus();
