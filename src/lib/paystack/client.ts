import type {
  PaystackInitializeResponse,
  PaystackVerifyResponse,
} from './types';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

/**
 * Thin wrapper around the Paystack REST API.
 *
 * Surfaces transport/HTTP errors as thrown exceptions so callers don't silently
 * treat a 4xx/5xx as a successful `{ status: false }` payload. Paystack's own
 * business-level failures still come back in the JSON `status` field.
 */
async function paystackFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${PAYSTACK_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (data && (data.message as string)) ||
      `Paystack request failed (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}

export async function initializeTransaction(params: {
  email: string;
  amount: number;
  reference: string;
  metadata?: Record<string, unknown>;
  callback_url?: string;
}): Promise<PaystackInitializeResponse> {
  return paystackFetch<PaystackInitializeResponse>('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email: params.email,
      amount: params.amount * 100, // Paystack expects the amount in kobo
      reference: params.reference,
      metadata: params.metadata,
      callback_url: params.callback_url,
    }),
  });
}

export async function verifyTransaction(
  reference: string
): Promise<PaystackVerifyResponse> {
  return paystackFetch<PaystackVerifyResponse>(
    `/transaction/verify/${reference}`
  );
}
