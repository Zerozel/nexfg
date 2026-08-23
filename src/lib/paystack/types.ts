export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    reference: string;
    amount: number;
    currency: string;
    status: string;
    customer?: {
      email: string;
      customer_code?: string;
    };
    metadata?: PaystackEventMetadata;
  };
}

export interface PaystackEventMetadata {
  school_id?: string;
  plan?: string;
  upgrade?: boolean;
}

export interface PaystackWebhookEvent {
  event: string;
  data: {
    reference: string;
    amount: number;
    currency: string;
    status: string;
    customer: {
      email: string;
      // Paystack's stable identifier for the customer. Persisted so lifecycle
      // events (disable/expire), which don't carry our metadata, can be matched
      // back to a school.
      customer_code?: string;
    };
    metadata?: PaystackEventMetadata;
    plan?: { id: number; name: string; plan_code?: string };
    // Present on subscription.* events.
    subscription_code?: string;
    // Present on charge.success when the transaction created a subscription.
    subscription?: { subscription_code: string; status: string };
  };
}
