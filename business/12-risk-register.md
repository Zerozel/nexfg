# 12 — Risk Register

> Scored **Likelihood (1–5) × Impact (1–5)**. Sorted by score. Anything ≥15 requires an
> active, dated mitigation — not an intention.
>
> **Note the pattern before you read the table:** of the top eight risks, only two are
> product risks. The rest are founder, cash, legal and competitive-structure risks.
> **This business is far more likely to die from something other than the software.**

---

## 1. Top risks

| # | Risk | L | I | Score | Owner |
|---:|---|---:|---:|---:|---|
| **R1** | **Founder personal cash exhaustion → takes a job → company dies** | 4 | 5 | **20** | B1 |
| **R2** | **Programme thesis fails (M3 <10%) → Path A → never profitable** | 3 | 5 | **15** | B5 |
| **R3** | **Payments company launches free SIS in your market** | 3 | 5 | **15** | B1/B4 |
| **R4** | **Data loss — no baseline migration, unverified backups** | 3 | 5 | **15** | B2/B7 |
| **R5** | **Child-safeguarding incident during a programme** | 2 | 5 | **10** | B9 |
| **R6** | Renewal collapse (M2 <60%) | 3 | 4 | 12 | B3 |
| **R7** | Founder burnout / illness during results week | 3 | 4 | 12 | B1 |
| **R8** | Credibility damage from unfulfilled marketing claims | 3 | 4 | 12 | B1/B2 |
| R9 | NDPA breach / regulatory action on children's data | 2 | 5 | 10 | B7 |
| R10 | Report-card calculation error at a school | 3 | 3 | 9 | B2/B9 |
| R11 | Macro: FX/inflation collapses school discretionary spend | 3 | 3 | 9 | B1 |
| R12 | Onboarding faster than support capacity → churn | 3 | 3 | 9 | B3 |
| R13 | Vercel/Supabase ToS or free-tier limit issue | 2 | 4 | 8 | B2 |
| R14 | Key school (reference account) churns publicly | 2 | 4 | 8 | B3 |
| R15 | Facilitator supply fails or costs too much | 2 | 3 | 6 | B5 |
| R16 | Government mandates a competing platform | 1 | 5 | 5 | B8 |
| R17 | Incumbent copies offline sync | 2 | 2 | 4 | B2 |

---

## 2. Mitigations for the critical five

### R1 — Founder cash exhaustion (score 20) 🔴 *the highest risk in the business*

**Why it tops the list:** [doc 05](./05-financial-model.md) §2 shows a ₦250,000/month
draw requires ~35 schools on software alone — roughly 12–18 months away. Most solo
founders do not have 18 months of personal runway, and the failure is silent: you don't
decide to quit, you simply run out and accept a job offer.

**Mitigations:**
| Action | When |
|---|---|
| **Write down your actual personal runway in months** | This week |
| Take 1–2 consulting clients at ≤10 hrs/week — deliberately, not desperately | Now |
| Prioritise programmes: 9 programme schools ≈ 35 software schools | This term |
| Push session-prepay for upfront cash | Every September |
| Set a review date at 60% of runway consumed — decide while options remain | Diarise it |

> **The mistake to avoid:** treating consulting as failure. Ten hours a week of paid
> work that buys twelve months of runway is the single highest-return activity available
> to you, because it converts the binding constraint (time-to-insolvency) into slack.

### R2 — Programme thesis fails (score 15) 🔴

**Mitigations:**
- **Test it this term**, one school, ~₦0 at risk ([doc 11](./11-data-validation-plan.md) M3)
- Pre-commit to the decision table so the outcome is acted on, not rationalised
- Prepare the fallbacks now: (a) school-funded programmes rather than parent-funded, (b) restructure to a lifestyle-business cost base, (c) stop
- **Do not build programme infrastructure before the pilot.** Test with a Google Form, a Paystack link and one facilitator.

### R3 — Free SIS from a payments company (score 15) 🔴

