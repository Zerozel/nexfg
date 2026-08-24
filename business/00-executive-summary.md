# 00 — Executive Summary

**Company:** NexaForge (a TheNexaVerse enterprise)
**Product:** School operating system + education programme network for African schools
**Status:** Platform substantially built `[CODE]`; programmes/devices/government layers not built
**Position:** Solo founder, ₦0 capital, funding growth from customer revenue

---

## 1. The thesis

Nigerian private schools do not have a software problem. They have a **differentiation
problem**. Roughly 40,000+ private schools `[ASSUMPTION]` compete for the same fee-paying
parents with the same value proposition: *we will help your child pass exams*. They
compete on uniform quality, building appearance, and WAEC pass rates — and it has
commoditised them.

NexaForge sells software as the entry point, but the actual product is **a credible,
externally-visible reason for a parent to choose one school over the identical school
across the road**: skills programmes, inter-school competitions, scholarships, and a
verifiable record of achievement.

That reframing is what makes the business defensible. Software is copyable in 90 days.
A network of schools whose ranking parents recognise, built on four years of accumulated
academic data, is not.

> **Software is the wedge and the data spine. Programmes, credentialing and network
> status are the business.**

---

## 2. What is actually built `[CODE]`

Verified by reading the repository — this is the credible asset base:

| Capability | Evidence | Commercial significance |
|---|---|---|
| **Offline-first score entry** with localStorage cache, 1,000-record batches, exponential-backoff retry, per-record error attribution | `src/lib/sync/orchestrator.ts`, `src/lib/storage/scores.ts`, `supabase/functions/scores-bulk/` | **The strongest wedge.** Teachers enter scores with no connectivity; sync when data returns. Most competitors assume connectivity. |
| Multi-tenant SIS with row-level security keyed on JWT `school_id` | `supabase/migrations/*`, RLS policies | Real tenant isolation, not application-layer filtering. Credible for scale + audits. |
| Role model: super_admin / admin / principal / teacher | `src/config/roles.ts` | Matches Nigerian school hierarchy. Principals see everything; teachers see only their classes. |
| A1–F9 grading, report cards, batch class printing, class result sheets | `src/components/printing/*`, `src/lib/printing/*` | This is the feature schools actually pay for. Termly, non-negotiable, painful. |
| Branded public website per school at `slug.nexaforges.me` | `src/app/school/[slug]/`, `src/components/public/*` | High perceived value (₦80k–250k freelance equivalent `[ASSUMPTION]`), near-zero marginal cost. |
| Paystack per-term billing, idempotent webhook ledger, expiry cron | `src/lib/paystack/*`, `subscription_payments` table, `src/lib/cron/check-subscription.ts` | Revenue collection works today. |

**Not built, but sold in present tense on the marketing site** `[RISK]`: Devices,
Programmes, Competitions, Scholarships, Government deployments. See
[doc 02](./02-product-claims-audit.md) — this must be fixed before any serious sales push.

---

## 3. The uncomfortable arithmetic

At the marketed prices `[CODE]`, blended revenue is **₦81,000 per school per year**
(mix assumption in [doc 04](./04-business-model.md)).

| Schools | Annual software revenue | Reality check |
|---:|---:|---|
| 10 | ₦810,000 | Covers infrastructure, not the founder |
| 50 | ₦4.05M | ~₦337k/month — one modest salary |
| 200 | ₦16.2M | A small business, tight with 3–4 staff |
| 1,000 | ₦81M (~$50k) | Still not a venture-scale software company |

**Software alone cannot fund this company.** Getting to 1,000 schools solo is
essentially impossible, and even succeeding produces a modest business.

The corrective is in the same marketing copy already written. Programmes can carry
**₦1,500–2,500 per student per term** `[ASSUMPTION]`. A single 400-student school at
₦2,000/student/term = **₦800,000 per term — roughly 27× the ₦30,000 software fee.**

| Revenue line | Per school / year `[ASSUMPTION]` | Notes |
|---|---:|---|
| Software subscription | ₦81,000 | The wedge. Low margin on founder time. |
| Programmes (opt-in, ~30% of students) | ₦720,000 | Delivered ~6 days/term; needs facilitators |
| Fee-collection take rate (0.4% of ~₦45M) | ₦180,000 | Requires PSP partnership, not a licence |
| Devices (referral/margin) | ₦60,000 | Later; working-capital heavy |
| **Blended potential** | **~₦1,041,000** | **~13× software-only** |

This is why the business model document reorganises the company around programmes and
treats the subscription as customer-acquisition infrastructure that happens to be
cash-positive.

---

## 4. The threat that actually matters

Not Edves. Not Classnote. **A payments company.**

