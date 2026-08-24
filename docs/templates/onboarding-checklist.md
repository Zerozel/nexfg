# Onboarding Checklist — `[SCHOOL NAME]`

> **Copy this file for each school:** `docs/templates/schools/{slug}-onboarding.md`
> Internal working document. Do not share the whole file with the school.

| Field | Value |
|---|---|
| School name | |
| Slug / subdomain | `______.nexaforges.me` |
| Proprietor / decision maker | |
| Primary contact + WhatsApp | |
| Admin email | |
| Plan | Starter / Growth / Premium / Trial |
| Students · Staff | ___ · ___ |
| Referred by | |
| Start date | |
| 🔴 **Exam & results dates** | |
| **Go-live date (gate passed)** | |

> 🔴 **Capture the exam/results dates in the first conversation.** They drive your
> entire term calendar — no maintenance, no releases, priority support.

---

## Stage 0 — Before you say yes

- [ ] Is this school in an existing cluster? (Referral density beats spread — `business/06`)
- [ ] Do they have **at least one** computer/smartphone-literate staff member? **If not, decline or price for heavy support.**
- [ ] Have you seen their current report card format?
- [ ] Do they know their assessment scheme (CA/exam split)?
- [ ] Are they mid-term? (Weeks 12–14 = **do not onboard**. Book them for next term.)
- [ ] Can you commit ~6 founder-hours in the next two weeks?

> **Onboarding limit: 3 schools per month.** Exceeding it is how you fail results
> week for everyone at once.

---

## Stage 1 — Expectation setting (🔴 do this before payment)

Have this conversation **and record that you had it**. It is the single best
protection against a week-13 dispute.

