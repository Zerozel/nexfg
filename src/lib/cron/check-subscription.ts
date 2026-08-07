import { createClient } from '@supabase/supabase-js';

export async function checkExpiredSubscriptions() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const now = new Date().toISOString();

  // Expire subscriptions past their date
  const { data: expired } = await supabase
    .from('schools')
    .select('id')
    .eq('subscription_status', 'active')
    .lt('subscription_expires_at', now);

  if (expired && expired.length > 0) {
    await supabase
      .from('schools')
      .update({ subscription_status: 'expired', updated_at: now })
      .in('id', expired.map((s) => s.id));
  }

  // End trial period (30 days after creation)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: trialsEnded } = await supabase
    .from('schools')
    .select('id')
    .eq('subscription_status', 'trial')
    .lt('created_at', thirtyDaysAgo);

  if (trialsEnded && trialsEnded.length > 0) {
    await supabase
      .from('schools')
      .update({ subscription_status: 'expired', updated_at: now })
      .in('id', trialsEnded.map((s) => s.id));
  }

  return { expired: expired?.length || 0, trialsEnded: trialsEnded?.length || 0 };
}
