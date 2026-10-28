// src/app/terms/page.tsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LegalDraftBanner, LegalDraftFooter } from '@/components/legal/LegalDraftBanner';

export const metadata = {
  title: 'Terms & Conditions — NexaForge',
};

export default function TermsPage() {
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
              Terms &amp; Conditions of Service
            </h1>
            <p className="text-sm text-gray-500">
              Version 1.0-draft · The Nexa Verse · Effective upon business registration
            </p>
          </header>

          <div className="prose prose-sm max-w-none text-gray-800 space-y-8">
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. What this agreement is</h2>
              <p className="mb-3">
                These Terms govern your school&apos;s use of the NexaForge school management platform, including the dashboard, score entry, report cards, your school website, and any related support.
              </p>
              <p className="mb-3">
                By creating an account, paying a subscription fee, or using the platform, the school agrees to these Terms. If you are accepting on behalf of a school, you confirm you are authorised to bind it.
              </p>
              <p>
                <strong>Parties:</strong> these Terms are between <strong>The Nexa Verse</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, operating the platform under the brand <strong>NexaForge</strong>) and the <strong>school</strong> as an organisation &mdash; not with individual teachers, students or parents.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. Definitions</h2>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {[
                    ['Platform', 'The NexaForge software, websites and services operated by The Nexa Verse'],
                    ['School', 'The educational institution holding the subscription'],
                    ['User', 'Any person the School authorises to use the Platform (admin, principal, teacher)'],
                    ['School Data', 'All data the School or its Users enter, including student records, scores and results'],
                    ['Subscription Period', '120 days from the date a payment is successfully received'],
                    ['Trial', 'A no-cost evaluation period of 30 days from account creation'],
                  ].map(([term, def]) => (
                    <tr key={term} className="border-b">
                      <td className="p-2 font-semibold align-top w-1/3">{term}</td>
                      <td className="p-2 align-top">{def}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. Accounts and security</h2>
              <ol className="list-decimal list-inside space-y-2 ml-1">
                <li>We create the School&apos;s initial administrator account and issue a temporary password. The School must change it promptly.</li>
                <li><strong>The School is responsible for all activity under its accounts.</strong> Keep credentials confidential.</li>
                <li><strong>Each User must have their own account.</strong> Sharing logins is prohibited &mdash; it defeats access control and makes it impossible to attribute score changes.</li>
                <li>The School must promptly remove access for anyone who leaves its employment, by notifying us.</li>
                <li>Notify us immediately of any suspected unauthorised access.</li>
                <li><strong>Password recovery.</strong> Self-service password reset is available via the login page. If you need further assistance, contact support.</li>
              </ol>
              <p className="mt-3">
                We may suspend an account immediately, without notice, where we reasonably believe it is being used unlawfully or in a way that threatens the security or integrity of the Platform or other schools&apos; data.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">4. What we provide</h2>
              <p className="mb-3">
                Subject to payment, we provide the Platform on a non-exclusive, non-transferable basis for the School&apos;s internal administration, including:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-3 ml-1">
                <li>student, staff, class and subject records</li>
                <li>assessment configuration and score entry, including <strong>offline entry with later synchronisation</strong></li>
                <li>automatic computation of grades and positions</li>
                <li>printable report cards and class result sheets</li>
                <li>a public school website on a <code className="text-xs bg-gray-100 px-1 rounded">nexaforges.me</code> subdomain</li>
                <li>support in accordance with the Service Level Agreement</li>
              </ul>

              <h3 className="font-semibold text-gray-900 mt-4 mb-2">4.1 Features not included</h3>
              <p className="mb-2">We provide the Platform <strong>as it currently exists</strong>. As at the effective date, the following are <strong>not</strong> included:</p>
              <ul className="list-disc list-inside space-y-1 mb-3 ml-1">
                <li>attendance recording or reporting</li>
                <li>self-service data export (exports available on request &mdash; see §11.4)</li>
                <li>school fee collection or accounting</li>
                <li>parent or student logins</li>
                <li>SMS or email notifications to parents</li>
              </ul>
              <p>
                <strong>Nothing in our marketing materials, proposals or conversations creates an obligation to deliver a feature unless stated in writing in these Terms or in a signed variation.</strong> Where we describe a feature as &ldquo;planned&rdquo;, that is an indication of intent only, not a commitment to a date.
              </p>

              <h3 className="font-semibold text-gray-900 mt-4 mb-2">4.2 Changes to the Platform</h3>
              <p>We may add, modify or remove features to improve the Platform. We will give at least <strong>30 days&apos; notice</strong> before removing or materially degrading a feature the School actively uses. If such a change materially reduces the value of the Platform to the School, the School may terminate and receive a pro-rata refund of the unused part of the current Subscription Period.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">5. The School&apos;s responsibilities</h2>
              <ol className="list-decimal list-inside space-y-2 ml-1">
                <li>provide accurate registration and billing information;</li>
                <li>use the Platform lawfully, and only for its own school administration;</li>
                <li>obtain any consents or give any notices required under applicable data protection law for entering student and parent information;</li>
                <li>enter only the personal data it actually needs;</li>
                <li>verify the accuracy of scores, assessment weightings and results <strong>before</strong> issuing report cards to parents (§5.1);</li>
                <li>keep its own independent records of critical academic data;</li>
                <li>ensure Users complete reasonable training we provide;</li>
                <li><strong>ensure Users synchronise offline-entered scores</strong> (§8);</li>
                <li>not attempt to access another school&apos;s data, probe or breach security, reverse engineer the Platform, resell or sublicense access, or upload malware or unlawful content.</li>
              </ol>

              <h3 className="font-semibold text-gray-900 mt-4 mb-2">5.1 Verification of results &mdash; important</h3>
              <p className="mb-2">The Platform calculates totals, grades and positions from the assessment configuration <strong>the School sets</strong>, including the weighting of each assessment.</p>
              <p className="mb-2"><strong>The School is responsible for confirming that its assessment configuration is correct</strong> &mdash; in particular that assessment weightings sum to 100% for each subject &mdash; and for checking results before distribution.</p>
              <p><strong>We strongly recommend printing and checking one report card before printing in bulk.</strong> We are not liable for the consequences of results calculated from an incorrect configuration entered by the School, or for results distributed without being checked.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">6. Fees, payment and renewal</h2>
              <h3 className="font-semibold text-gray-900 mt-2 mb-2">6.1 Plans</h3>
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border p-2 text-left">Plan</th>
                    <th className="border p-2 text-right">Fee per Subscription Period</th>
                    <th className="border p-2 text-center">Students</th>
                    <th className="border p-2 text-center">Staff</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border p-2">Starter</td><td className="border p-2 text-right">₦15,000</td><td className="border p-2 text-center">up to 200</td><td className="border p-2 text-center">up to 10</td></tr>
                  <tr><td className="border p-2">Growth</td><td className="border p-2 text-right">₦30,000</td><td className="border p-2 text-center">up to 500</td><td className="border p-2 text-center">up to 30</td></tr>
                  <tr><td className="border p-2">Premium</td><td className="border p-2 text-right">₦60,000</td><td className="border p-2 text-center">unlimited</td><td className="border p-2 text-center">unlimited</td></tr>
                </tbody>
              </table>
              <p className="mt-2">Fees are in Nigerian Naira and <strong>exclusive of any applicable taxes</strong>.</p>

              <h3 className="font-semibold text-gray-900 mt-4 mb-2">6.2 How the Subscription Period is calculated</h3>
              <p><strong>A Subscription Period is 120 days beginning on the date payment is successfully received</strong> &mdash; not from the expiry of any previous period. Paying before your current period ends does not add the remaining days.</p>

              <h3 className="font-semibold text-gray-900 mt-4 mb-2">6.3 Payment</h3>
              <p>Payments are processed by <strong>Paystack</strong>. We do not receive or store card details.</p>

              <h3 className="font-semibold text-gray-900 mt-4 mb-2">6.6 Refunds</h3>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li><strong>No refunds for a partly used Subscription Period</strong>, except as stated below.</li>
                <li><strong>Full refund</strong> if the Platform is unavailable for more than 5 consecutive business days due to our fault.</li>
                <li><strong>Pro-rata refund</strong> where the School terminates under §4.2 (adverse change) or §7.3 (our material breach).</li>
                <li><strong>Full refund of a duplicate payment</strong>.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">7. Term, suspension and termination</h2>
              <p className="mb-2"><strong>7.2 Expiry and non-payment.</strong> On expiry without renewal, we may restrict or suspend access. <strong>We will give at least 7 days&apos; written notice before restricting access, and will not restrict access during a School&apos;s stated examination or results period.</strong> School Data is retained for 90 days after expiry.</p>
              <p className="mb-2"><strong>7.4 On termination.</strong> On request within 90 days, we provide an export of School Data. After 90 days we may permanently delete School Data. <strong>We will not withhold a School&apos;s data because of a payment dispute.</strong></p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">8. Offline score entry &mdash; allocation of risk</h2>
              <div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded">
                <p className="mb-2"><strong>This section is important. Please ensure teaching staff understand it.</strong></p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>The Platform allows Users to enter scores <strong>without an internet connection</strong>. Such entries are stored <strong>locally on the User&apos;s own device</strong> until synchronised.</li>
                  <li><strong>Until a score is successfully synchronised, it exists only on that device. It is not held by us, is not part of our backups, and cannot be recovered by us.</strong></li>
                  <li>Locally stored, unsynchronised data will be <strong>permanently lost</strong> if the User clears browser data or cache, uses private/incognito mode, uninstalls or resets the browser or device, changes device, or uses software that clears website storage.</li>
                  <li><strong>The School is responsible for ensuring Users synchronise their entries promptly</strong>, and in any event before the end of each day on which scores are entered.</li>
                  <li><strong>We accept no liability for loss of unsynchronised data.</strong></li>
                </ol>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">9. Warranties and liability</h2>
              <p className="mb-2"><strong>9.3 Limitation of liability.</strong> Subject to §9.4, our total aggregate liability shall not exceed the total fees paid by the School in any 12-month period. Neither party is liable for indirect or consequential loss.</p>
              <p className="mb-2"><strong>9.4 What is not limited.</strong> Nothing in these Terms limits liability for: death or personal injury caused by negligence; fraud; or any liability that cannot lawfully be limited.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">11. Data protection</h2>
              <p className="mb-2">Handling of personal data is governed by the <Link href="/privacy" className="text-green-700 underline">Privacy Policy</Link> and <Link href="/dpa" className="text-green-700 underline">Data Processing Addendum</Link>, which form part of these Terms. In summary:</p>
              <ol className="list-decimal list-inside space-y-1 ml-1">
                <li><strong>The School is the data controller</strong> of student, parent and staff personal data. <strong>We are the data processor</strong>, acting on the School&apos;s instructions.</li>
                <li><strong>The School&apos;s data belongs to the School.</strong> We claim no ownership. We do not sell it, and we do not use it for advertising.</li>
                <li><strong>Export:</strong> on request we provide School Data in CSV format within 7 working days, free of charge.</li>
                <li><strong>Deletion:</strong> on written request we delete or permanently erase specified School Data within 30 days, except where retention is required by law.</li>
                <li><strong>Breach notification:</strong> we will notify the School within 72 hours of becoming aware of a personal data breach.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">14. General</h2>
              <p className="mb-2"><strong>14.9 Governing law and disputes.</strong> These Terms are governed by the laws of the <strong>Federal Republic of Nigeria</strong>. The parties shall first attempt to resolve any dispute in good faith. The courts of <strong>[FILL: state]</strong>, Nigeria shall have jurisdiction.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">15. Contact</h2>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="border-b"><td className="p-2 font-semibold w-1/3">Support</td><td className="p-2"><a href="mailto:support@nexaforges.me" className="text-green-700 underline">support@nexaforges.me</a></td></tr>
                  <tr className="border-b"><td className="p-2 font-semibold">WhatsApp</td><td className="p-2">[FILL: WhatsApp number]</td></tr>
                  <tr className="border-b"><td className="p-2 font-semibold">Billing</td><td className="p-2"><a href="mailto:support@nexaforges.me" className="text-green-700 underline">support@nexaforges.me</a></td></tr>
                  <tr className="border-b"><td className="p-2 font-semibold">Legal notices</td><td className="p-2"><a href="mailto:support@nexaforges.me" className="text-green-700 underline">support@nexaforges.me</a></td></tr>
                  <tr><td className="p-2 font-semibold">Data protection</td><td className="p-2"><a href="mailto:support@nexaforges.me" className="text-green-700 underline">support@nexaforges.me</a></td></tr>
                </tbody>
              </table>
            </section>

            <section className="border-t pt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Acceptance</h2>
              <p>By using the Platform or paying a subscription fee, the School accepts these Terms.</p>
            </section>
          </div>

          <LegalDraftFooter />
        </article>
      </div>
    </div>
  );
}
