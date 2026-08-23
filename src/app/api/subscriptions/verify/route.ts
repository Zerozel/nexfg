import { NextRequest, NextResponse } from 'next/server';
import { requireSchoolAdmin } from '@/lib/supabase/school-admin-auth';
import { verifyTransaction } from '@/lib/paystack/client';

/**
 * Confirms the outcome of a Paystack transaction for the returning user.
 *
 * The webhook remains the authoritative path that actually activates the
 * subscription (it can't be spoofed and fires even if the user closes the tab).
 * This endpoint only reports status so the client-side success/failure pages
 * can route correctly — it deliberately does NOT mutate the subscription.
 */
export async function GET(request: NextRequest) {
  try {
    const guard = await requireSchoolAdmin();
    if (!guard.authorized) return guard.response;
    const { supabase, schoolId } = guard;

    const reference = request.nextUrl.searchParams.get('reference');
    if (!reference) {
      return NextResponse.json(
        { error: 'Missing reference' },
        { status: 400 }
      );
    }

    // Ensure the reference belongs to this school before asking Paystack about
    // it — prevents one school probing another school's payment references.
    const { data: payment } = await supabase
      .from('subscription_payments')
      .select('id')
      .eq('reference', reference)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    const result = await verifyTransaction(reference);
    const success = result.status && result.data?.status === 'success';

    return NextResponse.json({
      success,
      status: result.data?.status ?? 'unknown',
      reference,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
