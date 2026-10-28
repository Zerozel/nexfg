// src/app/sla/page.tsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LegalDraftBanner, LegalDraftFooter } from '@/components/legal/LegalDraftBanner';

export const metadata = {
  title: 'Service Level Agreement — NexaForge',
};

export default function SlaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
          Back
        </Link>

        <LegalDraftBanner />

        <article className="bg-white rounded-lg border p-6 sm:p-10 mt-6">
          <header className="border-b pb-6 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Service Level Agreement (SLA)
            </h1>
            <p className="text-sm text-gray-500">
              Version 1.0-draft · Forms part of the{' '}
              <Link href="/terms" className="text-green-700 underline">Terms &amp; Conditions</Link>
            </p>
          </header>

          <div className="prose prose-sm max-w-none text-gray-800 space-y-8">
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. What this document promises</h2>
              <p>Plain answers to: <em>when will you reply, when will you fix it, and what happens if you don&apos;t?</em></p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. Support hours</h2>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="border-b"><td className="p-2 font-semibold w-1/3">Standard</td><td className="p-2">8:00am – 8:00pm WAT, Monday to Saturday</td></tr>
                  <tr className="border-b"><td className="p-2 font-semibold">Sunday</td><td className="p-2">Emergencies only (P1)</td></tr>
                  <tr className="border-b"><td className="p-2 font-semibold"><strong>Examination &amp; results periods</strong></td><td className="p-2"><strong>Extended cover, 7 days a week</strong> — tell us your dates</td></tr>
                  <tr><td className="p-2 font-semibold">Public holidays</td><td className="p-2">Emergencies only (P1)</td></tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. How to reach us</h2>
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border p-2 text-left">Channel</th>
                    <th className="border p-2 text-left">Best for</th>
                    <th className="border p-2 text-left">Target first response</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b"><td className="p-2"><strong>WhatsApp 09045955670</strong></td><td className="p-2">Everything — fastest</td><td className="p-2">4 hours (standard hours)</td></tr>
                  <tr className="border-b"><td className="p-2">Email <a href="mailto:support@nexaforges.me" className="text-green-700 underline">support@nexaforges.me</a></td><td className="p-2">Detail, attachments, formal requests</td><td className="p-2">24 hours</td></tr>
                  <tr><td className="p-2">Phone (P1 only)</td><td className="p-2"><strong>P1 emergencies only</strong></td><td className="p-2">Immediate where available</td></tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">4. Priority levels and response targets</h2>
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border p-2 text-left">Priority</th>
                    <th className="border p-2 text-left">Meaning</th>
                    <th className="border p-2 text-left">First response</th>
                    <th className="border p-2 text-left">Target resolution</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b"><td className="p-2 font-bold">P1 — Critical</td><td className="p-2">No one can work, results blocked, or data may be lost</td><td className="p-2">2 hours (1 hour in results week)</td><td className="p-2">8 working hours</td></tr>
                  <tr className="border-b"><td className="p-2 font-bold">P2 — High</td><td className="p-2">One class or teacher blocked</td><td className="p-2">4 hours</td><td className="p-2">1 working day</td></tr>
                  <tr className="border-b"><td className="p-2 font-bold">P3 — Medium</td><td className="p-2">Inconvenient, workaround exists</td><td className="p-2">1 working day</td><td className="p-2">3 working days</td></tr>
                  <tr><td className="p-2 font-bold">P4 — Low</td><td className="p-2">Cosmetic or feature request</td><td className="p-2">2 working days</td><td className="p-2">Considered in planning</td></tr>
                </tbody>
              </table>
              <div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded mt-3">
                <p><strong>Results-week escalation.</strong> During examination and results periods notified to us: every issue is treated as at least P2; P1 first response is 1 hour; <strong>no maintenance or releases</strong>; support comes first.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">5. Availability</h2>
              <p className="mb-2"><strong>Monthly availability target: 99%</strong> (≈7 hours of downtime per month). Planned maintenance is notified 24 hours in advance and scheduled outside school hours. <strong>No maintenance during results periods.</strong></p>
              <p><strong>Excluded:</strong> notified maintenance; failures of the School&apos;s internet, devices, printers or power; third-party outages beyond our reasonable control.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">6. What we do proactively</h2>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li><strong>Pre-exam readiness check</strong> — weeks 10-11 of each term</li>
                <li>Sync status check — weeks 11 and 12</li>
                <li>Subscription expiry reminder — 21 days before expiry</li>
                <li>Backup verification — monthly</li>
                <li>Staff refresher training on request — free</li>
                <li>New-session promotion assistance — on request</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">7. Remedies if we fall short</h2>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="border-b"><td className="p-2">P1 unresolved for 3 consecutive working days</td><td className="p-2">10% of current term fee credited</td></tr>
                  <tr className="border-b"><td className="p-2">Availability below 99% in a month</td><td className="p-2">10% of term fee credited</td></tr>
                  <tr className="border-b"><td className="p-2">Availability below 95% in a month</td><td className="p-2">25% credited</td></tr>
                  <tr className="border-b"><td className="p-2">Platform unavailable 5+ consecutive business days (our fault)</td><td className="p-2">Full refund + right to terminate</td></tr>
                  <tr><td className="p-2">Data export not provided within 7 working days</td><td className="p-2">10% credited</td></tr>
                </tbody>
              </table>
              <p className="mt-2"><strong>How to claim:</strong> email <a href="mailto:support@nexaforges.me" className="text-green-700 underline">support@nexaforges.me</a> within 30 days of the failure. Total credits in a period will not exceed 50% of that period&apos;s fee.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">9. Escalation</h2>
              <ol className="list-decimal list-inside space-y-1 ml-1">
                <li>Standard support channels</li>
                <li>Founder direct — no response within target, or P1</li>
                <li>Written complaint to <a href="mailto:support@nexaforges.me" className="text-green-700 underline">support@nexaforges.me</a> — response within 5 working days</li>
              </ol>
            </section>

            <section className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-base font-bold text-gray-900 mb-2">Summary card</h2>
              <table className="w-full text-sm">
                <tbody>
                  <tr><td className="py-1 font-semibold w-1/2">Support</td><td>WhatsApp 09045955670 · 8am–8pm, Mon–Sat</td></tr>
                  <tr><td className="py-1 font-semibold">P1 response</td><td>2 hours (1 hour in results week)</td></tr>
                  <tr><td className="py-1 font-semibold">P2 response</td><td>4 hours</td></tr>
                  <tr><td className="py-1 font-semibold">Availability target</td><td>99% monthly</td></tr>
                  <tr><td className="py-1 font-semibold">Data export</td><td>7 working days, free</td></tr>
                </tbody>
              </table>
            </section>
          </div>

          <LegalDraftFooter />
        </article>
      </div>
    </div>
  );
}
