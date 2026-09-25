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
  /** 'term' | 'session' */
  billing_cycle?: string;
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
      customer_code?: string;
    };
    metadata?: PaystackEventMetadata;
    plan?: { id: number; name: string; plan_code?: string };
    subscription_code?: string;
    subscription?: { subscription_code: string; status: string };
  };
}
