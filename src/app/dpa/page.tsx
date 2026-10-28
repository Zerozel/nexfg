// src/app/dpa/page.tsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LegalDraftBanner, LegalDraftFooter } from '@/components/legal/LegalDraftBanner';

export const metadata = {
  title: 'Data Processing Addendum — NexaForge',
};

export default function DpaPage() {
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
              Data Processing Addendum (DPA)
            </h1>
            <p className="text-sm text-gray-500">
              Version 1.0-draft · The Nexa Verse · Effective upon business registration
            </p>
          </header>

          <div className="prose prose-sm max-w-none text-gray-800 space-y-8">
            <section>
              <p>
                <strong>Processor:</strong> The Nexa Verse, Nigeria (pending registration)
              </p>
              <p>
                <strong>Controller:</strong> the School named in the Terms &amp; Conditions
              </p>
              <p className="mt-3">
                This Addendum forms part of the{' '}
                <Link href="/terms" className="text-green-700 underline">Terms &amp; Conditions</Link>.
                Where they conflict on the processing of personal data, <strong>this Addendum prevails</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. Why this document exists</h2>
              <p className="mb-2">
                The School enters personal data about students, parents/guardians and staff into the Platform. Under the Nigeria Data Protection Act 2023 (NDPA):
              </p>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li><strong>the School is the data controller</strong> — it decides what data is collected and why;</li>
                <li><strong>The Nexa Verse is the data processor</strong> — we process it only on the School&apos;s instructions.</li>
              </ul>
              <p className="mt-2">This Addendum records what each party must do.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. Scope and instructions</h2>
              <ol className="list-decimal list-inside space-y-2 ml-1">
                <li>We process personal data <strong>only</strong> to provide the Platform and support, and only on the School&apos;s documented instructions.</li>
                <li><strong>We will not</strong> use School personal data for our own purposes, sell it, share it with other schools, use it for advertising, or use it to train AI models.</li>
                <li>If we believe an instruction breaches data protection law, we will tell the School promptly and may pause that processing.</li>
                <li>We may use <strong>aggregated, anonymised</strong> data (from which no school or individual can be identified) to improve and market the Platform.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. Our obligations as processor</h2>
              <ol className="list-decimal list-inside space-y-1 ml-1">
                <li>Process personal data only on the School&apos;s instructions (§2)</li>
                <li>Implement the technical and organisational measures in Annex 3</li>
                <li>Ensure personnel with access are bound by confidentiality and are trained</li>
                <li>Limit access to personnel who need it to provide or support the service</li>
                <li>Not engage a sub-processor except under §6</li>
                <li>Assist the School in responding to data-subject requests (§7)</li>
                <li>Notify the School of a personal data breach <strong>within 72 hours</strong> of awareness (§8)</li>
                <li>Assist the School with any impact assessment or regulator enquiry, at reasonable cost</li>
                <li>Delete or return personal data on termination (§9)</li>
                <li>Make available the information needed to demonstrate compliance (§10)</li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">4. The School&apos;s obligations as controller</h2>
              <ol className="list-decimal list-inside space-y-1 ml-1">
                <li>Ensure it has a <strong>lawful basis</strong> under the NDPA for the personal data it enters</li>
                <li>Give required <strong>notices to parents, guardians and staff</strong></li>
                <li>Obtain any consents required, particularly for children&apos;s data</li>
                <li>Enter <strong>only the personal data it needs</strong> (data minimisation)</li>
                <li>Keep personal data accurate and up to date</li>
                <li>Give each authorised user their <strong>own account</strong> and never share credentials</li>
                <li>Promptly notify us when a user should lose access</li>
                <li>Respond to data-subject requests as controller, with our assistance</li>
                <li>Ensure users <strong>synchronise offline entries</strong> — unsynchronised data is outside our control</li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">5. Details of processing</h2>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="border-b"><td className="p-2 font-semibold w-1/3">Subject matter</td><td className="p-2">Provision of school management software</td></tr>
                  <tr className="border-b"><td className="p-2 font-semibold">Duration</td><td className="p-2">For the term of the subscription, plus retention in §9</td></tr>
                  <tr className="border-b"><td className="p-2 font-semibold">Nature</td><td className="p-2">Storage, organisation, retrieval, computation of grades/positions, generation of report cards, backup</td></tr>
                  <tr className="border-b"><td className="p-2 font-semibold">Purpose</td><td className="p-2">Enabling the School to administer student records and academic results</td></tr>
                  <tr className="border-b"><td className="p-2 font-semibold">Categories of data subject</td><td className="p-2">Students (mostly children), parents/guardians, school staff</td></tr>
                  <tr><td className="p-2 font-semibold">Sensitive data</td><td className="p-2"><strong>Children&apos;s data.</strong> No health, biometric, religious, political or financial data is required or intended.</td></tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">6. Sub-processors</h2>
              <ol className="list-decimal list-inside space-y-1 mb-3 ml-1">
                <li>The School <strong>authorises</strong> the sub-processors listed in Annex 2.</li>
                <li>Each is bound by a written contract imposing data-protection obligations substantially equivalent to this Addendum.</li>
                <li>We remain <strong>fully liable</strong> for our sub-processors&apos; acts and omissions.</li>
                <li>We will give the School at least <strong>30 days&apos; notice</strong> before adding or replacing a sub-processor.</li>
                <li>If the School reasonably objects on data-protection grounds within that notice period, we will work in good faith to find an alternative.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">7. Data subject requests</h2>
              <p className="mb-2">Where we receive a request directly from a student, parent, guardian or staff member, <strong>we will not respond substantively</strong> — we will refer them to the School and inform the School promptly.</p>
              <table className="w-full text-sm border-collapse mt-2">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border p-2 text-left">Request type</th>
                    <th className="border p-2 text-left">How we assist</th>
                    <th className="border p-2 text-left">Timeframe</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b"><td className="p-2">Access / portability</td><td className="p-2">Provide CSV export of the relevant records</td><td className="p-2">7 working days</td></tr>
                  <tr className="border-b"><td className="p-2">Rectification</td><td className="p-2">Correct records the School cannot correct itself</td><td className="p-2">As soon as practicable</td></tr>
                  <tr className="border-b"><td className="p-2">Erasure</td><td className="p-2">Permanently erase specified records</td><td className="p-2">30 days</td></tr>
                  <tr><td className="p-2">Restriction</td><td className="p-2">Restrict processing of specified records</td><td className="p-2">7 working days</td></tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">8. Personal data breach</h2>
              <p className="mb-2">We will notify the School <strong>without undue delay and in any event within 72 hours</strong> of becoming aware of a personal data breach affecting its data. We will assist the School in notifying the NDPC and affected individuals where the law requires.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">9. Retention, return and deletion</h2>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="border-b"><td className="p-2">Subscription active</td><td className="p-2">Data retained to provide the service</td></tr>
                  <tr className="border-b"><td className="p-2">Subscription expires</td><td className="p-2"><strong>Retained for 90 days</strong> — the School may renew or request an export</td></tr>
                  <tr className="border-b"><td className="p-2">After 90 days</td><td className="p-2">Data may be <strong>permanently deleted</strong></td></tr>
                  <tr className="border-b"><td className="p-2">Termination</td><td className="p-2">On request within 90 days we provide a CSV export; then delete</td></tr>
                  <tr className="border-b"><td className="p-2">Erasure request</td><td className="p-2">Specified data erased within 30 days</td></tr>
                  <tr className="border-b"><td className="p-2">Backups</td><td className="p-2">Deleted data persists in rolling backups for up to 30 days, then overwritten</td></tr>
                  <tr><td className="p-2">Legal retention</td><td className="p-2">Where law requires (e.g. payment records for 6 years), retained for the required period only</td></tr>
                </tbody>
              </table>
              <p className="mt-2"><strong>We will not withhold data as leverage in a payment dispute.</strong></p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">11. International transfers</h2>
              <p>Personal data is stored in the EU (Supabase <code className="text-xs bg-gray-100 px-1 rounded">eu-west-1</code>). Where data is transferred outside Nigeria, we rely on the NDPA&apos;s transfer provisions and ensure adequate protection through contractual safeguards.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Annex 1 — Categories of personal data</h2>
              <p className="mb-2"><strong>Students (mostly children):</strong> Full name, admission number, gender, date of birth, address, class and enrollment history, subjects, scores, grades, positions, results and remarks.</p>
              <p className="mb-2"><strong>Parents / guardians:</strong> Name, phone number, any email or address the School enters.</p>
              <p className="mb-2"><strong>School staff:</strong> Full name, email address, role, class and subject assignments, hashed password, login timestamps.</p>
              <p><strong>School (organisation):</strong> Name, address, phone, email, logo, motto, principal&apos;s signature, subscription tier and status, payment records.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Annex 2 — Authorised sub-processors</h2>
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border p-2 text-left">Sub-processor</th>
                    <th className="border p-2 text-left">Purpose</th>
                    <th className="border p-2 text-left">Location</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b"><td className="p-2"><strong>Supabase Inc.</strong></td><td className="p-2">Database, authentication, file storage</td><td className="p-2">EU (Ireland)</td></tr>
                  <tr className="border-b"><td className="p-2"><strong>Paystack Payments Ltd</strong></td><td className="p-2">Payment processing</td><td className="p-2">Nigeria</td></tr>
                  <tr className="border-b"><td className="p-2"><strong>Vercel Inc.</strong></td><td className="p-2">Application hosting, logging</td><td className="p-2">USA (Global CDN)</td></tr>
                  <tr><td className="p-2"><strong>Resend</strong></td><td className="p-2">Transactional email</td><td className="p-2">USA</td></tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Annex 3 — Technical and organisational measures</h2>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="border-b"><td className="p-2 font-semibold w-1/3">Encryption in transit</td><td className="p-2">All traffic over HTTPS/TLS</td></tr>
                  <tr className="border-b"><td className="p-2 font-semibold">Encryption at rest</td><td className="p-2">Database and file storage encrypted by the hosting provider</td></tr>
                  <tr className="border-b"><td className="p-2 font-semibold">Authentication</td><td className="p-2">Industry-standard managed authentication; passwords stored only as salted hashes</td></tr>
                  <tr className="border-b"><td className="p-2 font-semibold">Tenant isolation</td><td className="p-2">Enforced in the application and at the database layer</td></tr>
                  <tr className="border-b"><td className="p-2 font-semibold">Role-based access</td><td className="p-2">Admin/principal see their school; teachers see only assigned classes and subjects</td></tr>
                  <tr className="border-b"><td className="p-2 font-semibold">Backups</td><td className="p-2">Automated, at least daily; 30 days retention</td></tr>
                  <tr className="border-b"><td className="p-2 font-semibold">Logging</td><td className="p-2">Authentication and error logging retained 90 days</td></tr>
                  <tr className="border-b"><td className="p-2 font-semibold">Confidentiality</td><td className="p-2">All personnel bound by confidentiality obligations</td></tr>
                  <tr><td className="p-2 font-semibold">Incident response</td><td className="p-2">Documented procedure with 72-hour notification</td></tr>
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
