export type IntegrationProvider =
  | "SHOPIFY"
  | "AMAZON"
  | "EBAY"
  | "SAP"
  | "NETSUITE"
  | "DYNAMICS"
  | "QUICKBOOKS"
  | "WAREHOUSE_SYSTEM"
  | "CUSTOM_API";

export type IntegrationStatus = "CONNECTED" | "DISCONNECTED" | "SYNC_ERROR" | "PAUSED";

export interface IntegrationConnection {
  id: string;
  companyId: string;
  provider: IntegrationProvider;
  name: string;
  status: IntegrationStatus;
  credentialsEncrypted: string;
  lastSuccessfulSync?: string;
  lastFailedSync?: string;
  createdAt: string;
}

const connections = new Map<string, IntegrationConnection>();

export function registerConnection(
  companyId: string,
  provider: IntegrationProvider,
  name: string,
  rawCredentials: Record<string, any>
): IntegrationConnection {
  const connection: IntegrationConnection = {
    id: `conn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    companyId,
    provider,
    name,
    status: "CONNECTED",
    credentialsEncrypted: Buffer.from(JSON.stringify(rawCredentials)).toString("base64"),
    createdAt: new Date().toISOString(),
  };

  connections.set(connection.id, connection);
  return connection;
}

export function getTenantConnections(companyId: string): IntegrationConnection[] {
  return Array.from(connections.values()).filter((c) => c.companyId === companyId);
}

export function getTenantConnectionById(id: string, companyId: string): IntegrationConnection | null {
  const conn = connections.get(id);
  if (!conn || conn.companyId !== companyId) return null;
  return conn;
}

export function clearRegistryStore(): void {
  connections.clear();
}
