# 03 — Troubleshooting Runbook

> 🔴 **INTERNAL ONLY.** This is your primary operational tool.
> Structure of every entry: **the school says A → you do B → that achieves C.**

**Version 1.0 — 24 August 2026**

---

## How to use this at 7am during results week

1. **Ctrl+F the school's own words.** Entries are titled with what schools
   actually say, not with technical names.
2. **Read the SEVERITY.** `P1` means drop everything.
3. **Do the steps in order.** They are ordered cheapest-and-most-likely first.
4. **Log it** in [`../templates/incident-and-support-log.md`](../templates/incident-and-support-log.md).
   Any issue logged 3+ times becomes a product fix — that is how founder hours fall.

### Severity definitions

| Level | Meaning | Response |
|---|---|---|
| **P1** | Blocks results, payments or all access | Immediate. Nights and weekends included. |
| **P2** | Blocks one class or teacher | Same day |
| **P3** | Inconvenience with a workaround | 48 hours |
| **P4** | Cosmetic or feature request | Log it; batch it |

### The 30-second triage question

Before anything else, ask: **"Is it one teacher, one class, or the whole school?"**

| Scope | Almost always |
|---|---|
| One teacher | Permissions / assignment (RB-1, RB-2) |
| One class | Enrollment or assessments (RB-5, RB-6) |
| Whole school | Auth, subscription or platform (RB-10, RB-20, RB-30) |

---

## Index

**Access & login** — RB-1 … RB-4
**Missing data** — RB-5 … RB-9
**Scores & sync** — RB-10 … RB-14
**Report cards** — RB-15 … RB-19
**Billing** — RB-20 … RB-24
**Website** — RB-25 … RB-27
**Platform-wide** — RB-30 … RB-34
**Data loss** — RB-40 … RB-42

---

# Access & login

## RB-1 · "I forgot my password" / "I can't log in"

**Severity:** P2 · P1 during results week · **Frequency: highest of all tickets**

**A — What they say:** *"It says invalid credentials."* / *"I've been locked out."*

**B — What you do:**

1. Confirm the exact email they are using (typos and wrong domains are common).
2. Confirm they are at `nexaforges.me/login`, **not** `/super-admin/login`.
3. If genuinely forgotten — there is **no self-service reset** (`GAP-1`):
   > Supabase Dashboard → **Authentication → Users** → search the email → ⋯ →
   > **Send recovery email** (if their inbox is reliable), otherwise
   > **Update password** → set a temporary one.
4. Send the temporary password by WhatsApp, not email.
5. Tell them: *"Change this after you log in. I can't see your password."*
6. Confirm they are in before closing the conversation.

**C — What this achieves:** Access restored in under 10 minutes without touching
their data.

> **Never** create a new account for someone who has an existing one. You will
> split their identity, and the new account may lack `school_id` in
> `app_metadata` — which breaks score sync in a way that is hard to diagnose
> later (see RB-4).

---

## RB-2 · "My teacher logs in but sees no classes"

**Severity:** P2 · **Frequency: very high**

**A — What they say:** *"Her dashboard is empty."* / *"The app isn't working for her."*

**B — What you do:**

1. Ask: *"Has she been assigned to a class and subject in Teacher Assignments?"*
   In ~90% of cases the answer is no.
2. Walk the admin through **Teacher Assignments → add teacher + class + subject**.
3. Have the teacher **log out and back in**, then refresh.
4. If still empty, verify her `profiles.role` is `teacher` and her `school_id` is
   correct.

**C — What this achieves:** Teacher sees her classes immediately. **This is not a
bug** — it is access control working as designed.

> Teach the admin to do this themselves the first time. This single ticket, if you
> don't transfer it, will recur with every new staff member at every school.

---

## RB-3 · "It logged me out by itself"

**Severity:** P3

**B — What you do:**

1. Explain sessions expire for security; logging back in is normal.
2. 🔴 **If they were entering scores:** tell them immediately —
   *"Log back in and press Sync. Your scores are still on the device."*
3. Confirm the pending count reaches zero.

**C — What this achieves:** Prevents the worst outcome — a teacher assuming the
work was lost and clearing the browser, which *actually* destroys it.

---

## RB-4 · "Sync says 'Forbidden — insufficient permissions'"

**Severity:** P1 (scores at risk)