- [ ] Showed a real report card the platform produces
- [ ] 🔴 **Said explicitly: attendance, report-card comments and affective traits are not available yet**
- [ ] 🔴 **Said explicitly: password reset goes through us, not self-service**
- [ ] 🔴 **Explained the sync rule** — unsynced scores live only on the teacher's device
- [ ] Explained enrollment is **per term**
- [ ] Explained subscription = **120 days from payment date**, so don't pay early
- [ ] Explained student promotion is manual (and that we'll do it for them)
- [ ] Sent [School Operations Manual](../manuals/02-school-operations-manual.md), [T&Cs](../legal/terms-and-conditions.md), [Privacy Policy](../legal/privacy-policy.md), [DPA](../legal/data-processing-addendum.md), [SLA](../legal/service-level-agreement.md)
- [ ] Confirmed who signs and who pays

**Date of this conversation:** ______  **With whom:** ______

> Write the gaps into the WhatsApp chat so there is a timestamped record. If a
> proprietor later says "you never told us about attendance", the chat answers it.

---

## Stage 2 — Account creation (~15 min)

- [ ] Created school in `/dashboard/super-admin/schools`
- [ ] 🔴 **Verified the auto-generated slug before saving** (it is permanent)
- [ ] 🔴 **Copied the temporary password into their WhatsApp chat before closing the modal** — it is shown once only
- [ ] Sent login URL `nexaforges.me/login` (not the super-admin URL)
- [ ] Confirmed they logged in and changed the password
- [ ] Verified `schools.admin_id` is set
- [ ] Verified one `academic_years` row exists and `is_current` is true

---

## Stage 3 — Structure (~1 hour, with them on a call)

- [ ] Academic session confirmed / created, marked current
- [ ] **Terms created** (First, Second, Third) with dates
- [ ] Classes created — exact names they use (e.g. "JSS 1A", not "Class 1")
- [ ] Subjects created
- [ ] Subjects linked to each class
- [ ] School settings: logo, motto, address, phone, principal's signature
- [ ] Grading scale confirmed (WAEC A1–F9 default, or custom bands)

---

## Stage 4 — People

- [ ] Students imported (bulk by admission number where possible)
- [ ] Student count matches their register: ours ___ vs theirs ___
- [ ] 🔴 **All students enrolled into classes for the CURRENT term**
- [ ] Teacher accounts created
- [ ] Each teacher's password delivered **and login confirmed**
- [ ] 🔴 **Teacher assignments created** (teacher → class → subject) — without this their dashboards are empty
- [ ] Form teachers set on classes

**Verification query:**
```sql
select c.name as class, count(e.id) as enrolled
from public.classes c
left join public.enrollments e
  on e.class_id = c.id and e.term_id = '<current-term-uuid>'
where c.school_id = '<school-uuid>' and c.is_deleted = false
group by c.name order by c.name;
```
- [ ] Ran this and confirmed no class shows 0 unexpectedly

---

## Stage 5 — Assessments (🔴 the accuracy gate)

- [ ] Assessments created for each class + subject + current term
- [ ] `max_score` correct for each
- [ ] 🔴 **Weights sum to exactly 1.00 per class+subject** — check every one, nothing validates this
- [ ] Confirmed the scheme in writing with the school (e.g. CA1 20% / CA2 20% / Exam 60%)

**Weights written confirmation from:** ______ on ______

> A wrong weight is the most damaging silent error in the system. It reaches every
> parent and destroys trust in the platform's arithmetic. Five minutes here.

---

## Stage 6 — Training (~2 hours)

**Admin session (1h)**
- [ ] Adding students · enrollment per term · teacher assignments
- [ ] Creating assessments and the 1.00 weight rule
- [ ] Printing report cards (Chrome, laptop, background graphics on)
- [ ] Billing
- [ ] How to reach support and what to include

**Teacher session (45 min, all teachers together)**
- [ ] Login
- [ ] Score entry
- [ ] 🔴 **The sync rule** — "sync until pending = 0 before you finish for the day"
- [ ] 🔴 **"Never clear your browser data"**
- [ ] Printing their own class results
- [ ] Gave every attendee the staff-room quick-reference card
- [ ] Recorded the session for reuse

**Trained:** ___ of ___ teachers on ______

---

## Stage 7 — 🔴 GO-LIVE GATE

> **A school is not onboarded until all four are true.** Anything less is
> *registered*, and registered schools churn.

- [ ] **A real teacher** entered **real scores** for a **real class**
- [ ] Those scores **synced successfully** (pending count = 0)
- [ ] `compiled_results` populated for that class+term — 🔴 **verify, don't assume** (`GAP-6`):
  ```sql
  select count(*) from public.compiled_results
  where class_id = '<class-uuid>' and term_id = '<term-uuid>';
  ```
- [ ] **One report card printed and visually checked** by the school

**Gate passed on:** ______   **Founder hours spent:** ______

> Record the hours honestly. Watching this number fall from ~40 to ~8 across
> schools is the only proof that onboarding is becoming a repeatable process
> rather than heroics (`business/08` §7).

---

## Stage 8 — Website (optional, 30 min)

- [ ] Hero, About, Contact completed
- [ ] Logo and theme colour set
- [ ] Gallery photos uploaded
- [ ] Contact email verified as one they actually check
- [ ] Site loads at `{slug}.nexaforges.me` (tested in incognito)
- [ ] Custom domain (Premium only): `schools.domain` set, DNS pointed, TLS issued

---

## Stage 9 — Commercial close

- [ ] Plan confirmed and matches actual student/staff counts
- [ ] Payment received, or trial expiry diarised
- [ ] `subscription_expires_at` verified correct
- [ ] Renewal reminder diarised for **21 days before expiry**
- [ ] Signed T&Cs on file (if using signature)
- [ ] Added to CRM sheet with expiry date

---

## Stage 10 — First term follow-up

- [ ] **Week 1** — "Any questions?" check-in
- [ ] **Week 3** — Is anyone entering scores? *(If not, intervene now — this is the churn signal)*
- [ ] **Week 6** — Adoption check: what % of teachers are active?
- [ ] **Week 11** — 🔴 Pre-exam audit ([`../manuals/01` §13](../manuals/01-admin-operations-manual.md))
- [ ] **Week 13** — Results-week standby
- [ ] **Week 14** — Renewal ask + testimonial request (with written consent) + **referral ask**

> 🔴 **Week 3 is the highest-leverage check-in of the term.** A school with zero
> score entries in week 3 has already churned and hasn't told you. Call the
> principal, not the admin.

---

## Notes / issues encountered

| Date | Issue | Resolution | Should it become a product fix? |
|---|---|---|---|
| | | | |

---

## Sign-off

| | Name | Date |
|---|---|---|
| School confirms setup complete | | |
| Founder confirms gate passed | | |
