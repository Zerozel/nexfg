# NexaForge — Operations & Legal Documentation

> **Audience:** two very different readers.
> Everything in `manuals/01` and `manuals/03` is for **you, the operator**.
> Everything in `manuals/02` and `legal/` is **given to schools**.
> Do not mix them up — `manuals/01` contains statements about product gaps that
> must never be handed to a customer verbatim.

**Version 1.0 — 24 August 2026**

---

## What this folder is

`business/` explains *why* the company exists and *where* it is going.
**`docs/` explains what to do, today, when a phone rings.**

The organising principle of this folder is a single sentence you should be able to
answer in under 60 seconds, half-asleep, at 7am during results week:

> *"The school says **A**. I do **B**. That achieves **C**."*

That sentence is the entire content of [`manuals/03-troubleshooting-runbook.md`](./manuals/03-troubleshooting-runbook.md).
If you only ever read one file in this folder, read that one.

---

## Reading order

### For you (internal — never share)

| # | Document | What it gives you |
|---|---|---|
| [00](./00-ACTION-REQUIRED.md) | 🔴 **Action Required** | **Start here.** 8 verified defects with paths, line numbers, fixes and acceptance criteria |
| [01](./manuals/01-admin-operations-manual.md) | **Admin Operations Manual** | Every super-admin capability, what it does to the database, and what it *cannot* do |
| [03](./manuals/03-troubleshooting-runbook.md) | **Troubleshooting Runbook** | 🔴 **The complaint → action → outcome table.** Your primary operational tool |
| [SLA](./legal/service-level-agreement.md) | Service Level Agreement | What you have promised, in writing, and how to measure it |
| [Checklist](./templates/onboarding-checklist.md) | Onboarding Checklist | Copy per school; the go-live gate |
| [Logs](./templates/incident-and-support-log.md) | Incident & Support Log | The templates that make founder-hours-per-school fall |

### For schools (external — safe to share)

| Document | Give it to | When |
|---|---|---|
| [02 — School Operations Manual](./manuals/02-school-operations-manual.md) | School admin + principal | At onboarding, printed |
| [Terms & Conditions](./legal/terms-and-conditions.md) | Proprietor / signatory | Before first payment |
| [Privacy Policy](./legal/privacy-policy.md) | Anyone who asks; publish on site | Always public |
| [Data Processing Addendum](./legal/data-processing-addendum.md) | Proprietor | With the T&Cs — this is your NDPA position |
| [SLA](./legal/service-level-agreement.md) | Proprietor | With the T&Cs |

---

## 🔴 Before you use any of this: eight facts that are true right now

These were verified by reading the repository on 24 August 2026. Several
contradict what the marketing site or `business/08` currently claim. **Trust this
list over those documents** until the code changes.

> ➡️ **[`00-ACTION-REQUIRED.md`](./00-ACTION-REQUIRED.md) is the actionable version
> of this table** — exact file paths, line numbers, the SQL to run, the fix, and
> acceptance criteria for each item. Work from that file, not this summary.

| # | Fact | Consequence for you | Fix cost |
|---|---|---|---|
| 1 | **There is no password-reset flow anywhere in the app.** No `resetPasswordForEmail`, no forgot-password page. | Every forgotten password is a *manual* job for you in the Supabase dashboard. This will be your single most frequent support ticket. | 4–6 h |
| 2 | **Subscription expiry is not enforced.** `checkExpiredSubscriptions()` exists but is **not wired to any cron, route or scheduler**, and no API or UI blocks an `expired` school. | Expired schools keep full access. `business/08` §2 says "`expired` blocks access `[CODE]`" — **that is wrong.** Revenue leaks silently. | 2–3 h |
| 3 | **There is no data export.** Import exists; export does not. | The site's written promise ("export all records at any time") cannot be honoured. Also an NDPA portability exposure. | 8–12 h |
| 4 | **Attendance is not tracked.** The report-card template has a fully built attendance block fed by a hard-coded `null`. | Every report card prints with a blank attendance section, every term, at the worst moment. | 8–12 h |
| 5 | **`supabase/migrations/` cannot rebuild the database.** Only 3 migrations exist; `schools`, `students`, `compiled_results` etc. are not in source control. | No staging environment, no rebuild path, no safe way to test a migration. **This is the existential risk.** | 3–4 h |
| 6 | **How `compiled_results` gets populated is not in the repository.** Report cards read this table; nothing in the app writes it. | If compilation fails or was never built, **report cards render empty** — discovered in week 13. Verify this before your next results week. | ❓ verify first |
| 7 | **Offline scores live only in `localStorage`.** Key: `nexaforge_scores_{classId}`. | A teacher who clears their browser, uses private mode, or switches device **before syncing loses those scores permanently.** No recovery exists. | Training + banner |
| 8 | **Plan limits are defined but enforcement is unverified.** `PLAN_LIMITS` sets 200/500/∞ students; no check was found on student creation. | A Starter school can hold 900 students and pay ₦15,000. Silent revenue leak. | 2–4 h |

> **Recommended order to fix:** 5 → 6 → 2 → 1 → 3 → 4 → 8.
> Items 5 and 6 are *catastrophic-if-wrong*; 2 and 1 are *cheap and constant pain*.
> Rationale in [`manuals/01` §12](./manuals/01-admin-operations-manual.md#12-known-gaps-and-the-workarounds-that-cover-them).

---

## The three numbers that matter operationally

Everything else is vanity. From `business/08` §8, reduced to what you can actually
check on a Sunday evening:

| Metric | Where to get it | Threshold | If breached |
|---|---|---|---|
| **Teachers who entered scores this week ÷ total teachers** | Count distinct `created_by`/`updated_at` in `scores` this week | **≥70%** | Below 50% → that school has already churned and hasn't said so. Call the principal, not the admin. |
| **Schools whose `subscription_expires_at` is within 21 days** | Super-admin → Schools, sort by expiry | 0 unhandled | Start SOP-3 renewal immediately |
| **Support requests per school per week** | Your support log | **<2** | Any question asked 3× becomes a product fix or a training video. No exceptions. |

---

## Conventions used in this folder

| Marker | Meaning |
|---|---|
| `[CODE]` | Verified against the repository. Reliable. |
| `[GAP]` | The product does not do this. A manual workaround is given. |
| `[VERIFY]` | You must confirm this before relying on it — usually in production or with a lawyer. |
| `[FILL]` | A blank you must complete (company registration number, address, etc.). **Search the whole folder for `[FILL]` before sending anything to a customer.** |
| 🔴 | Do not skip. Something breaks or someone gets hurt. |

---

## Before this folder goes anywhere near a customer

- [ ] Search every file for `[FILL]` and complete each one
- [ ] Have a Nigerian lawyer review `legal/terms-and-conditions.md`, `legal/privacy-policy.md` and `legal/data-processing-addendum.md` — these are **drafts written by an engineer, not legal advice**
- [ ] Register with NDPC as a data controller/processor if required at your scale `[VERIFY]`
- [ ] Reconcile the marketing site against `business/02` (trial length, attendance, export, stats) — **the T&Cs and the website must not contradict each other**, or you have created your own evidence in a dispute
- [ ] Publish the Privacy Policy at a stable public URL and link it from the footer
