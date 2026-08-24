# 11 — Data & Validation Plan

> You asked: **what data do we need to get and validate, and what do we do with the
> outcome?** This document answers both halves. Every metric below has a **collection
> method, a decision threshold, and a pre-committed action for each outcome band.**
>
> The pre-commitment is the point. Deciding *now* what a 6% programme take-up means
> prevents you from rationalising it later. **A metric without a pre-agreed action is
> vanity.**

---

## 1. The validation hierarchy

Not all uncertainty is equal. Test in this order, because a failure at a lower number
makes the higher ones irrelevant.

```
┌──────────────────────────────────────────────────────────────┐
│ TIER 0 — DOES THE PRODUCT WORK IN A REAL SCHOOL?             │
│ M7 teacher activation · M8 report cards printed              │
│ Fail → nothing else matters                                  │
├──────────────────────────────────────────────────────────────┤
│ TIER 1 — WILL SCHOOLS PAY, AND KEEP PAYING?                  │
│ M1 conversion · M2 renewal                                   │
│ Fail → the wedge is broken; no distribution                  │
├──────────────────────────────────────────────────────────────┤
│ TIER 2 — WILL PARENTS PAY FOR PROGRAMMES?  🔴 THE BIG ONE    │
│ M3 take-up · M4 facilitator supply                           │
│ Fail → Path A → no viable business                           │
├──────────────────────────────────────────────────────────────┤
│ TIER 3 — DOES THE MOAT COMPOUND?                             │
│ M5 sponsors · M6 referral · M9 league pull                   │
│ Fail → a good small business, not a defensible one           │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Tier 0 — Product truth

### M7 — Teacher activation rate 🔴 *the most predictive number in the business*

**Definition:** teachers who entered ≥1 score this term ÷ teachers with accounts.

**Collection:** SQL against `scores` grouped by `created_by` per school, per term. **Build
this query once and run it weekly** — it takes 20 minutes to write and it is the closest
thing you have to an early-warning system.

**Thresholds & pre-committed actions:**

| Result | Meaning | Action |
|---|---|---|
| **≥70%** | Genuine adoption | Proceed; this school is renewable and referenceable |
| **40–69%** | Partial — usually 2–3 resistant teachers | On-site retraining within 7 days; identify whether it is UX or willingness |
| **<40%** | 🔴 The school has churned and hasn't said so | Emergency intervention. **Do not sell another school until fixed** — you would be replicating a broken deployment |

### M8 — Report cards printed per school per term

**Definition:** count of printed/generated report cards ÷ enrolled students.

| Result | Action |
|---|---|
| ≥95% | Core value delivered. Ask for testimonial + referral immediately |
| 50–94% | Investigate: which classes failed, and why |
| <50% | 🔴 They reverted to manual. **Root-cause this before anything else** |

### M10 — Sync failure rate

**Definition:** failed sync batches ÷ total batches; plus time-to-sync after
reconnection.

**Collection:** instrument the sync orchestrator `[CODE]` to log outcomes.

| Result | Action |
|---|---|
| <2% failures | Healthy — **use it as a marketing claim** (a true one, finally) |
| 2–10% | Investigate error attribution; fix top cause |
| >10% | 🔴 Stop selling. Your differentiator is broken and word will spread |

---

## 3. Tier 1 — Will schools pay?

### M1 — Trial-to-paid conversion

**Definition:** schools that pay ÷ schools that started a trial.

**Target: ≥40%** for founder-led, high-touch sales.

| Result | Interpretation | Action |
|---|---|---|
| ≥50% | Strong product-market fit | **Consider raising price** — you are underpriced |
| 30–49% | Normal | Continue; tighten onboarding |
| 15–29% | Weak | Diagnose: price, product, or wrong segment? Interview all 5 lost schools |
| <15% | 🔴 Fundamental mismatch | **Stop selling. Re-interview 10 schools before spending another founder hour.** |

**Also record, for every single loss, one of:** price / features / no perceived need /
teacher resistance / chose competitor / went silent. Five losses with reasons is more
actionable than fifty without.

### M2 — Termly renewal rate 🔴

**Definition:** schools paying for term N+1 ÷ schools that paid for term N.

**Target: ≥85%.** With 3 renewal events per year, 85% termly = **61% annual retention** —
survivable but not good. 95% termly = 86% annual.

| Result | Action |
|---|---|
| ≥90% | Excellent. **Now is the moment to accelerate acquisition** |
| 80–89% | Acceptable. Interview every non-renewer |
| 60–79% | ⚠️ Value not sticking. **Pause acquisition; fix retention.** Adding schools to a leaky bucket wastes the scarcest resource you have |
| <60% | 🔴 The model does not work as configured. Full strategy review |

> **The asymmetry to internalise:** at 85% termly renewal, one saved school is worth
> more than one new school — because it costs 3 support hours instead of 20 sales hours.
> Retention is 6× cheaper than acquisition here.

---

## 4. Tier 2 — The decisive test 🔴

### M3 — Programme take-up rate — *the single most important number in this entire folder*

**Definition:** students whose parents **paid** for a programme ÷ students in the school.

**Why it decides everything:** [doc 05](./05-financial-model.md) §3 shows Path A
(software only) never pays the founder. Programme revenue is the entire difference
between a hobby and a company. **This number determines which business you are in.**

**How to test it cheaply — one term, one school, ~₦0 at risk:**

| Step | Detail |
|---|---|
| 1 | Pick your **best-adopting** school (highest M7) — you want a clean signal, not a hard case |
| 2 | Write **one** 6-session curriculum. Coding. Nothing else. |
| 3 | Recruit 1–2 facilitators from a university society ([doc 10](./10-roles-and-hiring-plan.md) R2) |
| 4 | Send a parent letter **through the school, in the school's name**: 6 sessions, ₦2,500, certificate, showcase day |
| 5 | Take payment via Paystack `[CODE]`. **Payment, not interest — expressed interest is not data** |
| 6 | Close enrolment at day 10 and count |

**Pre-committed decision table:**

| Take-up | Interpretation | Committed action |
|---|---|---|
| **≥30%** | 🟢 Strong demand | **Reorganise the company around programmes.** Raise the price to ₦3,500 next term. Hire a coordinator at 5 schools. This is the business. |
| **20–29%** | 🟢 Viable | Proceed as planned in [doc 04](./04-business-model.md). Roll out to 3 schools next term. |
| **10–19%** | 🟡 Marginal | Test **one** variable: price (₦1,500), or programme type (entrepreneurship), or delivery slot. **Change one thing, not three** — otherwise the second test teaches you nothing. |
| **<10%** | 🔴 Thesis invalidated | **Do not repeat with a second school.** Either (a) pivot to school-funded programmes (school pays from fees, offers it to all students), or (b) accept Path A and restructure as a lifestyle software business with a founder-affordable cost base, or (c) stop. |

**Also capture, because the number alone is not enough:**
- Which class/age had highest take-up → tells you where to focus
- What parents asked before paying → your future sales copy, in their own words
- Reasons for refusal (the school admin will hear these) → the real objection
- Session attendance rate — **paying and attending are different validations**
- Whether parents would pay again next term (ask at the showcase, when sentiment is highest)

### M4 — Facilitator supply

**Definition:** can you recruit a competent facilitator at ≤₦18,000/session?

| Result | Action |
|---|---|
| Yes, multiple candidates | 🟢 Margin model holds |
| Yes, but only one | ⚠️ Single point of failure — recruit a bench of 3 before scaling |
| Requires >₦25,000/session | 🔴 Margin drops below 40%. Reprice programmes upward or restructure to fewer, larger cohorts |

---

## 5. Tier 3 — Does the moat compound?

### M5 — Sponsor conversion
**Test:** after one pilot with documented outcomes, approach 5 CSR/foundation contacts.

| Result | Action |
|---|---|
| ≥1 commits ≥₦1M | 🟢 L5 pricing weapon is real — build a repeatable sponsor pack |
| Interest but no commitment | ⚠️ Evidence insufficient. Run 2 more terms, then return with harder data |
| 0 interest after 5 | Deprioritise L5; lean on M3 revenue instead |

### M6 — Referral rate
**Definition:** new schools sourced by referral ÷ total new schools.

| Result | Action |
|---|---|
| ≥40% | 🟢 Cluster strategy works. Systematise the ask ([doc 06](./06-go-to-market.md) §4 stage 6) |
| 15–39% | Ask more explicitly and by name |
| <15% | ⚠️ Either satisfaction is lower than you think, or you are not asking. **Check M2 — they usually move together** |

### M9 — League pull (Year 2)
**Definition:** do schools cite competition/league participation as a reason to join or stay?

**Collection:** ask in every renewal conversation: *"What would make you not renew?"* and
*"What do you value most?"* — unprompted mention of programmes or competition is the
signal.

| Result | Action |
|---|---|
| Schools ask to join *because of* the league | 🟢 **L3 network effect is live.** This is the moat working. Invest heavily. |
| Schools participate but don't cite it | ⚠️ Make it more parent-visible: publish standings on school sites `[CODE]`, press coverage |
| Low participation | Reassess whether density is sufficient — you may need more schools per LGA first |

---

## 6. Market data to collect once

| # | Data | Source | Use |
|---|---|---|---|
| M11 | **LGA school census** — every private school, students, fees, proprietor | Ministry list, NAPPS, Google Maps, drive-around | The target list. **Do this first** ([doc 03](./03-market-analysis.md) §6) |
| M12 | Programme demand signal | Waitlist CTA on the roadmap-labelled Programmes section `[CODE]` | Free demand measurement; also fixes claim H1 |
| M13 | Competitor pricing, in writing | Their sites, or a proprietor who has quotes | Positioning — never quote from memory |
| M14 | Actual results-week hours | Ask 10 principals: *"How long did compiling results take last term?"* | **The ROI number in your pitch, in their words** |
| M15 | Fee bands per school | Signboards, parents, admin office | Qualification filter |
| M16 | Teacher smartphone ownership | Ask 3 schools: *"How many teachers have Android phones?"* | Validates the delivery assumption everything rests on |

**M14 is worth special attention.** "Results week takes us three weeks and two
weekends" said by a principal is a more powerful sales asset than any feature list —
and it costs one question to obtain.

---

## 7. The one-page dashboard

Track weekly in a single sheet. **Do not build software for this.**

| Metric | Now | Target | Status |
|---|---|---|---|
| M7 Teacher activation | — | ≥70% | |
| M8 Report cards printed | — | ≥95% | |
| M10 Sync failure rate | — | <2% | |
| M1 Trial→paid | — | ≥40% | |
| M2 Termly renewal | — | ≥85% | |
| **M3 Programme take-up** | — | **≥20%** | 🔴 **untested** |
| M4 Facilitator cost/session | — | ≤₦18k | |
| M6 Referral share | — | ≥40% | |
| Cash reserve (months) | — | ≥2 | |
| Founder hrs/school/week | — | falling | |

---

## 8. Kill criteria `[DECISION]` D8

Written now, while judgement is clear. **Pre-commitment is the only defence against
sunk-cost reasoning.**

| Checkpoint | Condition to continue | If failed |
|---|---|---|
| **End of Term 1** | ≥3 paying schools **and** M7 ≥50% | Product or fit problem. Fix before selling more. |
| **End of Term 2** | ≥6 paying schools, M2 ≥70%, **M3 tested** | If M3 <10%, choose explicitly: pivot, restructure to Path A economics, or stop |
| **End of Term 3** | ≥10 schools, M2 ≥80%, ≥1 programme cohort delivered | If not, the founder-hour model is not working — reconsider going part-time |
| **End of Year 1** | ≥12 schools, positive cash, **programme revenue > software revenue** | If software still dominates, you are on Path A. Confront it. |
| **Personal** | Founder personal runway not exhausted | Take bridge consulting work **before** the crisis, not during ([doc 05](./05-financial-model.md) §6) |

> **The point of writing these down now:** in month 9, with 7 schools and no salary,
> every one of these thresholds will feel negotiable. They are not. Judge the business
> against the standards you set while you were thinking clearly.

---

## 9. Research discipline

| Rule | Why |
|---|---|
| **Payment > interest** | "I would definitely pay" is not data. A Paystack receipt is. |
| **Ask about the past, not the future** | *"How long did results take last term?"* beats *"would you use this?"* |
| **Interview every loss** | Lost schools tell you more than won ones, and they are honest because they owe you nothing |
| **One variable per test** | Change price *or* programme *or* timing. Never all three. |
| **Write the decision before the test** | This document exists for that reason |
| **n=5 is enough to act on at this stage** | Perfect data at 15 schools is a luxury; directional data is sufficient and cheap |
