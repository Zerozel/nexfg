export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackWebhookEvent {
  event: string;
  data: {
    reference: string;
    amount: number;
    currency: string;
    status: string;
    customer: { email: string };
    metadata?: { school_id?: string; plan?: string };
    plan?: { id: number; name: string };
    subscription?: { subscription_code: string; status: string };
  };
}