**Cause:** That account has no `school_id` in `app_metadata` — it was created
outside the app's own screens.

**B — What you do:**

1. 🔴 **First, before anything else:** *"Do not close that browser tab and do not
   clear your browser. Your scores are safe on the device."*
2. Verify in Supabase → Authentication → the user → **App Metadata** contains both
   `role` and `school_id`.
3. If missing, add them (correct UUID for the school), then have the teacher log
   out, log back in, and Sync.
4. Investigate how the account was created, and stop doing that.

**C — What this achieves:** Scores sync successfully; no marks lost.

---

# Missing data

## RB-5 · "The class is empty when my teacher tries to enter scores"

**Severity:** P2 · **Frequency: very high**

**A — What they say:** *"There are no students in JSS2A."*

**B — What you do:**

1. Ask: *"Were the students **enrolled** into that class **for this term**?"*
2. Confirm which term is current.
3. Enrollments → select class + current term → enroll by pasting admission numbers.
4. Read back the result: *"38 enrolled, 2 failed"* — never just say "done".
5. Fix the failures (usually a typo or an uncreated student) and re-run.

**C — What this achieves:** Score sheet populates. Enrollment is per-term by
design — creating a student is not the same as placing them in a class.

---

## RB-6 · "There's nowhere to type the scores"

**Severity:** P2

**B — What you do:** Assessments → create one for that class + subject + term
(name, type, max score, weight). Then have the teacher refresh.

🔴 **While you are there, check the weights sum to 1.00** (`GAP-10`). If they add
to 0.8, every total is silently 20% low. Fixing it now costs a minute; finding it
on 400 printed cards costs a week.

**C — What this achieves:** Entry becomes possible, *and* you have pre-empted the
worst silent error in the system.

---

## RB-7 · "A subject is missing for this class"

**Severity:** P3

**B:** Two possibilities, check in order:
1. Does the subject exist in **Subjects**? If not, create it.
2. Is it **linked to that class**? Link it.

**C:** Subject appears for entry and on report cards.

---

## RB-8 · "The totals on the report card are wrong"

**Severity:** P1 (a wrong result reaches parents)

**B — What you do:**

1. Ask for one specific student and the expected total. Never debug in the abstract.
2. Check the assessment **weights** for that class+subject+term — **do they sum to 1.00?**
3. Check each `max_score` is correct (a test marked out of 20 recorded as out of 100 halves everything).
4. Recalculate by hand for that one student and compare.
5. If weights were wrong: correct them, re-verify compilation, reprint.

**C — What this achieves:** Correct results, and the school sees you take accuracy
seriously.

> 🔴 If cards were already distributed, tell the school immediately and help them
> issue corrections. A school that discovers this itself, after you knew, will not
> renew — and will tell the cluster.

---

## RB-9 · "A student is missing from the class list"

**Severity:** P2

**B:** In order —
1. Does the student exist in **Students**? (Search by admission number.)
2. Were they enrolled for **this** term?
3. Were they soft-deleted? Check:
   ```sql
   select full_name, admission_number, is_deleted
   from public.students
   where school_id = '<school-uuid>' and admission_number = '<number>';
   ```
4. To restore: `update public.students set is_deleted = false, deleted_at = null where id = '<uuid>';`

**C:** Student and their history restored, then enrolled correctly.

---

# Scores & sync

## RB-10 · 🔴 "My teacher's scores have disappeared"

**Severity:** P1 · **This is your most dangerous ticket. Read it before it happens.**

**A — What they say:** *"She entered all of JSS2 Maths and it's gone."*

**B — What you do — in this exact order:**

1. 🔴 **STOP THE BLEEDING FIRST.** Before diagnosing, send this:
   > *"Please don't clear your browser, don't reinstall anything, and keep using
   > the same phone/laptop and the same browser until we check."*
2. Establish three facts:
   - **Same device and same browser** as when they entered?
   - Did they ever see a **successful sync**?
   - Has anyone cleared cache/browsing data, or used **incognito**?
3. **If same device, never synced, nothing cleared** → the data is very likely
   still in `localStorage`. Have them open the same class score screen while
   online and press **Sync**. The scores reappear and upload.
4. **If a different device** → the data was never there; it stayed on the first
   device. Get them back to the original device and sync.
