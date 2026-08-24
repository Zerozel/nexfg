# 🔴 ACTION REQUIRED — verified defect list

**Generated 24 Aug 2026 against commit `0be9008`.** Every item below was confirmed
by reading the code, not inferred. Exact paths and line numbers are given so you
can start immediately.

> **Read this before you onboard another school.** Items 1 and 2 can destroy a
> results week across every school simultaneously. Item 3 is leaking money right now.

---

## Do them in this order

| # | Problem | Blast radius | Effort | Why this position |
|---|---|---|---|---|
| **1** | `compiled_results` has no writer | 🔴 **All schools, blank report cards** | ❓ verify first | Unknown-unknown. Could be catastrophic or already fine. **Cheapest to check, worst to discover late.** |
| **2** | Migrations can't rebuild the DB | 🔴 **Existential — no recovery path** | 3–4 h | Blocks safe fixing of everything else |
| **3** | Subscription expiry not enforced | 💰 Silent revenue loss, every school | 2–3 h | Losing money today, cheap to fix |
| **4** | No password reset | ⏱️ Your #1 support ticket, forever | 4–6 h | Every week you delay costs you hours |
| **5** | Plan limits not enforced | 💰 Revenue leak | 2–4 h | Same fix session as #3 |
| **6** | No data export | ⚖️ Contract + NDPA breach | 8–12 h | Promised on the site; legally required |
| **7** | Attendance block renders blank | 😞 Every report card, every term | 8–12 h | Fix or remove — decide, don't drift |
| **8** | Offline scores only in `localStorage` | 🔴 Permanent data loss | 12–16 h | Highest effort; mitigate with training now |

**Tonight, if you do nothing else: item 1.** It's a single SQL query.

---

## 1. 🔴 `compiled_results` is read but never written

**Severity: unknown, potentially catastrophic. Verify before your next results week.**

### Evidence

```
src/lib/printing/compiled-results.ts:65    .from("compiled_results")
src/lib/printing/compiled-results.ts:66    .select(...)
```

`grep` across all of `src/` and `supabase/` finds **four files referencing
`compiled_results` and zero `insert`, `upsert` or `update` operations.** Report
cards read this table. Nothing in the repository fills it.

Referencing files:
- `src/app/report-cards/batch/print/page.tsx`
- `src/app/api/report-cards/student/[id]/route.ts`
- `src/lib/printing/compiled-results.ts`
- `src/lib/printing/data-transform.ts`

### Three possible explanations

1. A **database trigger or function** populates it — exists in the DB, not in git.
   *(Likely, given migrations are also missing — see item 2.)*
2. A **manual/SQL step** you run at results time.
3. **It genuinely doesn't work yet** and no school has reached results week.

You need to know which. Right now you don't.

### Verify — run this first

```sql
-- Does the table exist, and does it hold anything?
select count(*) as rows from public.compiled_results;

-- Is anything automatically maintaining it?
select tgname, tgrelid::regclass as on_table
from pg_trigger
where not tgisinternal
  and tgrelid::regclass::text in ('scores','compiled_results','enrollments');

-- Any compile function?
select proname from pg_proc
where proname ilike '%compil%' or proname ilike '%aggregate%result%';
```

### Then

| Result | What it means | Do this |
|---|---|---|
| Rows > 0 **and** a trigger/function exists | Working, just untracked | **Dump that function into `supabase/migrations/`** (item 2). Then stop worrying. |
| Rows > 0, no trigger | Populated manually or by something ad hoc | Find out how. Document it in `manuals/01` §9. Automate it. |
| **Rows = 0** | 🔴 **Report cards will print blank** | **Build compilation now.** This is a launch blocker, not a bug. |

### Acceptance criteria

- [ ] You can state in one sentence what writes `compiled_results`
- [ ] That mechanism is in `supabase/migrations/`
- [ ] You have printed one real report card end-to-end from synced scores
- [ ] `manuals/01` §9 describes the actual behaviour

> 🔴 **Do not skip the printed card.** Verifying the query but not the output is how
> the blank-attendance class of bug survives to week 13.

---

## 2. 🔴 `supabase/migrations/` cannot rebuild the database

**Severity: existential. This blocks safely fixing everything else.**

### Evidence

Only three migrations exist:

```
supabase/migrations/20240101000002_create_scores_table.sql
supabase/migrations/20240101000003_create_academic_years_table.sql
supabase/migrations/20240101000004_create_subscriptions.sql
```

Tables they create: `public.academic_years`, `public.scores`,
`public.subscription_payments`.