Structurally rational for them ([doc 03](./03-market-analysis.md) §4) — assume it
happens.

**Mitigations:**
- Never compete on software price; compete on programmes, league, credentials
- **Integrate with the payment rail rather than fight it** — become a complement
- Build sponsor-funded delivery so you can be free *and* better ([doc 07](./07-moat-and-defensibility.md) L5)
- Lock associations locally; national deals do not automatically win LGAs
- Keep the codebase clean and API-friendly so acquisition remains a good outcome

### R4 — Data loss (score 15) 🔴 *the cheapest critical risk to eliminate*

`supabase/migrations/` cannot rebuild the database — the foundational migration is
absent `[CODE]`. There is no evidence of tested backups.

**Mitigations — ~4 hours total, do them first:**
| # | Action |
|---|---|
| 1 | `supabase db dump` → commit as `00000000000001_baseline.sql` |
| 2 | Verify a fresh local DB builds from migrations alone |
| 3 | Enable automated daily backups |
| 4 | **Restore-test monthly** — an untested backup is not a backup |
| 5 | Keep one weekly off-platform copy |

> Four hours removes a score-15 risk permanently. Nothing else in this folder has that
> return.

### R5 — Safeguarding incident (score 10, but *unrecoverable*)

Low likelihood, but the impact is not "severe" — it is **terminal**, and no revenue or
product quality offsets it.

**Mitigations — all mandatory before the first session:**
- Written child-protection policy signed by every facilitator
- **A school staff member present at every session, always** (free, and the single most effective control)
- No 1-to-1 contact; no private facilitator–student messaging
- ID + references on file; written parental consent
- Same-day incident-reporting route
- CAC Ltd for limited liability before programmes begin

---

## 3. Risk themes

| Theme | Risks | Insight |
|---|---|---|
| **Founder fragility** | R1, R7 | You are the company. Your health and personal finances are business risks and belong in this register. |
| **Unvalidated thesis** | R2 | One cheap experiment collapses the largest strategic uncertainty. Do it now. |
| **Structural competition** | R3, R16 | Cannot be prevented, only positioned around. |
| **Data stewardship** | R4, R9, R10 | You hold children's records. This deserves more seriousness than the product currently shows. |
| **Credibility** | R8, R14 | In a referral market, trust is the distribution channel — and it is non-renewable. |
| **Capacity** | R6, R12, R15 | Growing faster than you can support is self-inflicted churn. |

---

## 4. Early-warning indicators

Watch these weekly; each is a leading signal, not a lagging one.

| Signal | Warns of | Threshold |
|---|---|---|
| Teacher activation falling | R6 churn | <50% |
| Support hours rising per school | R7, R12 | >6 hrs/school/term |
| Cash reserve shrinking | R1 | <2 months |
| A competitor visits one of your schools | R3 | Any instance — ask your schools to tell you |
| Sync failure rate rising | R10 | >5% |
| Renewal conversations getting harder | R6, R11 | Subjective, but you will feel it — record it |
| Founder working >60 hrs for 3 weeks | R7 | 3 consecutive weeks |

---

## 5. Risks you should deliberately accept

Not every risk deserves mitigation. Accepting these consciously frees capacity:

| Accepted risk | Why accept |
|---|---|
| Incumbents copying the offline engine (R17) | 12–18 month lag is enough; spend the time building L2–L6 instead |
| Not serving low-cost schools | Correct segmentation, not a gap ([doc 03](./03-market-analysis.md) §2) |
| No mobile app (web only) | PWA suffices; native app would consume a quarter for marginal gain |
| No fee-management module yet | Real gap, but Layer 4 timing is a judgement call — accept for now, revisit at 20 schools |
| Slower growth than a funded competitor | Density beats speed for the moat; you cannot win a spending race anyway |
| Government market ignored | No working capital for 6–18 month receivables |

**Naming accepted risks matters** — it stops them being rediscovered as crises and
prevents guilt-driven detours into work that doesn't serve the plan.
