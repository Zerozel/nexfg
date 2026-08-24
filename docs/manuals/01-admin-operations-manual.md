# 01 — Admin Operations Manual (Super Admin)

> 🔴 **INTERNAL ONLY. NEVER SEND THIS FILE TO A SCHOOL.**
> Sections 11 and 12 document product gaps in plain language. In a dispute, this
> document is evidence that you knew. That is fine — knowing and mitigating is
> defensible; the *workarounds* are here precisely so you are covered. But a
> customer must receive [`02-school-operations-manual.md`](./02-school-operations-manual.md) instead.

**Version 1.0 — 24 August 2026 · Owner: Founder · Review: end of every term**

---

## Contents

1. [What you are operating](#1-what-you-are-operating)
2. [Your access, and how not to lose it](#2-your-access-and-how-not-to-lose-it)
3. [The permission model — who can see what](#3-the-permission-model--who-can-see-what)
4. [Creating a school (the single most important operation)](#4-creating-a-school-the-single-most-important-operation)
5. [Managing an existing school](#5-managing-an-existing-school)
6. [Subscriptions, money, and what actually happens](#6-subscriptions-money-and-what-actually-happens)
7. [The academic data chain — the order that cannot be broken](#7-the-academic-data-chain--the-order-that-cannot-be-broken)
8. [Score entry and offline sync — how it really works](#8-score-entry-and-offline-sync--how-it-really-works)
9. [Report cards and printing](#9-report-cards-and-printing)
10. [School websites](#10-school-websites)
11. [Backups, restores and the five critical operations](#11-backups-restores-and-the-five-critical-operations)
12. [Known gaps and the workarounds that cover them](#12-known-gaps-and-the-workarounds-that-cover-them)
13. [The termly operating rhythm](#13-the-termly-operating-rhythm)

---

## 1. What you are operating

A single Next.js application on one Supabase project, serving three audiences from
the same database:

| Surface | URL | Who |
|---|---|---|
| Marketing site | `nexaforges.me` | Prospects |
| Platform login | `nexaforges.me/login` | School admins, principals, teachers |
| Super-admin login | `nexaforges.me/super-admin/login` | **You only** |
| School public website | `{slug}.nexaforges.me` or their custom domain | Parents, public |
| Report card print views | `nexaforges.me/report-cards/...` | Staff |

**Tenant isolation is enforced by `school_id` inside the JWT's `app_metadata`,**
read by both the routing guard and PostgreSQL Row-Level Security `[CODE]`.

> 🔴 **The most important technical fact in this manual.**
> `role` and `school_id` must live in **`app_metadata`**, never `user_metadata`.
> The login forms, the proxy guard, and every RLS policy read
> `auth.jwt() -> 'app_metadata'`. If you ever create a user by hand and put these
> in `user_metadata`, that user will either be unable to log in or — far worse —
> **see another school's data**. Always create users through the app's own
> screens, which do this correctly `[CODE]`.

### Roles that exist

| Role | Dashboard | Scope |
|---|---|---|
| `super_admin` | `/dashboard/super-admin` | Everything, every school |
| `admin` | `/dashboard/admin` | One school, full control |
| `principal` | `/dashboard/admin` | **Identical to `admin`** — same nav, same permissions `[CODE]` |
| `teacher` | `/dashboard/teacher` | Own school; only classes/subjects assigned to them |

> `principal` and `admin` are functionally the same today. Do not promise a
> principal a restricted "view-only" account — it does not exist. If a proprietor
> asks for one, tell them the truth: *"Both accounts can edit. I'd suggest one
> admin account for the person doing data entry."*

---

## 2. Your access, and how not to lose it

You are a single point of failure with no colleague to call. Treat credentials as
the company's most valuable asset — they are more valuable than the code, because
the database cannot currently be rebuilt from source (`[GAP-5]`, §12).

### The five credentials that matter

| Credential | Where it lives | If lost |
|---|---|---|
| Super-admin login | Your password manager | Recoverable via Supabase dashboard |
| Supabase project owner | Supabase account (email + MFA) | 🔴 **Company-ending.** Nothing else recovers this. |
| `SUPABASE_SERVICE_ROLE_KEY` | Hosting env vars | Rotatable, but rotation breaks the app until redeployed |
| Paystack account | Paystack dashboard | Revenue stops; schools can't pay |
| Domain registrar (`nexaforges.me`) | Registrar account | Every school website goes dark |

### 🔴 Do this within the next 48 hours if not already done

- [ ] Enable **MFA on the Supabase account** and on the domain registrar
- [ ] Put all five credentials in one password manager
- [ ] Write the password-manager master password and MFA recovery codes on paper, seal it, and give it to **one trusted person** with written instructions to open it only if you are unreachable for 7 days
- [ ] Confirm Supabase **Point-in-Time Recovery** or daily backups are actually enabled — check, don't assume (§11)

> The sealed envelope is not paranoia. `business/08` §6 identifies founder
> unavailability during results week as the scenario in which *schools lose their
> term.* This costs ₦0 and takes 20 minutes.

### The service-role key

`SUPABASE_SERVICE_ROLE_KEY` **bypasses all Row-Level Security.** It is used by
every super-admin route, the Paystack webhook, and custom-domain lookups `[CODE]`.

Rules:
1. Never paste it into a browser, a chat, an AI tool, or a client-side file.
2. It must only ever appear in server environment variables.
3. If it is exposed, rotate it in Supabase and redeploy **immediately** — an
   exposed key is full read/write access to every school's student records, which
   is a reportable NDPA breach.

---

## 3. The permission model — who can see what

Understanding this saves you from the two worst support calls: *"I can't see my
class"* and *"why can this person see that?"*

### Enforcement happens in three independent layers

| Layer | File | What it does |
|---|---|---|
| Routing guard | `src/proxy.ts` | Blocks wrong-role users from `/dashboard/*` and redirects them to their own dashboard `[CODE]` |
| API guards | `super-admin-auth.ts`, `school-admin-auth.ts` | Reject requests lacking the right role or a `school_id` `[CODE]` |
| Database RLS | Supabase policies | Filters every row by `school_id` from the JWT `[CODE]` |

Layer 3 is the one that actually protects tenants. Layers 1 and 2 are convenience
and defence-in-depth.

### Teacher visibility — the exact rule

A teacher may access a class if **either**:
- they are assigned to a subject in it (`class_subjects.teacher_id = them`), **or**
- they are that class's form teacher (`classes.teacher_id = them`) `[CODE]`

**Consequence you will meet constantly:** a teacher who has been given a subject
verbally but not *in the system* sees nothing and will report the app as broken.
The fix is always the same — Teacher Assignments (§7, step 7). It is never a bug.

### Billing permissions

Only `admin` and `principal` may touch billing. Teachers are rejected with 403
`[CODE]`. A school-less account is rejected with 400. So a teacher asking *"where
do I pay?"* should be redirected to the proprietor — the teacher's account
structurally cannot pay.

---

## 4. Creating a school (the single most important operation)

**Where:** `/dashboard/super-admin/schools` → Create School
**Time:** 15 minutes for this step; ~6 hours for full onboarding (§13)

### What one click actually does — in order `[CODE]`

1. Generates `slug` from the school name (lowercased, non-alphanumerics → `-`)
2. Sets `subdomain` = `{slug}.nexaforges.me`
3. Inserts the `schools` row, with status `trial` (if tier = trial) or `active`
4. If trial: sets `subscription_expires_at` = **now + 30 days**
5. Creates the Supabase auth user with `email_confirm: true` (so they can log in immediately — no verification email)
6. Writes `role: 'admin'` and `school_id` into **`app_metadata`** ✅
7. Inserts the `profiles` row
8. Sets `schools.admin_id`
9. Seeds the first academic session (e.g. "2026/2027") as `is_current`
10. Returns the **temporary password, shown once**

### 🔴 Two things that will bite you

**The password is displayed exactly once.** It is generated, returned in the API
response, and never stored in readable form. If you close that modal without
copying it, you cannot retrieve it — you must reset the password manually in
Supabase (§12, `[GAP-1]`).
→ **Always paste it into the school's WhatsApp chat before closing the modal.**

**Rollback is partial.** If auth-user creation fails, the school row is deleted.
If the *profile* insert fails, both the auth user and school are deleted `[CODE]`.
But if step 8 or 9 fails, **the school exists in a half-configured state** — the
API still returns success. If a newly created school behaves oddly, check that
`schools.admin_id` is set and that one `academic_years` row exists.

### Naming rules — get these right at creation

| Field | Rule | Why |
|---|---|---|
| School name | Their **exact legal/branding name** | It appears on every report card and their website |
| Slug | Auto-generated — **check it before saving** | It becomes their permanent public URL. Changing it later breaks every link and any custom domain. |
| Admin email | The proprietor's or bursar's real, working email | It is the Paystack payer email and the only account-recovery path |

> Slug collisions are **not checked** `[VERIFY]`. Two schools named "Bright Star
> Academy" would generate the same slug and the second insert will fail (or
> collide). If creation fails with a database error, this is the first thing to
> suspect — disambiguate the name (e.g. "Bright Star Academy Ikeja").

### Immediately after creation

- [ ] Copy the temporary password into the school's WhatsApp chat
- [ ] Send login URL `https://nexaforges.me/login` (**not** the super-admin URL)
- [ ] Tell them to change the password at first login — and that **you cannot see it**
- [ ] Open [`../templates/onboarding-checklist.md`](../templates/onboarding-checklist.md), copy it for this school, and work through it
- [ ] Record the school in your CRM sheet

---

## 5. Managing an existing school

**Where:** `/dashboard/super-admin/schools/{id}`

### Available actions and their exact effects

| Action | Effect in the database | Reversible? |
|---|---|---|
| **Suspend** | `subscription_status → 'inactive'` | Yes — unsuspend restores `trial` or `active` based on tier `[CODE]` |
| **Change status** | Sets `subscription_status`, `subscription_tier`, `subscription_expires_at` directly | Yes |
| **Delete** | Sets `is_deleted = true` (soft delete) — the school disappears from listings; data remains | Yes, via SQL |
| **View details** | Read-only school + admin info | — |

### 🔴 What "Suspend" does not do

**Suspension does not currently block anything.** It changes a status field and
paints a red badge. No route, guard, or UI prevents a suspended school from
logging in and using the system `[GAP-2]`.

So if you suspend a non-paying school and expect them to feel pressure — they
will not notice. To actually withhold service today you must either:

- **Preferred:** talk to them. A phone call from the founder is more effective than a status flag, and preserves the relationship.
- **Enforce it manually:** in Supabase → Authentication, ban/disable the school's user accounts. 🔴 Record every account you disable, because you must re-enable each one manually on payment.

> Do not use manual account-banning during weeks 12–14. Locking a school out
> during results week guarantees churn *and* damages the referral cluster
> (`business/06`). Collect the debt after the reports are printed.

### Restoring a soft-deleted school

There is no UI. In the Supabase SQL editor:

```sql
-- Confirm first
select id, name, is_deleted from public.schools where name ilike '%school name%';

-- Then restore
update public.schools set is_deleted = false where id = '<school-uuid>';
```

> Always run the `select` before the `update`. Every SQL block in this manual is
> written so you can copy it while tired — never skip the confirmation query.

---

## 6. Subscriptions, money, and what actually happens

### The plans `[CODE]`

| Plan | Price / term | Students | Staff |
|---|---:|---|---|
| Starter | ₦15,000 | 200 | 10 |
| Growth | ₦30,000 | 500 | 30 |
| Premium | ₦60,000 | Unlimited | Unlimited |
| `trial` (lifecycle) | ₦0 | 100 | 10 |
| `free` (lifecycle) | ₦0 | 50 | 5 |

A term is **120 days** (`PLAN_TERM_DAYS`). Every successful payment sets
`subscription_expires_at = now + 120 days` `[CODE]`.

> 🔴 **Payment extends from *today*, not from the previous expiry date.** A school
> that pays two weeks early **loses those two weeks.** Never encourage early
> payment for the current cycle; ask on the day of expiry or after. If a school
> does pay early and notices, fix it manually via Change Status by setting
> `subscription_expires_at` to the correct date.

### The payment flow

```
Admin picks plan (/dashboard/admin/billing)
  → POST /api/subscriptions/initialize
      · creates reference "nexa-{timestamp}-{random}"
      · inserts subscription_payments row, status 'pending'
      · returns Paystack authorization_url
  → School pays on Paystack
  → Paystack calls POST /api/webhooks/paystack   ← the source of truth
      · verifies signature (rejects 401 if invalid)
      · charge.success → payment 'success', school 'active', expiry +120d
  → Browser lands on /payment/success
```

**The webhook, not the browser redirect, is what activates a school.** If a school
closes the browser mid-redirect, the payment still lands. Conversely, if the
webhook is not reachable, a school can pay and **not** be activated — this is the
single highest-risk money failure. See RB-20 in the runbook.

### Safety mechanisms already built in — trust these

| Mechanism | Behaviour `[CODE]` |
|---|---|
| **Signature verification** | Unsigned/forged webhooks rejected with 401 — nobody can grant themselves a subscription |
| **Idempotency** | A redelivered `charge.success` is ignored if the reference is already `success` — a term cannot be extended twice |
| **Unknown plan guard** | A charge with a missing/unrecognised plan is ignored rather than defaulted — prevents granting the wrong tier |
| **Failed charge isolation** | `charge.failed` touches only the payment ledger; an active school is never downgraded by a failed card |
| **Always ACK** | The webhook returns 200 so Paystack stops retrying |

### Cancellation

`POST /api/subscriptions/cancel` sets `subscription_status = 'inactive'` **and
does not cancel anything at Paystack** `[CODE]`. The code comment states access
remains until expiry is enforced — and expiry is not enforced (`[GAP-2]`).

**Therefore:** when a school says "cancel", you must also
1. verify in the Paystack dashboard that no recurring plan/authorisation will charge them again, and
2. note the true end date, and
3. reply in writing: *"Cancelled. You keep access until {date}. Nothing further will be charged."*

Skipping step 1 risks charging a school that cancelled — the fastest way to a
chargeback and a hostile WhatsApp message to fifteen other proprietors.

### Reconciliation — 🔴 do this every Friday, 10 minutes

Because expiry isn't enforced and plan limits may not be, revenue can leak
silently. There is no dashboard for this; run it:

```sql
-- 1. Schools expiring in the next 21 days → start renewal (SOP-3)
select name, subscription_tier, subscription_status, subscription_expires_at
from public.schools
where is_deleted = false
  and subscription_expires_at between now() and now() + interval '21 days'
order by subscription_expires_at;

-- 2. Schools past expiry but still marked active → the leak
select name, subscription_tier, subscription_expires_at
from public.schools
where is_deleted = false
  and subscription_expires_at < now()
  and subscription_status in ('active','trial')
order by subscription_expires_at;

-- 3. Payments stuck 'pending' > 1 hour → someone may have paid without activation
select p.reference, s.name, p.amount, p.plan, p.created_at
from public.subscription_payments p
join public.schools s on s.id = p.school_id
where p.status = 'pending' and p.created_at < now() - interval '1 hour'
order by p.created_at desc;
```

Query 3 is the one that protects your reputation. Cross-check any result against
the Paystack dashboard: if Paystack shows the charge as successful, the webhook
failed to process it — fix it by hand (RB-20) and apologise proactively.

---

## 7. The academic data chain — the order that cannot be broken

🔴 **This is the most useful section in the manual.** Almost every "it's not
working" call is a link missing from this chain. Each step depends on all the
steps above it. Work top-down, always.

```
1  Academic Session (e.g. 2026/2027)   ← seeded at school creation
2  Terms (First / Second / Third)       ← must exist before assessments
3  Classes (JSS1A, JSS1B …)             ← needs a session
4  Subjects (Mathematics, English …)    ← school-wide list
5  Class–Subject links                  ← which subjects each class offers
6  Students                             ← the person record
7  Enrollments  (student → class → term) ← 🔴 the step everyone forgets
8  Teachers                             ← staff accounts
9  Teacher Assignments (teacher → class + subject)
10 Assessments (CA1, CA2, Exam + max_score + weight)
11 Scores                               ← entered by teachers
12 compiled_results                     ← what report cards actually read
13 Report card / result sheet
```

### The diagnostic question, in order

When someone says *"X isn't showing"*, walk the chain downward and stop at the
first "no":

| Symptom | First thing to check | Chain step |
|---|---|---|
| Teacher sees no classes | Is there a Teacher Assignment? | 9 |
| Class has no students in score entry | Are students **enrolled** for the **current term**? | 7 |
| Nothing to enter scores into | Do Assessments exist for that class+subject+term? | 10 |
| Subject missing for a class | Class–Subject link | 5 |
| Report card blank / missing subjects | `compiled_results` for that class+term | 12 |
| Wrong total on report card | Assessment `weight` values | 10 |

> **Steps 6 and 7 are separate, and this is the #1 source of confusion.**
> Creating a student does **not** put them in a class for the term. `students`
> holds the person; `enrollments` holds "this student is in this class this term"
> `[CODE]`. A school that adds 40 new students and doesn't enroll them will see an
> empty score sheet and conclude the app is broken.

### Enrollment — three ways `[CODE]`

`POST /api/admin/enrollments` branches on the payload:

| Method | Payload | Use when |
|---|---|---|
| Single | `student_id, class_id, term_id` | One new student |
| Bulk by ID | `student_ids[]` | Selecting many in the UI |
| **By admission number** | `admission_numbers[]` | 🔴 **Your onboarding weapon** — paste a list from their existing register |

Bulk operations return `{ enrolled, failed, errors }` — they are **partial**: some
rows can succeed while others fail. Always read the `failed` count aloud to the
school rather than saying "done". Typical failure: an admission number that
doesn't match any student (whitespace or a typo — the lookup trims and requires
an exact match).

### New session / new term rollover — 🔴 the once-a-year trap

At the start of a new session the school must:
1. Create the new Academic Session and mark it `is_current`
2. Create its Terms
3. Create/verify Classes for the new session
4. **Re-enroll every student into their new class for the new term**

Step 4 is not automatic. There is **no promotion feature** — nothing moves JSS1A
students into JSS2A `[GAP]`. Plan for this: it lands in September, the busiest
week of your year, for every school at once.

**Mitigation:** offer it as a paid or goodwill service and do it yourself by SQL
in minutes rather than letting a school do it by hand over days. Draft, verify,
then run:

```sql
-- Preview: who would be promoted from one class to the next
select s.full_name, s.admission_number, c_old.name as from_class
from public.enrollments e
join public.students s on s.id = e.student_id
join public.classes c_old on c_old.id = e.class_id
where e.class_id = '<old-class-uuid>'
  and e.term_id  = '<old-term-uuid>'
  and s.is_deleted = false
order by s.full_name;

-- Promote (after confirming the list above and the two target UUIDs)
insert into public.enrollments (student_id, class_id, term_id, enrollment_date)
select e.student_id, '<new-class-uuid>', '<new-term-uuid>', now()
from public.enrollments e
join public.students s on s.id = e.student_id
where e.class_id = '<old-class-uuid>'
  and e.term_id  = '<old-term-uuid>'
  and s.is_deleted = false;
```

> 🔴 Run the preview, count the rows, and confirm the number with the school
> **before** the insert. Take a database backup first (§11). Repeaters must be
> excluded manually — ask which students are not being promoted before you start.

### Assessments — where weights go wrong

Each assessment has `type` (`exam` | `test` | `quiz`), `max_score` (> 0) and
`weight` (**0 to 1**) `[CODE]`.

Typical Nigerian scheme:

| Assessment | max_score | weight |
|---|---:|---:|
| CA1 | 20 | 0.20 |
| CA2 | 20 | 0.20 |
| Exam | 100 | 0.60 |
| **Total** | | **1.00** |

**Weights must sum to 1.00 per class+subject+term.** Nothing in the system
validates this `[GAP]`. If they sum to 0.8, every student's total is silently 20%
low — and nobody notices until a parent recalculates. Check the sum during
onboarding, and again in week 11 for any school that changed its scheme.

### Grading scale `[CODE]`

WAEC A1–F9 is the default: A1 80–100, B2 75–79, B3 70–74, … E8 45–49, F9 0–44.
Schools may define custom bands; if a score matches no band, the **lowest** band
is applied — so a broken custom scale shows up as unexpected F9s, not as an error.

---

## 8. Score entry and offline sync — how it really works

This is your strongest technical asset (`business/02` §5) and the source of your
scariest failure mode. Know it exactly.

### The mechanism `[CODE]`

1. A teacher types a score → written **immediately to browser `localStorage`**
   under `nexaforge_scores_{classId}`, marked `synced: false`
2. Sync sends pending records to the `scores-bulk` Edge Function in batches of
   **up to 1,000**
3. Each batch retries up to **3 times** with exponential backoff (1s, 2s, 4s)
4. Successful records are marked `synced`, then cleared from local storage
5. Failed records **stay local** with `last_sync_error` and can be retried

### What is safe

| Property | Meaning for the school |
|---|---|
| Per-record error attribution | One bad score doesn't block the other 999 |
| Idempotent upsert | Syncing twice doesn't duplicate; re-entering a score overwrites cleanly |
| Server-side tenancy check | The Edge Function re-validates `school_id` from the JWT — a teacher cannot write into another school |
| Survives refresh & reboot | `localStorage` persists across browser and device restarts |
| Partial success reported | HTTP 207 with an error list, rather than silent loss |

### 🔴 What is not safe — say this in every training session

**Unsynced scores exist in exactly one place: that one browser on that one
device.** They are not on the server. Therefore they are lost — permanently, with
no recovery path — if the teacher:

- clears browsing data / "clears cache" (a very common Nigerian phone habit for freeing space)
- used **private/incognito** mode
- uninstalls or resets the browser or phone
- switches to a different phone or laptop expecting to find their work
- uses a "cleaner"/booster app that wipes site data

There is no server-side draft, and you cannot recover it for them.

**The rule to teach, verbatim:**
> *"Enter scores offline as much as you like — but before you close your work for
> the day, get online and press Sync until the pending count reads zero."*

**Your operational check:** in week 11 and again in week 12, ask every school:
*"Does any teacher have a pending-sync count above zero?"* Chasing this before
exams is far cheaper than recreating a class's marks from paper afterwards.

### Sync failure triage

| Error text | Cause | Fix |
|---|---|---|
| `Max 1000 records per request` | A batch exceeded the cap | Sync one class at a time |
| `Unauthorized` / `Invalid token` | Session expired while offline | Log out, log back in, sync again — **the local scores survive this** |
| `Forbidden - Insufficient permissions` | No `school_id` in the JWT | Account created incorrectly — recreate it via the app (§1) |
| `student_id is not a valid UUID` | Cache references a deleted student | The student was removed after entry; re-enter that one score |
| Fails on 3 attempts, network fine | Server/Edge Function issue | Check Supabase Edge Function logs. **Tell the teacher not to clear the browser** — data is still local and safe. |

---

## 9. Report cards and printing

### Routes `[CODE]`

| Route | Produces |
|---|---|
| `/report-cards/student/select` | Pick a student |
| `/report-cards/student/{id}/print` | One report card |
| `/report-cards/class/{classId}/print` | Class broadsheet / result sheet |
| `/report-cards/batch` → `/batch/print` | Every card in a class, one page each |

### 🔴 The dependency you must verify before every results week

Report cards read the **`compiled_results`** table — one row per
student-per-subject, holding `score`, `grade`, `subject_position`,
`overall_position`, `remarks` `[CODE]`.

**Nothing in this repository writes to that table.** Compilation happens
elsewhere — a database trigger, a Supabase function, or a manual step — and I
could not verify it exists.

> **Do this before week 12, in a real school with real scores** `[VERIFY]`:
> 1. Enter and sync scores for one class
> 2. `select count(*) from public.compiled_results where class_id = '<uuid>' and term_id = '<uuid>';`
> 3. If the count is 0 → **report cards will print empty for every school**, and you will discover it under maximum pressure.
>
> If it is 0, this is your highest-priority engineering task, ahead of everything
> in `business/02`.

### Fields that will print blank today

| Field | Why | What to tell the school |
|---|---|---|
| **Attendance** (days present/absent) | Not tracked; hard-coded `null` `[GAP-4]` | Be upfront at onboarding: *"Attendance isn't on the card this term."* Do not let them discover it in week 13. |
| Affective traits | Template renders them; no entry UI found `[GAP]` | Same |
| Teacher / principal comments | Same | Same |

> 🔴 Say this **at onboarding**, in writing, not when they call in week 13. A gap
> disclosed early is a roadmap item; the same gap discovered under pressure is a
> broken promise — and in a referral market that is a distribution failure, not a
> support ticket (`business/02`).

### Printing practicalities

- Print from **Chrome on a laptop**; phone printing is unreliable
- Layout is A4 via `print.css`; set margins to Default and enable "Background graphics" or grade colours vanish
- Batch print 40 cards at a time — larger jobs can exhaust browser memory on low-end machines
- Always print **one** card and check it before committing to 400

---

## 10. School websites

Every school gets `{slug}.nexaforges.me` automatically. `src/proxy.ts` rewrites
subdomain traffic to `/school/{slug}` `[CODE]`.

| Section | Source | Notes |
|---|---|---|
| Hero, About, Contact, Gallery, Pricing, Social | School Settings → Website | Editable by school admin |
| Theme | `website_theme.primary_color` (hex) + font from a fixed list of 5 | Validated; invalid hex is rejected |
| Visibility | `website_enabled` | Must be `true` for custom domains to resolve `[CODE]` |

**Not built:** news/blog, admissions applications `[GAP]`. The FAQ implies these
exist — align the copy (`business/02` H4).

### Custom domains (Premium)

`proxy.ts` resolves a custom domain by looking up `schools.domain` where
`website_enabled = true`. To set one up:

1. Set `schools.domain` to their bare domain (e.g. `brightstar.com.ng`)
2. Ensure `website_enabled = true`
3. Add the domain in your hosting provider (TLS certificate issuance)
4. Have the school point DNS at the host
5. Verify in an incognito window

There is **no UI** for step 1 — it's a SQL update:

```sql
update public.schools
set domain = 'brightstar.com.ng', website_enabled = true
where id = '<school-uuid>';
```

> Every custom domain is manual founder work plus a DNS dependency you don't
> control. Fine below ~10 Premium schools; price accordingly and never promise
> same-day setup (DNS propagation alone can take 24–48h).

---

## 11. Backups, restores and the five critical operations

### 🔴 The existential risk, stated plainly

`supabase/migrations/` contains **three** migrations. The `schools`, `students`,
`profiles`, `classes`, `enrollments`, `assessments` and `compiled_results` tables
are **not in source control** `[GAP-5]`. Your production database exists only as a
live artefact.

Consequences: no staging environment; no way to test a migration safely; no
rebuild path if the project is lost; the platform is effectively un-sellable and
un-handoverable.

**Fix (3–4 hours, do it this week):**

```bash
# 1. Dump the live schema
supabase db dump --schema-only > supabase/migrations/00000000000001_baseline.sql

# 2. Commit it
git add supabase/migrations/00000000000001_baseline.sql
git commit -m "chore: baseline schema migration"

# 3. Prove it works — a fresh local DB must build from migrations alone
supabase db reset
```

Until `supabase db reset` succeeds, you do not have a recoverable system.

### Backup policy

| What | How | Frequency | Verify |
|---|---|---|---|
| Database | Supabase automated backups / PITR | Daily | 🔴 **Monthly restore test** |
| Schema | The baseline migration above, in git | On change | `supabase db reset` |
| Uploads (logos, signatures) | Supabase Storage | Weekly manual download | Spot-check one file |
| Credentials | Password manager + sealed paper copy | On change | Twice yearly |

> **An untested backup is not a backup.** Once a month, restore to a scratch
> project and confirm one school's students and scores are present. Put it in your
> calendar for the first Saturday of each month — outside term-peak weeks.

### The five critical operations (your continuity runbook)

`business/08` §6 requires these to be written down so someone else could act if
you are unavailable. This is that list.

**1. Create a school** → §4.

**2. Reset a user's password** `[GAP-1]` — there is no in-app flow:
> Supabase Dashboard → Authentication → Users → search the email → ⋯ →
> **Send recovery email** (if their email works) or **Update password** (set a
> temporary one and send it via WhatsApp). Tell them to change it after logging in.

**3. Force a score sync** → have the teacher open the class score screen, go
online, press Sync. You cannot trigger it remotely. If it fails, §8 triage.

**4. Print a batch of report cards** → `/report-cards/batch`, choose class+term,
verify one card, then print. You can do this for any school (super admin bypasses
class restrictions `[CODE]`).

**5. Check/fix a subscription** → §6, plus:

```sql
-- Manually activate a school for one term (e.g. payment received by transfer)
update public.schools
set subscription_status = 'active',
    subscription_tier = 'starter',           -- starter | growth | premium
    subscription_expires_at = now() + interval '120 days',
    updated_at = now()
where id = '<school-uuid>';
```

> Record every manual activation in your support log with the reason and the
> bank reference. Untracked manual activations are how bootstrapped companies
> lose track of their own revenue.

---

## 12. Known gaps and the workarounds that cover them

Each gap has an ID used throughout this folder and in the runbook.

| ID | Gap | Workaround today | Fix | Priority |
|---|---|---|---|---|
| **GAP-1** | No password reset anywhere in the app | Reset manually in Supabase (§11 op 2) | Add `resetPasswordForEmail` + `/forgot-password` + `/reset-password` | 4–6 h · **High** |
| **GAP-2** | Expiry/suspension not enforced; `checkExpiredSubscriptions()` never runs | Weekly SQL reconciliation (§6); phone calls; manual account disable | Wire a scheduled route + a guard/banner that blocks `expired` | 2–3 h · **High** |
| **GAP-3** | No data export, despite a written promise | Export by SQL to CSV from Supabase on request, within 7 days | `/api/admin/export` → ZIP of CSVs | 8–12 h · **High** (legal) |
| **GAP-4** | Attendance not tracked; blank block on every card | Disclose at onboarding; schools write it by hand | Add columns + one termly bulk screen | 8–12 h · Medium |
| **GAP-5** | Database not reproducible from migrations | Rely on Supabase backups only | Commit baseline (§11) | 3–4 h · 🔴 **Critical** |
| **GAP-6** | `compiled_results` writer not found in repo | 🔴 Verify before week 12 (§9) | Build/document compilation | ❓ · 🔴 **Critical** |
| **GAP-7** | Unsynced scores only in `localStorage` | Training + weekly pending-count checks (§8) | Server-side draft scores | Large · Medium |
| **GAP-8** | Plan limits likely unenforced | Check student counts at renewal; upsell | Enforce `PLAN_LIMITS` on create | 2–4 h · Medium |
| **GAP-9** | No student promotion between sessions | Do it by SQL for them (§7) — position it as a service | Promotion tool | 8–16 h · Medium (Sept) |
| **GAP-10** | Assessment weights not validated to sum to 1.0 | Check manually at onboarding and week 11 | Validate per class+subject+term | 2–4 h · Medium |
| **GAP-11** | No audit log of who changed a score | Supabase logs only; unresolvable disputes | `score_history` table | 8 h · Low now, **High at 20 schools** |
| **GAP-12** | No in-app announcements | WhatsApp broadcast | Banner table | 4 h · Low |

### How to talk about a gap without damaging trust

Use this three-part structure — it converts a complaint into a roadmap
conversation and, in a referral market, protects the cluster:

1. **Acknowledge without defensiveness.** *"You're right, attendance isn't on the card this term."*
2. **Give the workaround now.** *"Write it in the space provided; I'll show your staff exactly where."*
3. **Commit to a date, or don't commit at all.** *"It's scheduled for next term. I'll message you the day it ships."*

Never say "that's coming soon" without a date you intend to keep. A missed date
costs more credibility than the missing feature.

---

## 13. The termly operating rhythm

Condensed from `business/08`. The full table lives there; this is what you act on.

| Week | Your job | Non-negotiable |
|---|---|---|
| −2 to 0 | Renewals + onboarding | ≤3 new schools/month |
| 1–2 | Setup, class/subject config | Go-live gate (below) |
| 3–5 | **Selling window** + product work | Best time to sell; use it |
| 6–8 | Support first score entry | The critical adoption moment |
| 9–11 | Programmes + **pre-exam audit** | 🔴 Run the week-11 checklist |
| 12–13 | 🔴 **Results week: all-hands support** | Zero selling, zero onboarding |
| 14 | Renewal ask + testimonials | Ask while value is undeniable |

### Go-live gate

> A school is **not** onboarded until **one teacher has entered real scores for a
> real class and one report card has been printed.** Anything less is *registered*,
> not onboarded — and registered schools churn.

### 🔴 The week-11 pre-exam audit (2 hours, saves your results week)

For every live school:

- [ ] Any teacher with pending unsynced scores? → chase to zero (§8)
- [ ] Assessments exist for every class+subject that needs one? (§7 step 10)
- [ ] Assessment weights sum to 1.00? (`GAP-10`)
- [ ] All students enrolled for **this** term? (§7 step 7)
- [ ] `compiled_results` populating for one sample class? (`GAP-6`) 🔴
- [ ] Subscription active and not expiring mid-results-week? (§6)
- [ ] Print one test report card and eyeball it

Every item found in week 11 is a 10-minute fix. The same item found in week 13 is
an emergency with a principal shouting down the phone and 400 parents waiting.

---

## Change log

| Version | Date | Change |
|---|---|---|
| 1.0 | 24 Aug 2026 | First issue. Verified against the repository at commit `0be9008`. |

> **Review trigger:** update this manual whenever a `GAP-n` is closed, and re-verify
> §9 (`compiled_results`) at the start of every term.

