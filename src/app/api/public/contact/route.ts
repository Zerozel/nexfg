import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { contactFormSchema } from '@/lib/validations/contact.schema';
import { Resend } from 'resend';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { school_slug, name, email, message } =
      contactFormSchema.parse(body);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: school } = await supabase
      .from('schools')
      .select('id, name, email, website_content')
      .eq('slug', school_slug)
      .maybeSingle();

    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    const schoolEmail =
      school.website_content?.contact_email || school.email;
    if (!schoolEmail) {
      return NextResponse.json(
        { error: 'School contact email not configured' },
        { status: 400 }
      );
    }

    // Send the email via Resend.
    // `reply_to` ensures the school's reply goes back to the parent, not to
    // noreply@nexaforges.me.
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'NexaForge School Contact <noreply@nexaforges.me>',
      to: schoolEmail,
      replyTo: email,
      subject: `New message from ${name} via your school website`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1a1a1a; margin: 0 0 20px; font-size: 20px;">New Enquiry via Your Website</h2>

          <div style="background: #faf8f3; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <p style="margin: 0 0 8px; font-size: 13px; color: #8a8a8a; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">From</p>
            <p style="margin: 0; font-size: 15px; color: #1a1a1a;"><strong>${name}</strong></p>
            <p style="margin: 4px 0 0; font-size: 14px; color: #4a4a4a;">
              <a href="mailto:${email}" style="color: #c9991a; text-decoration: none;">${email}</a>
            </p>
          </div>

          <div style="border-top: 1px solid #e8e4dc; padding-top: 20px;">
            <p style="margin: 0 0 10px; font-size: 13px; color: #8a8a8a; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Message</p>
            <p style="margin: 0; font-size: 15px; color: #4a4a4a; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>

          <p style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e8e4dc; font-size: 12px; color: #8a8a8a;">
            Sent from ${school.name}'s public website, powered by <strong style="color: #c9991a;">NexaForges</strong>.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Contact form error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