**Missing from source control entirely** — despite being used throughout the app:
`schools`, `students`, `profiles`, `classes`, `subjects`, `class_subjects`,
`assessments`, `enrollments`, `terms`, `teacher_assignments`, `compiled_results`.

Also note the numbering starts at `...002`. **`...001` is absent** — so the
original schema migration existed and was lost or never committed.

### Consequences

- **No staging environment.** Every change is tested in production, on real schools.
- **No rebuild path.** If the project is lost, misconfigured, or corrupted, the
  schema exists nowhere but in that one running instance.
- **RLS policies are unversioned.** Your entire tenant-isolation guarantee — the
  thing `legal/data-processing-addendum.md` Annex 3 promises in writing — is
  undocumented and unreviewable.
- The DPA's tenant-isolation claim is currently **unverifiable**. That is a
  contractual exposure, not just a technical one.

### Fix

```bash
# 1. Capture the live schema (structure only, no data)
npx supabase db dump --db-url "$SUPABASE_DB_URL" --schema public -f schema-dump.sql

# 2. Capture RLS policies and functions explicitly
npx supabase db dump --db-url "$SUPABASE_DB_URL" --schema public --data-only=false -f full-dump.sql

# 3. Commit as the baseline
mkdir -p supabase/migrations
mv schema-dump.sql supabase/migrations/20240101000001_baseline_schema.sql
git add supabase/migrations && git commit -m "chore: capture baseline schema, RLS and functions"
```

Then create a second Supabase project, apply the migrations to it, and confirm it
comes up clean. **That project becomes staging** — the thing that lets you fix
items 3–8 without experimenting on live schools.

### Acceptance criteria

- [ ] Every table the app queries appears in `supabase/migrations/`
- [ ] All RLS policies are in version control
- [ ] Whatever writes `compiled_results` (item 1) is captured here
- [ ] A fresh Supabase project can be built from migrations alone
- [ ] That project is your staging environment, and you use it

> **Do this before items 3–8.** They all involve schema or logic changes, and right
> now you have nowhere safe to test them.

---

## 3. 💰 Subscription expiry is never enforced

**Severity: revenue leak, active right now.**

### Evidence

```
src/lib/cron/check-subscription.ts:3    export async function checkExpiredSubscriptions() {
```

`grep -rln "checkExpiredSubscriptions" src/` returns **1 file** — its own
definition. It is imported by nothing, called by nothing, and wired to no cron,
route, scheduler or edge function.

There is also no middleware or API guard that rejects a school whose
`subscription_status` is `expired`.

### Consequence

**Expired schools keep full access indefinitely.** Nobody is forced to renew, and
nothing tells you it's happening. `business/08` §2 states that `expired` blocks
access and marks it `[CODE]` — **that claim is false.** Fix the doc as well as the
code.

### Fix

Two parts. Both are needed; either alone is insufficient.

**(a) Run the check on a schedule** — a Supabase scheduled edge function is
simplest given the stack, and keeps it working regardless of hosting:

```sql
select cron.schedule(
  'expire-subscriptions',
  '0 2 * * *',                     -- 02:00 daily
  $$ update public.schools
     set subscription_status = 'expired', updated_at = now()
     where subscription_expires_at < now()
       and subscription_status = 'active' $$
);
```

**(b) Actually enforce it.** Add a guard in `src/middleware/` (or the shared API
auth helper) that returns 402/403 for a school with `subscription_status =
'expired'`, while **still permitting login and the billing pages** so they can pay.

🔴 **Grace period, deliberately:** give 7 days of read-only access after expiry
rather than a hard cut. A school locked out mid-term with results pending will not
renew — it will churn and tell the cluster. Read-only preserves the pressure to pay
without creating an emergency.

### Acceptance criteria

- [ ] The job runs daily and is verified by flipping one test school's expiry date
- [ ] An expired school cannot enter scores or print report cards
- [ ] An expired school **can** log in and reach billing
- [ ] Grace period behaviour is deliberate and documented
- [ ] `business/08` §2 corrected, and `manuals/01` §6 updated

---

## 4. ⏱️ There is no password reset anywhere in the app

**Severity: your single highest-volume support ticket, permanently.**

### Evidence

`grep -rn "resetPasswordForEmail\|forgot-password" src/` → **no matches.**
No reset page, no reset API route, no link on the login form.

### Consequence

Every forgotten password is a manual job for you in the Supabase dashboard. With
20 schools × ~10 staff each, this alone can consume your week. It is also the
ticket most likely to arrive at 6am during results week, from the one person who
needs to print.

### Fix

