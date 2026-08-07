import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { contactFormSchema } from '@/lib/validations/contact.schema';
import { Resend } from 'resend';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { school_slug, name, email, message } = contactFormSchema.parse(body);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: school } = await supabase
      .from('schools')
      .select('email, website_content')
      .eq('slug', school_slug)
      .single();

    const schoolEmail = school?.website_content?.contact_email || school?.email;
    if (!schoolEmail) {
      return NextResponse.json({ error: 'School contact email not configured' }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'NexaForges <noreply@nexaforges.me>',
      to: schoolEmail,
      subject: `New message from ${name} via school website`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p>${message}</p>`,
    });

    return NextResponse.json({ success: true, message: 'Message sent successfully' });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
