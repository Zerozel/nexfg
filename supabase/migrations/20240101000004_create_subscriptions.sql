-- Payments & Subscriptions (Section 7)
-- Adds the `subscription_payments` ledger and ensures the `schools` table has the
-- subscription/billing columns the app + Paystack webhook read and write.
--
-- The `schools` table itself is created in an earlier (Section-1) migration; the
-- subscription columns may or may not already exist there, so every ALTER below
-- is guarded with IF NOT EXISTS to stay idempotent against existing databases.

-- ---------------------------------------------------------------------------
-- 1. schools: subscription + Paystack columns
-- ---------------------------------------------------------------------------
ALTER TABLE public.schools
    ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'trial',
    ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'free',
    ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
    -- Persisted from Paystack so lifecycle events (subscription.disable /
    -- subscription.expire) can be matched back to a school reliably instead of
    -- by the mutable `schools.email` column.
    ADD COLUMN IF NOT EXISTS paystack_customer_code TEXT,
    ADD COLUMN IF NOT EXISTS paystack_subscription_code TEXT;

CREATE INDEX IF NOT EXISTS idx_schools_paystack_customer
    ON public.schools(paystack_customer_code);
CREATE INDEX IF NOT EXISTS idx_schools_paystack_subscription
    ON public.schools(paystack_subscription_code);

-- ---------------------------------------------------------------------------
-- 2. subscription_payments: one row per Paystack transaction
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscription_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL,
    reference TEXT NOT NULL,             -- our generated Paystack reference
    amount INTEGER NOT NULL,             -- whole Naira (NGN), not kobo
    currency TEXT NOT NULL DEFAULT 'NGN',
    plan TEXT NOT NULL,                  -- starter | growth | premium
    status TEXT NOT NULL DEFAULT 'pending', -- pending | success | failed
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- reference is globally unique: enables idempotent webhook processing and
    -- safe upserts/lookups by reference.
    CONSTRAINT unique_subscription_payment_reference UNIQUE (reference),

    CONSTRAINT fk_subscription_payment_school
        FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_subscription_payments_school
    ON public.subscription_payments(school_id);

-- ---------------------------------------------------------------------------
-- 3. RLS (mirror the multi-tenant pattern used across the schema)
-- ---------------------------------------------------------------------------
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- Members of a school may read their own payment history.
CREATE POLICY "Users can view payments from their school"
    ON public.subscription_payments
    FOR SELECT
    USING (school_id = (auth.jwt() -> 'app_metadata' ->> 'school_id')::UUID);

-- School admins record a pending payment when they start checkout. The webhook
-- flips it to success/failed using the service-role key (which bypasses RLS),
-- so no UPDATE policy is required for regular users.
CREATE POLICY "Users can insert payments for their school"
    ON public.subscription_payments
    FOR INSERT
    WITH CHECK (school_id = (auth.jwt() -> 'app_metadata' ->> 'school_id')::UUID);

-- ---------------------------------------------------------------------------
-- 4. Trigger: auto-inject school_id from the JWT and maintain timestamps
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.subscription_payments_trigger_handler()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.school_id IS NULL THEN
        NEW.school_id := (auth.jwt() -> 'app_metadata' ->> 'school_id')::UUID;
    END IF;

    NEW.updated_at = NOW();
    IF TG_OP = 'INSERT' THEN
        NEW.created_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_subscription_payments_before_insert
    BEFORE INSERT ON public.subscription_payments
    FOR EACH ROW
    EXECUTE FUNCTION public.subscription_payments_trigger_handler();

CREATE TRIGGER trigger_subscription_payments_before_update
    BEFORE UPDATE ON public.subscription_payments
    FOR EACH ROW
    EXECUTE FUNCTION public.subscription_payments_trigger_handler();