A 400-student school collecting ₦110,000/term in fees per student handles ~₦44M per
term. At a 0.5% take rate that is **₦220,000 per term — 7× your software price.**
`[ASSUMPTION]`

That means Moniepoint, OPay, Flutterwave or a commercial bank can give school
management software away **free, permanently**, fund it entirely from payment flow, and
deploy it through agent networks with thousands of feet on the ground. They can also
reach the bursar — who controls the money — while you are trying to reach the principal.

Any defensibility story that ignores this is not bulletproof. The response is *not* to
out-build them:

1. **Do not compete on the money rail — ride it.** Partner/embed rather than fight.
2. **Own the academic and status layer** they have no institutional interest in:
   curriculum, competitions, credentials, rankings, child safeguarding.
3. **Be the layer they would rather integrate than rebuild.** A payments company can
   clone a gradebook. It will not run a national inter-school science competition or a
   safeguarding regime.

Full attack/defence analysis: [doc 07](./07-moat-and-defensibility.md) and
[the competitor's own war plan](./adversarial-review/competitor.md).

---

## 5. The moat, stated precisely

Not a feature list. A **sequence**, where each layer is only buildable because the
previous one exists:

```
L1  Offline-first score entry        →  wins the school (works where rivals break)
L2  Cumulative academic history      →  switching cost compounds every term
L3  Inter-school league + programmes →  network effect w/ parent-visible status
L4  Verified transcripts / credentials → external parties depend on us
L5  Sponsor-funded cross-subsidy     →  we can undercut any pure-SaaS rival
L6  Association channel lock (NAPPS) →  distribution a rival must buy twice
```

Any single layer is copyable. The **order** is not: L3's league is worthless without
L2's data across many schools; L5's sponsors will not fund a network that lacks L3's
measurable outcomes. A competitor starting today faces a 3–4 year sequencing lag, and
the earliest layers are the least profitable — which is exactly why an incumbent
optimising for quarterly numbers will not start.

---

## 6. Five decisions only the founder can make

| # | Decision | Recommendation | Consequence if deferred |
|---|---|---|---|
| **D1** | Fix or substantiate unbuilt-feature claims and traction stats | Rewrite to future tense + run one real pilot programme this term | `[RISK]` Reputational and potential FCCPA/advertising exposure; a single principal comparing promise to product ends referrals in that cluster |
| **D2** | Programmes: build now or later? | **Now, minimally.** One 6-week pilot, founder-delivered, 2 schools, ₦0 cost | Without it you are a commodity SIS competing on price against free |
| **D3** | Pricing | Keep term billing; **cut session discount from 33% → 12%**; add per-student programme line | 33% off is unaffordable and term-billing creates 3 churn events/year |
| **D4** | Geography | **One LGA cluster.** 15–25 schools within 20km. No second city until cluster is dense | Solo founder + dispersed schools = no referral compounding, all travel cost |
| **D5** | Founder's own pay | Set an explicit minimum draw and a revenue trigger for it | Undefined founder economics is the #1 cause of solo-founder abandonment |

---

## 7. What the adversarial review concluded

Five hostile roles were run against this plan ([full set](./adversarial-review/)).
Where they agreed:

- **All five** agreed the offline-first sync is real, valuable, and under-marketed.
- **All five** agreed ₦15k–60k/term cannot build a company on its own.
- **Customer, competitor and VC** independently concluded the *website* and the
  *report cards* are the only things a school will pay for on day one — programmes are
  aspiration until proven.
- **Competitor and VC** both identified free-SIS-funded-by-payments as the kill shot.
- **Engineer** confirmed the platform can run for **under ₦40,000/month up to ~50
  schools** `[ASSUMPTION]`, which makes the bootstrap plan viable — but flagged that
  founder support time, not infrastructure, is the binding constraint.

**The unanimous verdict:** the *software* business fails. The *network* business is
plausible but unproven, and the single highest-value action available is to run **one
real programme cohort with one real school this term** — because that is the only
assumption nobody can validate from a spreadsheet.

---

## 8. The 90-day objective

Not "grow." **Prove three things:**

1. **Willingness to pay** — 5 schools paying real money, ≥₦15,000 each, no discount beyond the published one.
2. **Retention through a term boundary** — those schools renewing for a second term.
3. **Programme demand** — ≥25% of one school's parents paying for one programme cohort.

If all three hold, the business is real and financeable. If (3) fails but (1) and (2)
hold, you have a modest, sustainable SIS business — pivot expectations, not strategy.
If (1) or (2) fail, the product is not the problem; the market segment is, and you
should move upmarket to schools with ₦150k+/term fees.

Detail: [doc 13](./13-90-day-execution-plan.md), thresholds in [doc 11](./11-data-validation-plan.md).
