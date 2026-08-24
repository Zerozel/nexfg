# Engineer: Determine whether this can be built cheaply

> **Role brief:** technical due diligence on the existing codebase and the roadmap.
> Can this be built and operated cheaply by one person? Where is the hidden cost?

---

## Verdict

**Yes — the software is cheap. Dangerously cheap, in fact, which is why the real costs
are hidden elsewhere.**

The already-built product is worth roughly **₦12–18M of contract engineering** and costs
**₦17,000/month to operate**. That is a genuinely excellent position.

But my honest engineering assessment is this: **the software was never the hard part, and
treating "it's already built" as the main achievement is the biggest technical risk in the
plan.** The expensive parts are operational, and one of them is a live threat to the
company right now.

---

## 1. What exists — assessment

I have read the codebase. This is competent work, not a prototype.

| Subsystem | Assessment |
|---|---|
| **Offline sync engine** | 🟢 **Genuinely good.** Batching (1,000 records), exponential backoff, per-record error attribution, abort handling, localStorage reconciliation. This is 6–8 weeks of careful work and the hardest thing here. |
| Multi-tenant data model | 🟢 Clean `school_id` scoping with RLS. Correct architecture for this problem. |
| Report-card printing | 🟢 Print-CSS approach with dedicated stylesheets — pragmatic and cheap. Correct choice over PDF generation. |
| Score entry UI | 🟢 Matrix entry with per-cell state. Right interaction model for the task. |
| Subscription/billing | 🟡 Works, with webhook handling. Standard. |
| Public school sites | 🟢 Slug-based multi-tenant routing. Neat reuse of existing infra. |
| Role/permission config | 🟢 Centralised, declarative. Good. |
| **Migrations** | 🔴 **Broken. See below.** |
| Test coverage | 🔴 None visible. |
| Observability | 🔴 None visible. |

**Stack choice (Next.js + Supabase + Vercel) is exactly right for a solo founder.** It
eliminates DevOps, auth, and database administration — three full-time jobs — for
essentially nothing. I would not change it.

---

## 2. 🔴 The one thing I would stop everything to fix

**`supabase/migrations/` contains only three files, numbered `...0002`, `...0003`,
`...0004`.** They create `scores`, `academic_years` and `subscriptions`.

**There is no migration that creates `schools`, `students`, `classes`, `subjects`,
`enrollments`, `teachers`, or `profiles` — the core of the entire system.** And
`...0001` is missing entirely.

### Why this is a five-alarm problem

The production database exists only as **live state in Supabase**, not as source code.
Concretely:

- You **cannot** rebuild the database from the repository
- You **cannot** stand up a staging environment
- You **cannot** onboard another engineer safely
- If a migration is applied wrongly, **there is no known-good state to return to**
- If the Supabase project is corrupted or misconfigured, **every school's academic data is gone with no reconstruction path**

This is not technical debt. **It is an unmanaged single point of total data loss**, and
the asset at risk is thousands of children's academic records.

### The fix — 2 hours

```bash
supabase db dump --schema public > supabase/migrations/00000000000001_baseline.sql
supabase db dump --data-only --schema public > backups/seed_$(date +%F).sql
# then verify:
supabase db reset   # must rebuild the entire schema from migrations alone
```

Then: automated daily backups + **a restore test every month.** An untested backup is not
a backup; it is a belief.

**Two hours removes the largest technical risk in the business.** Nothing else on the
roadmap has that return on time.

---

## 3. Build cost of the remaining roadmap

Solo founder rates. Assumes existing patterns are reused.

### Must-build (honesty and retention)

| Item | Est. | Why |
|---|---:|---|
| **Data export (ZIP of CSVs)** | **12–16h** | Promised publicly `[CODE]`. Also the #1 sales objection killer, and likely a data-protection right. |
| **Termly attendance + comment entry** | **16–20h** | Report cards need it; the copy claims it |
| Remove/relabel false claims | 4h | Copy edits only |
| Sentry + basic error logging | 3h | You are flying blind without it |
| Sync telemetry (M10) | 6h | You cannot claim offline reliability you don't measure |
| **Subtotal** | **~45h** | **≈ 1.5 weeks** |

### High-value next

| Item | Est. | Notes |
|---|---:|---|
| **Fee tracking (ledger only, not payments)** | **40–60h** | 🔴 The customer review says the bursar controls spending and this is her only pain. Do not build a payment processor — build a ledger, receipts, and an outstanding-fees list. |
| Full PWA / service worker | 30–40h | Deepens the only real moat layer you own |
| Multi-year student trends | 24h | Builds the data lock (L2) |
| QR-verifiable certificates | 16h | Starts the credential rail (L4) |
| Parent read-only portal | 40h | Big retention lever, real support-load risk |
| Bulk student import (CSV) | 16h | **Cuts 90 min from every onboarding** — pays for itself at ~10 schools |

### Do not build

| Item | Why |
|---|---|
| Native mobile apps | PWA is sufficient. Two app stores = two maintenance burdens. |
| Payment processing | Never touch fee money. Regulatory and reputational exposure far exceeds the benefit. |
| Custom analytics/BI | Postgres queries + a spreadsheet. You have 15 customers. |
| CBT / exam engine | Different product, different sales cycle, months of work |
| AI features | No customer asked. Zero sales impact in this segment. |
| Internal CRM/admin tooling | A Google Sheet is strictly better at this scale |

**Total genuinely needed: ~200 hours ≈ 5 weeks of focused work.** That is remarkably
cheap for a complete competitive position.

---

