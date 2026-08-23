import crypto from 'crypto';

/**
 * Verify a Paystack webhook signature.
 *
 * Paystack signs every webhook body with an HMAC SHA512 keyed on your
 * **secret key** (`PAYSTACK_SECRET_KEY`) — there is no separate "webhook
 * secret". The resulting hex digest is sent in the `x-paystack-signature`
 * header. See https://paystack.com/docs/payments/webhooks/#verify-event-origin
 *
 * The `secret` argument is optional so callers can inject it (e.g. for tests);
 * it defaults to `PAYSTACK_SECRET_KEY`.
 *
 * @returns `true` when the signature matches, otherwise `false`.
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string = process.env.PAYSTACK_SECRET_KEY ?? ''
): boolean {
  if (!secret || !signature) return false;

  const expected = crypto
    .createHmac('sha512', secret)
    .update(payload)
    .digest('hex');

  // Constant-time comparison to avoid leaking timing information. The buffers
  // must be equal length for timingSafeEqual, so guard on length first.
  const signatureBuffer = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  if (signatureBuffer.length !== expectedBuffer.length) return false;

  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
}
