// src/app/privacy/page.tsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LegalDraftBanner, LegalDraftFooter } from '@/components/legal/LegalDraftBanner';

export const metadata = {
  title: 'Privacy Policy — NexaForge',
};

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-500">
              Version 1.0-draft · The Nexa Verse · Effective upon business registration
            </p>
          </header>

          <div className="prose prose-sm max-w-none text-gray-800 space-y-8">
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">In short</h2>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li>Schools use NexaForge to manage student records, scores and report cards.</li>
                <li><strong>The school decides what data is collected. We process it on the school&apos;s behalf.</strong></li>
                <li><strong>We do not sell your data.</strong> We do not advertise. We do not share data between schools.</li>
                <li>Data is encrypted in transit and at rest, and backed up daily.</li>
                <li>You can ask for a copy of your data, or ask us to delete it.</li>
                <li>Questions: <a href="mailto:support@nexaforges.me" className="text-green-700 underline">support@nexaforges.me</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. Who we are and our role</h2>
              <p className="mb-3">
                NexaForge is a school management platform operated by <strong>The Nexa Verse</strong>, Nigeria. We provide software to schools.
              </p>
              <p className="mb-3">Our role depends on whose data it is:</p>
              <table className="w-full text-sm border-collapse mb-3">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border p-2 text-left">Data</th>
                    <th className="border p-2 text-left">Controller (decides)</th>
                    <th className="border p-2 text-left">Processor (acts on instructions)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b"><td className="p-2">Student, parent/guardian and staff records entered by a school</td><td className="p-2"><strong>The school</strong></td><td className="p-2"><strong>The Nexa Verse</strong></td></tr>
                  <tr className="border-b"><td className="p-2">The school&apos;s own account and billing details</td><td className="p-2"><strong>The Nexa Verse</strong></td><td className="p-2">—</td></tr>
                  <tr><td className="p-2">Visitor data on our marketing site</td><td className="p-2"><strong>The Nexa Verse</strong></td><td className="p-2">—</td></tr>
                </tbody>
              </table>
              <p>
                <strong>This matters:</strong> if you are a parent, guardian, student or member of staff and you want to see, correct or delete your data, <strong>contact the school first</strong> — it is the school&apos;s decision. We will always help the school act on your request, and we will pass any request we receive directly to the relevant school.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. What we collect</h2>
              <h3 className="font-semibold text-gray-900 mt-3 mb-2">2.1 Data schools enter about students</h3>
              <ul className="list-disc list-inside space-y-1 mb-3 ml-1">
                <li>Identity: full name, admission number, gender, date of birth</li>
                <li>Contact: address</li>
                <li>Guardian: guardian&apos;s name and phone number</li>
                <li>Academic: class, enrollment, subjects, scores, grades, positions, results</li>
              </ul>
              <p className="mb-3">Schools choose what to enter. We ask schools to enter <strong>only what they need</strong>.</p>

              <h3 className="font-semibold text-gray-900 mt-3 mb-2">2.2 Data about school staff</h3>
              <p className="mb-3">Name, email address, role (admin, principal, teacher), class and subject assignments, and an encrypted password. We do not store passwords in readable form.</p>

              <h3 className="font-semibold text-gray-900 mt-3 mb-2">2.3 Data created automatically</h3>
              <ul className="list-disc list-inside space-y-1 mb-3 ml-1">
                <li>Login and session records — security, account access — retained 12 months</li>
                <li>Technical logs (IP address, browser, timestamps, errors) — security, diagnosing faults — retained 90 days</li>
                <li>Locally stored score entries — enabling offline entry — removed from the device once synchronised (see §11)</li>
              </ul>

              <h3 className="font-semibold text-gray-900 mt-3 mb-2">2.4 What we do not collect</h3>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li><strong>We do not store card or bank details.</strong> Payments are handled entirely by Paystack.</li>
                <li>We do not collect biometric data, health data, or religious or political information.</li>
                <li>We do not use advertising trackers or sell data to data brokers.</li>
                <li>We do not use student data to train artificial-intelligence models.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. Children&apos;s data</h2>
              <p className="mb-2">Most students on the Platform are children. We take this seriously.</p>
              <ol className="list-decimal list-inside space-y-2 ml-1">
                <li><strong>The school is the controller</strong> and is responsible for having a lawful basis under the NDPA.</li>
                <li><strong>The school must inform parents and guardians</strong> that it uses NexaForge to process their child&apos;s records.</li>
                <li><strong>We never contact students directly.</strong> Students have no login.</li>
                <li><strong>We do not market to students or parents.</strong></li>
                <li>We apply the same technical protections to children&apos;s data as to all personal data, with stricter access limits.</li>
                <li><strong>We do not publish student names or results</strong> on public school websites.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">4. Why we process data (lawful bases)</h2>
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border p-2 text-left">Purpose</th>
                    <th className="border p-2 text-left">Lawful basis (NDPA)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b"><td className="p-2">Providing the Platform to the school</td><td className="p-2">Performance of a contract with the school</td></tr>
                  <tr className="border-b"><td className="p-2">Processing student records</td><td className="p-2">On the school&apos;s instructions; the school&apos;s lawful basis applies</td></tr>
                  <tr className="border-b"><td className="p-2">Billing and payment</td><td className="p-2">Contract; legal obligation</td></tr>
                  <tr className="border-b"><td className="p-2">Support and communication</td><td className="p-2">Contract; legitimate interests</td></tr>
                  <tr className="border-b"><td className="p-2">Security, fraud prevention, backups</td><td className="p-2">Legitimate interests; legal obligation</td></tr>
                  <tr><td className="p-2">Improving the Platform (aggregated, anonymised only)</td><td className="p-2">Legitimate interests</td></tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">6. Who can see the data</h2>
              <h3 className="font-semibold text-gray-900 mt-3 mb-2">6.1 Within a school</h3>
              <ul className="list-disc list-inside space-y-1 mb-3 ml-1">
                <li>Admin / Principal — all of that school&apos;s data</li>
                <li>Teacher — only the classes and subjects assigned to them</li>
              </ul>
              <p className="mb-3"><strong>One school can never see another school&apos;s data.</strong> Separation is enforced both in the application and at the database level.</p>

              <h3 className="font-semibold text-gray-900 mt-3 mb-2">6.3 Service providers (sub-processors)</h3>
              <table className="w-full text-sm border-collapse mb-3">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border p-2 text-left">Provider</th>
                    <th className="border p-2 text-left">Purpose</th>
                    <th className="border p-2 text-left">Location</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b"><td className="p-2"><strong>Supabase</strong></td><td className="p-2">Database, authentication, file storage</td><td className="p-2">EU (Ireland, eu-west-1)</td></tr>
                  <tr className="border-b"><td className="p-2"><strong>Paystack</strong></td><td className="p-2">Payment processing</td><td className="p-2">Nigeria</td></tr>
                  <tr className="border-b"><td className="p-2"><strong>Vercel</strong></td><td className="p-2">Application hosting, logging</td><td className="p-2">USA (Global CDN)</td></tr>
                  <tr><td className="p-2"><strong>Resend</strong></td><td className="p-2">Transactional email (password reset)</td><td className="p-2">USA</td></tr>
                </tbody>
              </table>
              <p>Each provider is bound by contract to protect the data and use it only to provide its service.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">7. International transfers</h2>
              <p>Data is stored in the EU (Supabase <code className="text-xs bg-gray-100 px-1 rounded">eu-west-1</code>). Where data leaves Nigeria, we rely on the NDPA&apos;s transfer provisions and ensure adequate protection through contractual safeguards with our providers.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">8. How long we keep data</h2>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="border-b"><td className="p-2">Active School Data</td><td className="p-2">While the subscription is active</td></tr>
                  <tr className="border-b"><td className="p-2">School Data after expiry or termination</td><td className="p-2">90 days, then deleted</td></tr>
                  <tr className="border-b"><td className="p-2">Student records the school asks us to erase</td><td className="p-2">Erased within 30 days</td></tr>
                  <tr className="border-b"><td className="p-2">Payment and invoice records</td><td className="p-2">6 years (Nigerian tax requirement)</td></tr>
                  <tr className="border-b"><td className="p-2">Technical logs</td><td className="p-2">90 days</td></tr>
                  <tr className="border-b"><td className="p-2">Backups</td><td className="p-2">30 days rolling</td></tr>
                  <tr><td className="p-2">Login and session records</td><td className="p-2">12 months</td></tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">9. Your rights</h2>
              <p className="mb-2">Under the NDPA you have the right to:</p>
              <ul className="list-disc list-inside space-y-1 mb-3 ml-1">
                <li><strong>Access</strong> — get a copy of the personal data held about you</li>
                <li><strong>Rectification</strong> — have inaccurate data corrected</li>
                <li><strong>Erasure</strong> — have data deleted, where there is no lawful reason to keep it</li>
                <li><strong>Restriction</strong> — ask that processing be limited while a dispute is resolved</li>
                <li><strong>Portability</strong> — receive data in a machine-readable format</li>
                <li><strong>Object</strong> — object to processing based on legitimate interests</li>
                <li><strong>Withdraw consent</strong> — where processing relies on consent</li>
                <li><strong>Complain</strong> — lodge a complaint with the NDPC</li>
              </ul>
              <p className="mb-2"><strong>If you are a parent, guardian, student or member of staff:</strong> contact <strong>your school</strong> first — the school controls that data. If the school needs our help, we will provide it promptly.</p>
              <p className="mb-2"><strong>If you are a school:</strong> email <a href="mailto:support@nexaforges.me" className="text-green-700 underline">support@nexaforges.me</a>. We will respond within 7 working days.</p>
              <p><strong>Complaints:</strong> tell us first — <a href="mailto:support@nexaforges.me" className="text-green-700 underline">support@nexaforges.me</a> — and we will respond within 7 working days. If you remain dissatisfied, you may complain to the <strong>Nigeria Data Protection Commission (NDPC)</strong>.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">11. Offline score entry and your device</h2>
              <div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Scores you enter are saved <strong>in your browser&apos;s local storage on your own device</strong> until you synchronise them.</li>
                  <li><strong>Until synchronised, that data is on your device only.</strong> It is not on our servers, is not in our backups, and <strong>cannot be recovered by us</strong>.</li>
                  <li>It is <strong>permanently lost</strong> if you clear your browser data, use private/incognito mode, reset or change your device, or use apps that clear website storage.</li>
                  <li>Once synchronised successfully, the local copy is cleared and the data is held securely on our servers.</li>
                  <li><strong>Please synchronise at the end of each day you enter scores.</strong></li>
                  <li>On a shared device, log out when you finish so the next person cannot see your data.</li>
                </ol>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">12. Cookies and similar technologies</h2>
              <p className="mb-2">We use only what is necessary to make the Platform work:</p>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li>Authentication cookies — keep you logged in securely — cannot be refused</li>
                <li>Local storage — save offline score entries — cannot be refused</li>
                <li>Preference storage — remember interface choices — can be refused</li>
              </ul>
              <p className="mt-2"><strong>We do not use advertising or cross-site tracking cookies.</strong></p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">13. Contact us</h2>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="border-b"><td className="p-2 font-semibold w-1/3">Data protection enquiries</td><td className="p-2"><a href="mailto:support@nexaforges.me" className="text-green-700 underline">support@nexaforges.me</a></td></tr>
                  <tr className="border-b"><td className="p-2 font-semibold">General support</td><td className="p-2"><a href="mailto:support@nexaforges.me" className="text-green-700 underline">support@nexaforges.me</a></td></tr>
                  <tr className="border-b"><td className="p-2 font-semibold">WhatsApp</td><td className="p-2">09045955670</td></tr>
                  <tr><td className="p-2 font-semibold">Registered address</td><td className="p-2">Pending company registration</td></tr>
                </tbody>
              </table>
              <p className="mt-3">We aim to respond to privacy enquiries within <strong>7 working days</strong>.</p>
            </section>
          </div>

          <LegalDraftFooter />
        </article>
      </div>
    </div>
  );
}