5. **If cache cleared or incognito** → 🔴 **the data is gone. There is no
   recovery.** Say so plainly and immediately:
   > *"I'm sorry — those scores were only on that device and hadn't reached our
   > servers. They can't be recovered. Let's get them re-entered from the mark
   > sheets now, and I'll show your staff the one habit that prevents this."*
6. Check whether anything did reach the server before writing it off:
   ```sql
   select s.full_name, sc.score, sc.updated_at
   from public.scores sc
   join public.students s on s.id = sc.student_id
   where sc.assessment_id = '<assessment-uuid>'
   order by sc.updated_at desc;
   ```
7. Offer to enter them yourself from photographed mark sheets. **Do this.** It
   costs you an hour and saves the relationship.
8. Log it as a `GAP-7` occurrence. Three occurrences justify building server-side
   drafts.

**C — What this achieves:** Best case, full recovery. Worst case, honest handling
plus visible effort — which retains schools far better than deflection.

> **Prevention is the whole game here.** Say the sync rule at onboarding, put it
> on the staff-room sheet, and ask about pending counts in weeks 11 and 12.

---

## RB-11 · "Sync is stuck / spinning forever"

**Severity:** P2

**B:**
1. Check they are actually online (open any website).
2. Wait — large classes are batched up to 1,000 records with retries; it can take a minute.
3. If it fails after 3 attempts, note the exact error and use the table in
   [`01` §8](./01-admin-operations-manual.md#8-score-entry-and-offline-sync--how-it-really-works).
4. Try one class at a time.
5. Check Supabase → Edge Functions → `scores-bulk` logs.
6. 🔴 Reassure: *"Nothing is lost. The scores stay on your device until they sync."*

**C:** Sync completes, or you escalate with the local data still intact.

---

## RB-12 · "Some scores synced, others failed"

**Severity:** P2

**B:** This is designed behaviour — per-record errors don't block the batch.
Read the failed list; usually one student was deleted or a value was invalid.
Fix those records and press Sync again. Successful ones will not duplicate
(the upsert is idempotent).

**C:** Full sync with no duplicates.

---

## RB-13 · "The score I typed changed / shows differently"

**Severity:** P3

**B:** Check whether another teacher is assigned to the same class+subject — a
later sync overwrites an earlier value for the same student+assessment. There is
**no audit trail** (`GAP-11`), so you cannot prove who changed what.

**C:** Explain honestly, and recommend one teacher per class+subject. If this
recurs, build `score_history`.

---

## RB-14 · "Can we enter scores on paper and have you upload them?"

**Severity:** P4 — but say yes

**B:** Accept photos of mark sheets and enter them yourself, or via SQL for large
volumes. Cap it at goodwill for the first term.

**C:** A school that would otherwise stall gets to a printed report card — which
is the moment they become a real customer. Beyond one term, this doesn't scale:
convert it into training.

---

# Report cards

## RB-15 · 🔴 "The report cards are blank / empty"

**Severity:** P1

**B — What you do:**

1. Is it **every** card, or one student? Every card = compilation; one = data.
2. Confirm scores actually reached the server:
   ```sql
   select count(*) from public.scores
   where assessment_id in (
     select id from public.assessments
     where class_id = '<class-uuid>' and term_id = '<term-uuid>'
   );
   ```
3. 🔴 Confirm compilation happened (`GAP-6`):
   ```sql
   select count(*) from public.compiled_results
   where class_id = '<class-uuid>' and term_id = '<term-uuid>';
   ```
4. **Scores > 0 but compiled_results = 0** → compilation is the failure. Trigger
   it (function/trigger/manual step per your setup) and re-check.
5. Verify the correct term is selected.
6. Print one card to confirm before telling them it's fixed.

**C — What this achieves:** Cards render. You also learn whether compilation is
reliable — the answer determines your engineering priority.

> 🔴 **Do not wait for this ticket.** Run steps 2–3 in **week 11** for one class at
> every school ([`01` §13](./01-admin-operations-manual.md)). Discovering a
> compilation failure in week 13 across five schools simultaneously is the worst
> operational day this company can have.

---

## RB-16 · "Attendance is blank on the report card"

**Severity:** P3 — **expectation problem, not a technical one**

**B:**
1. Confirm plainly: *"Attendance isn't captured on the platform yet."* (`GAP-4`)
2. Give the workaround: write it by hand, or ask for a template without the block.
3. Give a date only if you will keep it.

**C:** Trust preserved through honesty.

> If this arrives as a *surprise* in week 13, that is an onboarding failure, not a
> support ticket. Disclosure belongs in the onboarding conversation and in
> [`02` Part 13](./02-school-operations-manual.md#part-13--what-nexaforge-does-not-do-yet).

---

## RB-17 · "The printout looks wrong / colours missing / cut off"

**Severity:** P3

**B:** Chrome on a **laptop** · A4 · margins Default · **Background graphics ON**
(this is the usual culprit for missing grade colours) · scale 100% · batches of ~40.

**C:** Correct printout without changing any data.

---

## RB-18 · "Positions are wrong"

**Severity:** P2

**B:** Positions come from `compiled_results` (`subject_position`,
`overall_position`). Check that **all** subjects for the class are compiled — a
missing subject shifts every position. Confirm all scores synced (RB-10), then
re-compile.

**C:** Accurate positions — worth getting right, as parents check these closely.

---

## RB-19 · "Can we add the principal's comment / school stamp?"

**Severity:** P4

**B:** Signature and logo come from School Settings — upload there.
Free-text comments are not available yet (`GAP-4` family): they write them by hand
this term. Log the request.

**C:** Partial win now, honest position on the rest.

---

# Billing

## RB-20 · 🔴 "We paid but the account is still not active"

**Severity:** P1 — money and trust

**B — What you do:**

1. Get the reference (starts with `nexa-`) or the payer email.
2. Check Paystack dashboard: did the charge actually succeed?
3. Check the ledger:
   ```sql
   select reference, status, amount, plan, created_at
   from public.subscription_payments
   where school_id = '<school-uuid>'
   order by created_at desc limit 5;
   ```
4. **Paystack success + local status `pending`** → the webhook didn't process.
   Fix both sides by hand:
   ```sql
   update public.subscription_payments
   set status = 'success', paid_at = now(), updated_at = now()
   where reference = '<nexa-reference>';

   update public.schools
   set subscription_status = 'active',
       subscription_tier = '<starter|growth|premium>',
       subscription_expires_at = now() + interval '120 days',
       updated_at = now()
   where id = '<school-uuid>';
   ```
5. Confirm in the app, then tell them it's done.
6. 🔴 Investigate the webhook — check the Paystack webhook URL is correct and
   Supabase/hosting logs for the failed delivery. If the webhook is broken, **every
   school's payment is affected**, not just this one.
7. Log it. Two occurrences = fix the webhook properly.

**C — What this achieves:** School activated within minutes, and you catch a
platform-wide revenue failure early.

> **Never tell a school to pay again.** Duplicate charges cause chargebacks, and
> in a referral market one such story reaches every proprietor in the cluster.

---

## RB-21 · "We paid early and lost two weeks"

**Severity:** P2 — **legitimate complaint; the system is at fault, not the school**

**B:**
1. Acknowledge: *"You're right — the term starts on the payment date. That's on us."*
2. Correct it manually:
   ```sql
   update public.schools
   set subscription_expires_at = '<correct-date>'::timestamptz, updated_at = now()
   where id = '<school-uuid>';
   ```
3. Tell them the corrected expiry date.
4. Add the days they lost, plus a goodwill margin.

**C:** Fair outcome, retained trust, and a documented case for fixing the
extend-from-expiry logic.

---

## RB-22 · "We want to cancel"

**Severity:** P2 — a retention conversation first

**B:**
1. **Ask why, and listen.** Price? A missing feature? Or did they never actually
   get to a printed report card? The last is your fault and is fixable.
2. If they proceed: process the cancellation, then 🔴 **verify in the Paystack
   dashboard that no further charge can occur** (`GAP-2`).
3. Confirm in writing: *"Cancelled. Access continues until {date}. Nothing further
   will be charged."*
4. **Offer their data export before access ends** — it costs you little and is
   both the decent thing and your NDPA obligation (`GAP-3`).
5. Record the true reason in your churn log.

**C:** Clean exit, no wrongful charges, and honest churn data — which is worth
more than the saved subscription.

---

## RB-23 · "Why are you charging us for August?"

**Severity:** P3 — usually a misunderstanding

**B:** Explain 120-day terms and show Payment History. If their term genuinely
overlaps a long holiday, extend the expiry by the closed weeks — the "no August
charges" promise is a core positioning claim and must be honoured in spirit.

**C:** Positioning claim upheld, which is worth more than a few weeks of access.

---

## RB-24 · "We have more students than our plan allows"

**Severity:** P3 — **this is an upsell, handled well**

**B:**
1. Count actual students:
   ```sql
   select count(*) from public.students
   where school_id = '<school-uuid>' and is_deleted = false;
   ```
2. Compare to the plan (Starter 200 / Growth 500 / Premium ∞). Limits may not be
   enforced (`GAP-8`), so they may be well over.
3. Never punish them retroactively. Say: *"You've grown past Starter — Growth fits
   you from next term."*
4. Set the correct tier at renewal.

**C:** Revenue corrected without a hostile conversation, and a real growth signal
for your pricing model.

---

# Website

## RB-25 · "Our website isn't loading"

**Severity:** P2

**B:** Confirm the exact URL (`{slug}.nexaforges.me`) · check `website_enabled` is
`true` · test in incognito · for custom domains, verify `schools.domain`, the
hosting domain configuration and DNS. DNS changes can take 24–48h.

**C:** Site restored, or an accurate expectation about DNS timing.

---

## RB-26 · "Changes to our website aren't showing"

**Severity:** P3

**B:** Confirm they saved · hard refresh (Ctrl+Shift+R) · try incognito ·
allow for caching. Images must be uploaded, not linked.

**C:** They see their changes and learn to verify in incognito.

---

## RB-27 · "Can we have a news page / online admissions?"

**Severity:** P4

**B:** Not available (`GAP`). Offer the Gallery and Contact form as substitutes.
🔴 Also check the marketing FAQ isn't implying these exist — if it is, fix the
copy today. Log the request.

**C:** Honest answer, plus a copy correction that prevents the next such ticket.

---

# Platform-wide

## RB-30 · 🔴 "Nothing is working / the site is down"

**Severity:** P1

**B:**
1. Confirm it yourself — open the site on your own connection.
2. If it's only them, it's their network. If it's you too, it's the platform.
3. Check hosting status, Supabase project status and your provider's status page.
4. **Communicate within 15 minutes**, even without a cause:
   > *"We're aware the platform is unreachable and are working on it now. I'll
   > update you within the hour. Your data is safe."*
5. Broadcast to **every** school, not just the one that called. Silence is what
   causes churn, not downtime.
6. Update hourly until resolved.
7. Write a brief post-incident note afterwards — what happened, what you changed.

**C:** Schools trust you during failure, which builds more loyalty than uptime
does.

> 🔴 **During results week, downtime is existential.** Do not deploy anything
> between weeks 12 and 14. `business/08` is explicit about this — respect it.

---

## RB-31 · "It's very slow"

**Severity:** P3

**B:** Check their connection first (most cases) · try another device · check
Supabase performance for slow queries · check whether one school has an unusually
large dataset.

**C:** Either resolved locally or a real performance signal.

---

## RB-32 · "Can another school see our students?"

**Severity:** P1 — treat every report as real until disproven

**B:**
1. Get a screenshot immediately — exact names and what they saw.
2. Verify the account's `app_metadata.school_id` is correct.
3. Test the same query yourself with that account's scope.
4. If a real cross-tenant leak: 🔴 **treat as a data breach.** Contain it (disable
   the affected account or route), determine scope, and notify the affected schools
   **within 72 hours** per the [DPA](../legal/data-processing-addendum.md).
5. Most reports turn out to be a mis-created account (RB-4) or misreading the UI.

**C:** Either a debunked report or a properly contained and disclosed incident.
Your entire multi-tenant credibility rests on handling this correctly.

---

## RB-33 · "We want all our data" / "We're leaving"

**Severity:** P2 · **contractual obligation, 7 working days**

**B:** No export exists (`GAP-3`). Produce it from Supabase:

```sql
-- Students
select full_name, admission_number, gender, date_of_birth, guardian_name,
       guardian_phone, address
from public.students where school_id = '<uuid>' and is_deleted = false;

-- Scores with context
select s.full_name, s.admission_number, sub.name as subject,
       a.name as assessment, sc.score, a.max_score, t.name as term
from public.scores sc
join public.students s   on s.id = sc.student_id
join public.assessments a on a.id = sc.assessment_id
join public.subjects sub on sub.id = a.subject_id
join public.terms t      on t.id = a.term_id
where s.school_id = '<uuid>';

-- Compiled results
select * from public.compiled_results where school_id = '<uuid>';
```

Export each as CSV, zip, and deliver via a link with the school's name on it.
Confirm receipt in writing.

**C:** Obligation met, reputation intact — and a school that leaves cleanly still
refers others.

---

## RB-34 · "Can you train our teachers again?"

**Severity:** P4 — **say yes**

**B:** Run a 45-minute session covering: login, score entry, **the sync rule**,
and printing. Record it once and reuse it. Give every attendee the staff-room
quick-reference sheet.

**C:** Adoption rises, ticket volume falls. This is the highest-leverage hour you
can spend on an existing school.

---

# Data loss

## RB-40 · 🔴 "We deleted something by mistake"

**Severity:** P1

**B:** Most deletes are **soft** (`is_deleted = true`), so recovery is usually
easy:

```sql
-- Find it
select id, full_name, is_deleted, deleted_at
from public.students
where school_id = '<uuid>' and full_name ilike '%name%';

-- Restore
update public.students
set is_deleted = false, deleted_at = null
where id = '<uuid>';
```

The same pattern works for `teachers`/`profiles`, `classes`, `subjects`,
`assessments` and `schools`.

**C:** Restored in minutes with history intact.

---

## RB-41 · 🔴 Database-level loss (hard delete, bad migration, corruption)

**Severity:** P1 — the worst case

**B:**
1. 🔴 **Stop all writes.** Tell schools to pause data entry immediately.
2. Do **not** attempt clever repairs on production first.
3. Restore from Supabase backup/PITR **into a separate project**.
4. Verify the restored data (spot-check students and scores for a known class).
5. Plan the cutover, then execute it.
6. Tell affected schools what was lost and what was recovered, honestly.
7. Post-incident: write down the cause and the guard you added.

**C:** Maximum recovery with no second mistake made under pressure.

> 🔴 This procedure is **untested** unless you have done a restore drill. Do one
> this month ([`01` §11](./01-admin-operations-manual.md#11-backups-restores-and-the-five-critical-operations)).
> An untested backup is not a backup.

---

## RB-42 · "A parent is disputing a score"

**Severity:** P2 — reputational, not technical

**B:**
1. Retrieve what the system holds for that student+subject+term.
2. Compare against the teacher's physical mark sheet.
3. 🔴 There is **no audit history** (`GAP-11`) — you cannot prove who entered or
   changed a value. Say so rather than implying certainty you don't have.
4. Support the school's own resolution process; supply data, not verdicts.
5. If corrected, correct it in the system and reprint.

**C:** School supported without you adjudicating an academic dispute — and a
concrete case for building `score_history`.

---

# The support discipline that makes this scale

### Response templates

**Acknowledgement (send within minutes, always):**
> *"Got it — looking at this now. I'll come back to you within {time}."*

**Resolution:**
> *"Fixed. The cause was {plain-language cause}. To avoid it next time:
> {one action}. Anything else?"*

**Known gap:**
> *"You're right, {feature} isn't available yet. For now: {workaround}. It's on
> our roadmap — I'll message you the day it's ready."*

**Bad news:**
> *"I'm sorry — {what was lost} can't be recovered. Here's what we do now:
> {concrete plan}. And here's how we prevent it: {prevention}."*

### The three rules

1. **Acknowledge fast, even without an answer.** Silence is the actual complaint.
2. **Never blame the school.** *"Enrollment is per-term — easy to miss"* beats
   *"you didn't enroll them."*
3. **Fix the cause, not just the ticket.** Anything logged 3× becomes a product
   change, a training video, or a manual update. **This is the only path from
   40 founder-hours per school to 8** (`business/08` §7).

### Escalation to yourself

| Condition | Action |
|---|---|
| Data loss possible | Drop everything |
| Multiple schools affected | Platform issue — broadcast, then fix |
| Results week + any P1/P2 | Stop selling, stop building, support only |
| Same issue 3rd time | Schedule the permanent fix this week |

---

## Change log

| Version | Date | Change |
|---|---|---|
| 1.0 | 24 Aug 2026 | First issue. 34 entries, verified against commit `0be9008`. |

> Add an entry every time you meet something not in this list. This document is
> the company's operational memory.
