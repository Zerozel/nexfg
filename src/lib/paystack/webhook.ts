import crypto from 'crypto';

export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET!;
  const expected = crypto
    .createHmac('sha512', secret)
    .update(payload)
    .digest('hex');
  return signature === expected;
}
