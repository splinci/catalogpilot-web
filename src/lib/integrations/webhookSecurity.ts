import crypto from "crypto";

export function generateWebhookSignature(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  if (!payload || !signature || !secret) return false;
  const expected = generateWebhookSignature(payload, secret);
  const bufSignature = Buffer.from(signature, "utf-8");
  const bufExpected = Buffer.from(expected, "utf-8");

  if (bufSignature.length !== bufExpected.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufSignature, bufExpected);
}

export function verifyTimestampFreshness(timestampHeader: string | null, maxAgeSeconds = 300): boolean {
  if (!timestampHeader) return false;
  const timestamp = parseInt(timestampHeader, 10);
  if (isNaN(timestamp)) return false;

  const now = Math.floor(Date.now() / 1000);
  return Math.abs(now - timestamp) <= maxAgeSeconds;
}
