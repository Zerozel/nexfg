const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

async function paystackFetch(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${PAYSTACK_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return res.json();
}

export async function initializeTransaction(params: {
  email: string;
  amount: number;
  reference: string;
  metadata?: Record<string, any>;
  callback_url?: string;
}) {
  return paystackFetch('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email: params.email,
      amount: params.amount * 100, // Paystack uses kobo
      reference: params.reference,
      metadata: params.metadata,
      callback_url: params.callback_url,
    }),
  });
}

export async function verifyTransaction(reference: string) {
  return paystackFetch(`/transaction/verify/${reference}`);
}

export async function createPlan(params: {
  name: string;
  amount: number;
  interval: 'monthly' | 'annually';
  description?: string;
}) {
  return paystackFetch('/plan', {
    method: 'POST',
    body: JSON.stringify({
      name: params.name,
      amount: params.amount * 100,
      interval: params.interval,
    }),
  });
}

export async function createSubscription(params: {
  customer: string;
  plan: string;
  start_date?: string;
}) {
  return paystackFetch('/subscription', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function disableSubscription(code: string, token: string) {
  return paystackFetch('/subscription/disable', {
    method: 'POST',
    body: JSON.stringify({ code, token }),
  });
}
