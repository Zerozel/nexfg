# NexaForge — Privacy Policy

**Effective date:** `[FILL: date]` · **Version 1.0**
**Data controller/processor:** `[FILL: registered company name]` (RC `[FILL: number]`), `[FILL: registered address]`, Nigeria

> ⚠️ **INTERNAL NOTE — DELETE BEFORE PUBLISHING.**
> Drafted against the Nigeria Data Protection Act 2023 (NDPA) and the product as
> built. **Not legal advice.** Before publishing:
> 1. Nigerian lawyer review, especially §3 (children's data) and §9 (rights).
> 2. Complete every `[FILL]`.
> 3. Confirm whether you must register with the **NDPC** as a data controller of
>    major importance — schools' student data makes this likely at modest scale.
> 4. Appoint a named **Data Protection Officer/contact** (§13) — a real person.
> 5. Publish at a stable public URL and link it in the site footer **and** the
>    login page.
> 6. §7 lists sub-processors — **verify each is accurate** before publishing.

---

## In short

- Schools use NexaForge to manage student records, scores and report cards.
- **The school decides what data is collected. We process it on the school's behalf.**
- **We do not sell your data.** We do not advertise. We do not share data between schools.
- Data is encrypted in transit and at rest, and backed up daily.
- You can ask for a copy of your data, or ask us to delete it.
- Questions: `[FILL: privacy email]`

---

## 1. Who we are and our role

NexaForge provides school management software to schools in Nigeria.

Our role depends on whose data it is:

| Data | Controller (decides) | Processor (acts on instructions) |
|---|---|---|
| Student, parent/guardian and staff records entered by a school | **The school** | **NexaForge** |
| The school's own account and billing details | **NexaForge** | — |
| Visitor data on our marketing site | **NexaForge** | — |

**This matters:** if you are a parent, guardian, student or member of staff and you
want to see, correct or delete your data, **contact the school first** — it is the
school's decision. We will always help the school act on your request, and we will
pass any request we receive directly to the relevant school.

---

## 2. What we collect

### 2.1 Data schools enter about students

Typically:

| Category | Examples |
|---|---|
| Identity | Full name, admission number, gender, date of birth |
| Contact | Address |
| Guardian | Guardian's name and phone number |
| Academic | Class, enrollment, subjects, scores, grades, positions, results |

Schools choose what to enter. We ask schools to enter **only what they need**.

### 2.2 Data about school staff

Name, email address, role (admin, principal, teacher), class and subject
assignments, and an encrypted password. We do not store passwords in readable form.

### 2.3 Data about the school

School name, address, phone, email, logo, motto, principal's signature, website
content, subscription tier and status, and payment records.

### 2.4 Data created automatically

| Type | Purpose | Retention |
|---|---|---|
| Login and session records | Security, account access | `[FILL: e.g. 12 months]` |
| Technical logs (IP address, browser, timestamps, errors) | Security, diagnosing faults | `[FILL: e.g. 90 days]` |
| Locally stored score entries | Enabling offline entry | Removed from the device once synchronised — see §11 |

### 2.5 What we do **not** collect

- **We do not store card or bank details.** Payments are handled entirely by Paystack.
- We do not collect biometric data, health data, or religious or political information.
- We do not use advertising trackers or sell data to data brokers.
- We do not use student data to train artificial-intelligence models.

---

## 3. 🔴 Children's data

Most students on the Platform are children. We take this seriously.

1. **The school is the controller** and is responsible for having a lawful basis
   under the NDPA — normally the performance of its educational function, or
   consent from a parent or guardian.
2. **The school must inform parents and guardians** that it uses NexaForge to
   process their child's records. We provide wording schools can use.
3. **We never contact students directly.** Students have no login. The Platform has
   no student- or parent-facing account.
4. **We do not market to students or parents**, and student data is never used for
   any marketing purpose.
5. We apply the same technical protections to children's data as to all personal
   data, and stricter access limits: only the school's own staff and, where
   strictly necessary for support, authorised NexaForge personnel.
6. **We do not publish student names or results** on public school websites.
   Report cards are generated for the school to print and distribute privately.

---

## 4. Why we process data (lawful bases)

| Purpose | Lawful basis (NDPA) |
|---|---|
| Providing the Platform to the school | Performance of a contract with the school |
| Processing student records | On the **school's** instructions; the school's lawful basis applies |
| Billing and payment | Contract; legal obligation (tax, accounting) |
| Support and communication | Contract; legitimate interests |
| Security, fraud prevention, backups | Legitimate interests; legal obligation |
| Improving the Platform (aggregated, anonymised only) | Legitimate interests |
| Marketing to schools (not individuals) | Consent, or legitimate interests with an opt-out |

---

## 5. How we use data

We use personal data only to:

1. operate the Platform and deliver its features;
2. authenticate users and enforce access control;
3. calculate grades, positions and generate report cards;
4. display the school's public website (school-provided content only);
5. process subscriptions and keep payment records;
6. provide support — which may require an authorised member of our team to access
   the school's data (see §6);
7. maintain security and investigate incidents;
8. meet legal obligations;
9. improve the Platform using **aggregated, anonymised** information only.

**We do not:** sell personal data; share data between schools; use student data for
marketing; make automated decisions with legal effect about individuals; or profile
individuals.

---

## 6. Who can see the data

### 6.1 Within a school

Access is restricted by role:

| Role | Can see |
|---|---|
| Admin / Principal | All of that school's data |
| Teacher | Only the classes and subjects assigned to them |

**One school can never see another school's data.** Separation is enforced both in
the application and at the database level, so every query is restricted to the
school of the account making it.

### 6.2 Within NexaForge

Access is limited to personnel who need it to operate the Platform or provide
support, and is used only for that purpose. Access is logged by our hosting
provider.

> We will tell a school when we have needed to access its records to resolve a
> support issue.

### 6.3 Service providers (sub-processors)

`[VERIFY each entry before publishing]`

| Provider | Purpose | Location | Data involved |
|---|---|---|---|
| **Supabase** | Database, authentication, file storage | `[FILL: region]` | All School Data |
| **Paystack** | Payment processing | Nigeria | School billing contact, payment records. **No card data reaches us.** |
| `[FILL: Vercel / hosting]` | Application hosting, logs | `[FILL: region]` | Technical logs, data in transit |
| `[FILL: email provider, if any]` | Transactional email | `[FILL]` | Email addresses |

Each provider is bound by contract to protect the data and use it only to provide
its service. We will notify schools before adding a new sub-processor that
processes School Data.

### 6.4 Legal disclosure

We may disclose data where required by Nigerian law or a valid order from a
competent authority. Where lawful, **we will notify the affected school first** so
it can respond.

### 6.5 Business transfer

If our business is sold or merged, data may transfer to the successor, which will
be bound by this Policy. We will notify schools in advance.

---

## 7. International transfers

Data may be stored or processed outside Nigeria depending on our hosting region
`[FILL: state the region — e.g. "data is stored in the EU (Supabase eu-west-1)"]`.

Where data leaves Nigeria we rely on the NDPA's transfer provisions and ensure an
adequate level of protection through contractual safeguards with our providers.

> **If your school requires Nigerian data residency, tell us before onboarding** —
> we will confirm what is possible before you commit.

---

## 8. How long we keep data

| Data | Retention |
|---|---|
| Active School Data | While the subscription is active |
| School Data after expiry or termination | **90 days**, then deleted |
| Student records the school asks us to erase | Erased within **30 days** |
| Payment and invoice records | `[FILL: e.g. 6 years]` — required for tax |
| Technical logs | `[FILL: e.g. 90 days]` |
| Backups | `[FILL: e.g. 30 days]` rolling |
| Marketing contacts (prospective schools) | Until they ask us to stop |

> A record deleted in the dashboard is **hidden** rather than erased, so academic
> history is preserved. **Permanent erasure must be requested from us** — see §9.

---

## 9. Your rights

Under the NDPA you have the right to:

| Right | What it means |
|---|---|
| **Access** | Get a copy of the personal data held about you |
| **Rectification** | Have inaccurate data corrected |
| **Erasure** | Have data deleted, where there is no lawful reason to keep it |
| **Restriction** | Ask that processing be limited while a dispute is resolved |
| **Portability** | Receive data in a machine-readable format |
| **Object** | Object to processing based on legitimate interests |
| **Withdraw consent** | Where processing relies on consent |
| **Complain** | Lodge a complaint with the NDPC |

### How to exercise them

**If you are a parent, guardian, student or member of staff:** contact **your
school** first — the school controls that data. If the school needs our help, we
will provide it promptly.

**If you are a school:** email `[FILL: privacy email]`. We will:

| Request | Our commitment |
|---|---|
| Copy of your data (export) | **CSV files within 7 working days**, free of charge |
| Correction | As soon as practicable |
| Permanent erasure | **Within 30 days** of a written request |
| Confirmation of what we hold | Within 7 working days |

We may need to verify your identity and authority before acting. We do not charge
for these requests unless they are excessive or repetitive.

### Complaints

Tell us first — `[FILL: privacy email]` — and we will respond within **7 working
days**. If you remain dissatisfied, you may complain to the
**Nigeria Data Protection Commission (NDPC)**, `[FILL: NDPC contact details]`.

---

## 10. How we protect data

| Measure | What we do |
|---|---|
| Encryption in transit | All traffic over HTTPS/TLS |
| Encryption at rest | Database and file storage encrypted by our provider |
| Passwords | Stored only as salted hashes; never visible to us |
| Access control | Enforced at the application layer **and** in the database, so a query can only ever return the requesting school's rows |
| Least privilege | Teachers see only their assigned classes |
| Backups | Automated, at least daily |
| Monitoring | Error and access logging |
| Administrative access | Restricted to authorised personnel, protected by multi-factor authentication |

**No system is perfectly secure.** We do not claim to be. We commit instead to
maintaining reasonable and appropriate measures, and to telling you promptly if
something goes wrong.

### If there is a breach

If a personal data breach occurs, we will:

1. contain and investigate it immediately;
2. **notify the affected school within 72 hours** of becoming aware, with what
   happened, what data was involved, and what we are doing;
3. notify the **NDPC** where the law requires;
4. support the school in notifying affected individuals where required;
5. document the incident and the measures taken to prevent recurrence.

---

## 11. 🔴 Offline score entry and your device

The Platform lets teachers enter scores without an internet connection. You should
understand what this means for data on your device.

1. Scores you enter are saved **in your browser's local storage on your own
   device** until you synchronise them.
2. **Until synchronised, that data is on your device only.** It is not on our
   servers, is not in our backups, and **cannot be recovered by us.**
3. It is **permanently lost** if you clear your browser data, use private/incognito
   mode, reset or change your device, or use apps that clear website storage.
4. Once synchronised successfully, the local copy is cleared and the data is held
   securely on our servers.
5. **Please synchronise at the end of each day you enter scores.**
6. On a shared device, log out when you finish so the next person cannot see your
   data.

---

## 12. Cookies and similar technologies

We use only what is necessary to make the Platform work:

| Type | Purpose | Can you refuse? |
|---|---|---|
| Authentication cookies | Keep you logged in securely | No — the Platform cannot work without them |
| Local storage | Save offline score entries | No — required for offline entry |
| Preference storage | Remember interface choices | Yes, without losing core function |

**We do not use advertising or cross-site tracking cookies.** `[VERIFY: if you add
analytics, disclose it here and add a consent mechanism.]`

---

## 13. Contact us

| Purpose | Contact |
|---|---|
| **Data protection enquiries** | `[FILL: privacy email]` |
| **Data Protection Officer / contact** | `[FILL: name and title]` |
| General support | `[FILL: support email]` · WhatsApp `[FILL: number]` |
| Postal address | `[FILL: registered address]` |

We aim to respond to privacy enquiries within **7 working days**.

---

## 14. Changes to this Policy

We may update this Policy. If a change is material, we will notify schools by
email **at least 30 days** before it takes effect. The effective date at the top
always shows the current version, and previous versions are available on request.

---

## Appendix A — Notice schools can give parents

> *Schools: you are welcome to adapt and use this wording. It helps meet your NDPA
> notice obligation.*

---

**Notice to parents and guardians — student records**

`[School name]` uses **NexaForge**, a school management platform, to keep student
records and prepare report cards.

**Information held:** your child's name, admission number, gender, date of birth,
address, your name and phone number, and their academic records (subjects, scores,
grades and results).

**Why:** to run the school, record academic progress and produce report cards.

**Who can see it:** authorised staff of this school only. NexaForge stores the data
securely on our behalf and does not sell it, share it with other schools, or use it
for advertising.

**Your rights:** you may ask to see your child's records, ask us to correct
anything inaccurate, or ask about deletion. Contact the school office at
`[school contact]`.

**How long:** for as long as your child is enrolled and thereafter in accordance
with our records policy.

If you have any concerns, please contact `[school contact person]`.

---

*Version 1.0 · Effective `[FILL: date]`*
*Related: [Terms & Conditions](./terms-and-conditions.md) · [Data Processing Addendum](./data-processing-addendum.md) · [SLA](./service-level-agreement.md)*
