export interface PrivilegedElevationRecord {
  elevationId: string;
  companyId: string;
  actorUserId: string;
  requestedRole: string;
  reason: string;
  expiresAt: string;
  revoked: boolean;
  createdAt: string;
}

const elevations = new Map<string, PrivilegedElevationRecord>();

export function requestPrivilegedElevation(
  companyId: string,
  userId: string,
  requestedRole: string,
  reason: string,
  durationMinutes = 60
): PrivilegedElevationRecord {
  const record: PrivilegedElevationRecord = {
    elevationId: `elev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    companyId,
    actorUserId: userId,
    requestedRole,
    reason,
    expiresAt: new Date(Date.now() + durationMinutes * 60 * 1000).toISOString(),
    revoked: false,
    createdAt: new Date().toISOString(),
  };

  elevations.set(record.elevationId, record);
  return record;
}

export function validatePrivilegedElevation(elevationId: string, companyId: string): boolean {
  const record = elevations.get(elevationId);
  if (!record || record.companyId !== companyId || record.revoked) return false;

  if (new Date(record.expiresAt) < new Date()) {
    return false; // Expired
  }

  return true;
}

export function revokePrivilegedElevation(elevationId: string): void {
  const record = elevations.get(elevationId);
  if (record) {
    record.revoked = true;
  }
}

export function clearElevationsStore(): void {
  elevations.clear();
}