## 4. Infrastructure cost — realistic projection

| Schools | Students | Vercel | Supabase | Other | **Total/mo** |
|---:|---:|---|---|---|---:|
| 5 | 1,500 | Pro ₦32k | Free | ₦5k | **₦37k** |
| 15 | 6,000 | Pro ₦32k | Pro ₦40k | ₦13k | **₦85k** |
| 40 | 20,000 | Pro ₦32k | Pro ₦40k | ₦25k | **₦97k** |
| 100 | 60,000 | Pro ₦32k | ₦120k | ₦60k | **₦212k** |

**Two important notes:**

1. `[RISK]` **Vercel Hobby prohibits commercial use.** You are currently in violation, and
   the consequence is deployment suspension — which during results week would be
   catastrophic. **Upgrade before school #1.** ₦32k/month.
2. **Supabase's 500MB free tier is fine for ~5 schools and will not survive 15.** Budget
   the Pro upgrade at around school 8, not when you hit the wall.

**Infrastructure is not a scaling risk.** At 100 schools, infra is ~2% of revenue. This is
the least of your worries.

---

## 5. The costs the plan underestimates

This is the part I most want on the record.

### 5.1 Support is the real engineering cost 🔴

**Onboarding is estimated at 6 hours per school. Realistically it is 10–14**, because:
- Student data arrives as photographs of handwritten registers, not CSVs
- Every school names classes differently and inconsistently
- Assessment weightings vary and are often not written down anywhere
- Teachers need repeated, patient, in-person training

**At 15 schools with 6 support hours per school per term, that is 90 hours — more than
two full working weeks per term spent on support alone.** This, not infrastructure, is
what caps growth.

**The engineering response:** every hour spent reducing support is worth more than any
feature. Specifically — **CSV import (16h) and a self-service setup wizard (24h) are
higher-value than any customer-facing feature on the roadmap.** They convert
non-scalable founder hours into software.

### 5.2 Results week is a load spike, and it is unmeasured

Every school prints report cards in the same two weeks. Batch printing hundreds of report
cards, concurrently, across all tenants — **and you have no load testing and no
monitoring.**

If the system degrades during results week, you don't lose one school; you lose the
cohort, plus the referral network. **This is the highest-consequence technical risk after
the migration gap.**

**Mitigation (cheap):** simulate a full-school batch print before the first real results
week. Add Sentry. Know your slowest query.

### 5.3 Data integrity has no safety net

No tests around grade computation. **A wrong grade on a printed report card handed to a
parent is not a bug — it is a public humiliation for the school**, and they will not
forgive it.

**Minimum viable:** unit tests on grade boundaries and weighted-total computation
(~4 hours). This is the highest-value test suite in the codebase and currently does not
exist.

### 5.4 Security is under-examined for what you hold

RLS is present and the architecture is right. But:
- **No evidence of deliberate cross-tenant testing.** One wrong policy leaks another school's children's records.
- Service-role keys in API routes need auditing — a single mistake bypasses RLS entirely.

**Spend 6 hours writing tests that deliberately attempt cross-tenant reads.** You need to
know this works, not assume it.

---

## 6. Where I disagree with the plan

| Plan position | My view |
|---|---|
| Fee tracking is "Layer 4, later" | 🔴 **Move it forward.** The customer review is unambiguous: the bursar controls spending and fees are her only pain. 40–60 hours closes the competitor's best attack vector. |
| Attendance is a "claims fix" | It's also the last gap making report cards genuinely complete. Treat as core, not cleanup. |
| Product work gets ~8–10 hrs/week | Realistic, but **only if you stop building features.** The 200 needed hours must not become 600 through scope creep. |
| Offline engine is a 6–12 month moat | Fair — but only if you keep deepening it. Full PWA within 12 months or the lead evaporates. |
| "No build risk between here and revenue" | Mostly true, **but the migration gap is a live existential risk, not a build risk.** Different category, worse consequence. |

---

## 7. What I would do in the next 30 days

| Priority | Task | Hours |
|---:|---|---:|
| **1** | **Baseline migration + verified restore test** | **4** |
| **2** | Vercel Pro (compliance + suspension risk) | 0.5 |
| **3** | Sentry + error logging | 3 |
| **4** | Grade computation unit tests | 4 |
| **5** | Cross-tenant RLS security tests | 6 |
| **6** | **Data export feature** | 14 |
| **7** | CSV student import | 16 |
| **8** | Attendance + comments entry | 18 |
| **9** | Sync telemetry | 6 |
| **10** | Simulate results-week batch print load | 4 |
| | **Total** | **~76h (≈2 weeks)** |

---

## 8. Bottom line

**Can it be built cheaply? It already has been, and well.** The offline sync engine in
particular is real engineering, not a demo, and it is the correct thing to have built
first for this market.

**But three corrections are needed:**

1. **The missing baseline migration is an unmanaged existential risk.** Two hours. Do it before reading anything else in this folder.
2. **The expensive part of this business is support, not software.** Engineering effort should be aimed at reducing founder-hours-per-school, not at adding features. CSV import beats any feature on the roadmap.
3. **Fee tracking is more urgent than the plan assumes** — not because it's technically interesting, but because it is the gap through which a funded competitor takes the entire account.

**Total remaining engineering to reach a defensible position: ~200 hours. Total monthly
operating cost at 15 schools: ~₦85,000.**

For a business projected at ₦14M in year 2, **that is an extraordinarily cheap technical
foundation. The constraint on this company is not engineering cost — it is founder
hours and founder cash.**
