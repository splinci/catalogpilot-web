export interface AlertEvent {
  alertId: string;
  fingerprint: string;
  severity: string;
  message: string;
  suppressed: boolean;
  timestamp: string;
}

const alertHistory = new Map<string, number>();

export function dispatchAlertWithSuppression(
  fingerprint: string,
  severity: string,
  message: string,
  suppressionWindowMs = 60000
): AlertEvent {
  const lastDispatched = alertHistory.get(fingerprint);
  const now = Date.now();

  let suppressed = false;
  if (lastDispatched && now - lastDispatched < suppressionWindowMs) {
    suppressed = true;
  } else {
    alertHistory.set(fingerprint, now);
  }

  return {
    alertId: `alt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    fingerprint,
    severity,
    message,
    suppressed,
    timestamp: new Date().toISOString(),
  };
}

export function clearAlertHistory(): void {
  alertHistory.clear();
}
