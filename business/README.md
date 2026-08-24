# NexaForge — Business, Model & Operations Documentation

> **Context this was written under:** solo founder, **₦0 external capital**, no team, no runway.
> Services are to be paid for out of revenue from early adopters, in sequence.
> Every recommendation in this folder respects that constraint. Where a recommendation
> costs money, it states **what revenue milestone unlocks it**.

---

## Reading order

If you read only three documents, read **00**, **07**, and **13**.

| # | Document | What it answers |
|---|---|---|
| [00](./00-executive-summary.md) | Executive Summary | The whole thesis in one page, plus the five decisions that matter |
| [01](./01-value-proposition.md) | Value Proposition | What we actually sell, to whom, and why they care |
| [02](./02-product-claims-audit.md) | Product Claims Audit | **Marketing copy vs. shipped code.** Contains legal/credibility exposure — read early |
| [03](./03-market-analysis.md) | Market Analysis | Market size, segments, competitor teardown, the payments threat |
| [04](./04-business-model.md) | Business Model | Revenue architecture, pricing redesign, unit economics |
| [05](./05-financial-model.md) | Financial Model | Zero-budget cost ladder, break-even points, seasonality, the August gap |
| [06](./06-go-to-market.md) | Go-To-Market | The cluster motion, founder-hour budget, CAC ceilings |
| [07](./07-moat-and-defensibility.md) | Moat & Defensibility | The 6-layer compounding stack — how this becomes hard to copy |
| [08](./08-operational-plan.md) | Operational Plan | The term-cycle operating rhythm, SOPs, SLAs, peak surges |
| [09](./09-operational-bodies.md) | Operational Bodies | The 9 essential operating functions, who owns each now, and the trigger to separate it |
| [10](./10-roles-and-hiring-plan.md) | Roles & Hiring | Every role, when it unlocks, how it gets paid with no budget |
| [11](./11-data-validation-plan.md) | Data & Validation Plan | **Every metric to collect, its threshold, and what to do at each outcome** |
| [12](./12-risk-register.md) | Risk Register | Scored risks, owners, early-warning triggers |
| [13](./13-90-day-execution-plan.md) | 90-Day Execution Plan | What to do on Monday |

### Adversarial review

Five hostile perspectives, each in `role: question` form, then reconciled.

| Document | Role | Question put to it |
|---|---|---|
| [founder](./adversarial-review/founder.md) | Founder | Make this opportunity commercially attractive |
| [customer](./adversarial-review/customer.md) | Customer | Explain why you would or wouldn't pay for this |
| [competitor](./adversarial-review/competitor.md) | Competitor | How would an established company destroy this |
| [engineer](./adversarial-review/engineer.md) | Engineer | Determine whether this can be built cheaply |
| [vc](./adversarial-review/vc.md) | VC | Try to prove this business would fail |
| [**synthesis**](./adversarial-review/synthesis.md) | — | Bringing their conclusions together |

### ⚠️ The adversarial review changed the plan

Three findings override earlier documents. **The synthesis is authoritative where it
conflicts with docs 00–13:**

1. **The bursar problem.** Three roles independently found that the person who approves
   spending cares about *fees*, not report cards — and that a payments company can earn
   ~11× our subscription revenue from the fee rail while giving software away free.
   **Fee tracking (ledger only, never payment processing) moves forward** from Layer 4.
2. **Build order.** Baseline migration (4h) → claims fixes (4h) → export (14h) →
   **CSV import (16h)** → attendance (18h) → fee ledger (40–60h). CSV import jumps ahead of
   customer-facing features because it converts founder hours into software.
3. **Test M3 at two price points** (₦2,500 and ₦1,500), not one — so a weak result
   distinguishes *no demand* from *wrong price*.

---

## Evidence legend

Every material claim in these documents is tagged. **Respect the tags.** The
difference between a plan that works and a pitch that collapses in a meeting is
whether you know which of your numbers are real.

| Tag | Meaning |
|---|---|
| `[CODE]` | Verified by reading this repository. Reliable. |
| `[ASSUMPTION]` | My estimate. **Not verified.** Has a named validation source in [doc 11](./11-data-validation-plan.md). |
| `[VERIFY]` | A specific external fact you must confirm before using it publicly (competitor pricing, regulation, market counts). |
| `[DECISION]` | A choice you must personally make; the doc gives a recommendation and the trade-off. |
| `[RISK]` | Something that can kill the business or expose you legally. |

**On research:** this analysis was produced without live web access. Market sizes,
competitor details and regulatory specifics are therefore reasoned estimates,
explicitly tagged, each paired with the exact source you should check. That is
precisely why [doc 11](./11-data-validation-plan.md) is the operational heart of
this set — it converts assumptions into a measurement programme with pre-committed
decisions.

---

## Baseline assumptions used throughout

Change these in one place and the models move together.

| Variable | Value | Basis |
|---|---|---|
| FX rate | ₦1,600 = US$1 | `[ASSUMPTION]` — volatile, re-check monthly |
| Terms per year | 3 (Sept–Dec, Jan–Apr, Apr–Jul) | Nigerian academic calendar |
| Term length billed | 120 days | `[CODE]` `PLAN_TERM_DAYS` in `src/lib/paystack/plans.ts` |
| Dead month | August (₦0 revenue) | Marketing promise: "No August charges" `[CODE]` |
| Plan prices | ₦15,000 / ₦30,000 / ₦60,000 per term | `[CODE]` `SUBSCRIPTION_PLANS` |
| Blended ARPA | **₦81,000 / school / year** | Derived, mix 50/35/15 — see [doc 04](./04-business-model.md) |
| Founder productive capacity | 50 hrs/week, 45 weeks/year | `[ASSUMPTION]` |
| Founder minimum draw | ₦250,000/month | `[DECISION]` — adjust to your reality |

---

## The one-sentence thesis

> Software is not the business. Software is how we acquire the schools and
> accumulate the academic data that makes the *actual* business — programmes,
> credentialing, and a school network with status value — impossible for a
> latecomer to assemble.

If you disagree with that sentence, most of this folder needs rewriting. Read
[doc 07](./07-moat-and-defensibility.md) before deciding.
