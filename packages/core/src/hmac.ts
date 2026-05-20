import crypto from "node:crypto";

export function hmacSha256Base64(payload: Buffer | string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64");
}

export function hmacSha256Hex(payload: Buffer | string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function timingSafeEqualText(left: string | undefined, right: string): boolean {
  if (!left) return false;
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyShopifyWebhook(rawBody: Buffer, signature: string | undefined, secret: string): boolean {
  return timingSafeEqualText(signature, hmacSha256Base64(rawBody, secret));
}

export function verifyGenericHexWebhook(rawBody: Buffer, signature: string | undefined, secret: string): boolean {
  return timingSafeEqualText(signature, hmacSha256Hex(rawBody, secret));
}