```
src/app/(auth)/forgot-password/page.tsx     → email input, calls resetPasswordForEmail
src/app/(auth)/reset-password/page.tsx      → handles the recovery token, sets new password
src/components/auth/LoginForm.tsx           → add "Forgot password?" link
```

Supabase provides both halves — `supabase.auth.resetPasswordForEmail(email)` and
the recovery-token session. This is a few hours, not a project.

🔴 **Then verify the email actually arrives.** Default Supabase SMTP is
rate-limited and lands in spam. Configure a real transactional provider, or this
fix looks complete while quietly failing — which is worse than not having it,
because you'll stop expecting the ticket.

### Acceptance criteria

- [ ] A teacher can reset their own password without contacting you
- [ ] The email arrives within 60 seconds, in the inbox, not spam
- [ ] Tested on a phone browser (that's what teachers use)
- [ ] `manuals/02` Part 2 updated to describe self-service reset
- [ ] `RB-1` in the runbook rewritten — it becomes a 30-second reply

---

## 5. 💰 Plan limits are defined but not enforced

**Severity: revenue leak, silent.**

### Evidence

```
src/lib/paystack/plans.ts:60              export const PLAN_LIMITS: Record<string, {students: number; staff: number}>
src/app/api/subscriptions/status/route.ts:32   const limits = PLAN_LIMITS[tier] || PLAN_LIMITS.free
```

`PLAN_LIMITS` is referenced in exactly **one** place — a status endpoint that
*reports* limits. `src/app/api/admin/students/route.ts` creates students with no
limit check.

### Consequence

A Starter school (200-student cap) can hold 900 students and pay ₦15,000/term. You
have no idea it's happening, and your pricing model in `business/05` assumes tier
discipline that doesn't exist.

### Fix

In `src/app/api/admin/students/route.ts`, before insert: count active students for
the school, compare against `PLAN_LIMITS[tier].students`, and return a clear error
at the cap. Do the same for staff in the teachers route.

🔴 **Warn at 90%, don't just block at 100%.** A school blocked mid-enrolment with
no warning experiences a bug, not a limit. Warn early and the same event becomes an
upgrade conversation — which is what you actually want.

### Acceptance criteria

- [ ] Creating student 201 on Starter fails with a message naming the plan and cap
- [ ] Admin sees a warning at 90% of the limit
- [ ] Existing over-limit schools are **not** retroactively broken (grandfather, then convert at renewal — `RB-24`)
- [ ] Bulk import respects the limit too

---

## 6. ⚖️ There is no data export

**Severity: contractual and NDPA exposure.**

### Evidence

No CSV export, download handler or blob generation exists in `src/`. Import
functionality exists; export does not.

### Consequence

Two distinct problems:

1. **The marketing site promises schools can "export all records at any time."**
   They cannot. That is a misrepresentation in writing.
2. **NDPA data portability.** `legal/data-processing-addendum.md` §7 commits you to
   providing an export within **7 working days**. Today that means you doing it by
   hand in SQL (`RB-33`) — which works at 5 schools and fails at 30.

### Fix

Ship `src/app/api/admin/export/route.ts` producing CSVs for students, scores
(joined to subject/assessment/term for legibility) and compiled results — scoped to
the caller's `school_id`. Add a button in admin settings. The SQL in `RB-33` is
already written and correct; wrap it.

🔴 **Scope every query by `school_id` from the session, never from a request
parameter.** An export endpoint that trusts a client-supplied school ID is a
cross-tenant data breach with a download button.

### Acceptance criteria

- [ ] A school admin can export students, scores and results unaided
- [ ] Files open cleanly in Excel (correct headers, UTF-8, quoted fields)
- [ ] Verified that school A cannot export school B's data by tampering with the request
- [ ] The site's export claim is now true
- [ ] `RB-33` downgraded from manual work to a pointer

---

## 7. 😞 The report card renders an attendance block that is always blank

**Severity: visible on every report card, every term, at the worst moment.**

### Evidence

```
src/app/api/report-cards/class/[classId]/route.ts:120   // `enrollments` has no attendance columns; not tracked yet.
src/app/api/report-cards/class/[classId]/route.ts:121   attendance: null,
src/app/api/report-cards/student/[id]/route.ts:129-131   (same, with comment)
src/components/printing/ReportCardTemplate.tsx:149       {/* Attendance Section */}
```

The template renders an attendance section. The API hard-codes `null`. The comments
confirm this is known and intentional.

### Consequence

Nigerian report cards conventionally show attendance. Parents expect it. A school
discovers the empty box **while printing 400 cards in week 13** — the single worst
moment to find any defect, and the one most likely to end the relationship.

### Fix — choose deliberately

**Option A — remove the block (1 hour).** Hide the section when `attendance` is
null. Cards print clean. Schools write attendance by hand as they always have. **Do
this today regardless** — it costs an hour and removes the surprise.

**Option B — build attendance (8–12 h).** Add columns to `enrollments`
(`days_present`, `days_absent`, `days_total`), a termly entry screen, and populate
the API. Real value, and a genuine differentiator.

🔴 **Do A now, B later.** A blank labelled box is worse than no box: it reads as
broken software rather than a feature you don't have. And until B ships, disclose it
at onboarding — `manuals/02` Part 13 already does.

### Acceptance criteria

- [ ] No card prints with an empty attendance box
- [ ] If B: a school can enter attendance and it appears correctly
- [ ] `manuals/02` Part 13 reflects reality either way
- [ ] `RB-16` updated

---

## 8. 🔴 Offline scores exist only in `localStorage`

**Severity: permanent, unrecoverable data loss. Highest effort — mitigate now, fix properly later.**

### Evidence

Scores are held under `nexaforge_scores_{classId}` in browser `localStorage` until
synced. There is no server-side draft.

### Consequence

A teacher who clears their browser, uses private mode, switches device, or has the
browser evict storage **loses that work permanently**. No backup exists, because the
data never reached you. `RB-10` handles the aftermath, but the honest answer in the
worst case is "it's gone."

This is the failure most likely to lose you a school, because it destroys work the
teacher already did.

### Fix — three layers, cheapest first

**(a) Today — training and UI (free).** The rule is already the first line of
`manuals/02`: *press Sync before closing the browser.* Add a persistent warning
banner while unsynced scores exist, and a `beforeunload` prompt. Put it on the
staff-room sheet.

**(b) This month — visibility (2–3 h).** Show the pending count prominently, and
surface it to the admin dashboard so **you** can see unsynced work across a school
before results week rather than after.

**(c) Properly — server-side drafts (12–16 h).** Debounced autosave of partial
scores to a `score_drafts` table. Reduces the loss window from "until they
remember" to a few seconds.

### Acceptance criteria

- [ ] A teacher cannot close the tab with unsynced scores without an explicit warning
- [ ] Pending count is visible without navigating anywhere
- [ ] Admin can see unsynced scores across their school
- [ ] If (c): scores survive clearing the browser
- [ ] Every teacher has been told the sync rule verbally, not just in a manual

---

## Documentation that contradicts the code

Fix these **when you fix the code**, or the docs become the next source of error.

| File | Claim | Reality |
|---|---|---|
| `business/08` §2 | "`expired` blocks access `[CODE]`" | Not enforced — item 3 |
| Marketing site | "Export all records at any time" | No export exists — item 6 |
| Marketing site / FAQ | Trial length, attendance, stats | Reconcile against `business/02` |
| `legal/data-processing-addendum.md` Annex 3 | Tenant isolation "at the database layer" | True but **unverifiable** — RLS isn't in git (item 2) |
| `legal/service-level-agreement.md` | Restore testing frequency | `[FILL]` — commit only to what you'll do |

> 🔴 **The marketing site and the T&Cs must not contradict each other.** If they
> do, you have manufactured your own evidence in any dispute. This is the cheapest
> item on the page and the easiest to forget.

---

## Before any of this reaches a school

- [ ] **62 `[FILL]` placeholders** — company registration number, address, data
      regions, retention periods. `grep -rn '\[FILL' docs/`
- [ ] **Nigerian lawyer review** of `terms-and-conditions.md`, `privacy-policy.md`
      and `data-processing-addendum.md`. They are drafted by an engineer. They are
      not legal advice.
- [ ] **NDPC registration** if required at your scale — you process children's data
- [ ] **Publish the privacy policy** at a stable public URL, linked from the footer
- [ ] **Reconcile the marketing site** against the table above

---

## Suggested sequence

**Tonight (30 min):** Item 1 verification query. You need to know the answer.

**This week:** Item 2 (schema capture + staging), then items 3 and 5 together —
both are subscription logic, one test cycle. Item 7 Option A is an hour.

**Next two weeks:** Item 4 (password reset — it pays for itself in saved hours),
then item 6 (export — contractual).

**Before the next results week:** Item 8 layers (a) and (b). Item 7 Option B if
time permits.

**Never during weeks 12–14.** No deploys during results periods. `business/08` is
explicit, `legal/service-level-agreement.md` commits you to it, and it is the one
rule that protects you from turning a support week into an outage week.

---

*Every claim here was verified against the code on 24 Aug 2026. If you change the
code, update this file — or delete the item.*
