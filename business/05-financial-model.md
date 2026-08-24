# 05 — Financial Model (Zero-Capital)

> Built for the actual constraint: **₦0 starting capital, no runway, no investor.**
> The governing rule throughout is **every cost must be triggered by revenue that has
> already arrived.** No cost in this document is incurred in anticipation of growth.

**Baselines:** ₦1,600/USD `[ASSUMPTION]` · 3 terms/year · 120-day terms `[CODE]` · August = ₦0 revenue.

---

## 1. The cost ladder — what you pay, and when it unlocks

The most important table in this document. Read the **Trigger** column as a hard gate:
do not incur the cost until the trigger fires.

### Stage 0 — Pre-revenue (now) · target ₦0/month

| Item | Cost/mo | Notes |
|---|---:|---|
| Supabase | ₦0 | Free tier: 500MB DB, 1GB storage. Handles ~10–20 small schools `[ASSUMPTION]` |
| Vercel | ₦0 | Hobby tier. **⚠ Hobby prohibits commercial use — see §7** `[VERIFY]` |
| Domain `nexaforges.me` | ~₦1,700/mo | ~₦20k/yr, already held |
| Resend (email) | ₦0 | 3,000/mo free `[CODE]` |
| Paystack | ₦0 fixed | 1.5% + ₦100/txn, capped ₦2,000 `[VERIFY]` |
| GitHub, Supabase CLI | ₦0 | — |
| Transport/data for sales | ₦15,000 | **The only real pre-revenue cost** |
| **Total** | **~₦17,000/mo** | Fundable from personal cash |

> **Implication:** you can operate for roughly **₦17,000/month** until the first school
> pays. Two Starter schools (₦30,000/term) cover a full term of this. **The financial
> barrier to starting is essentially zero — the barrier is founder time.**

### Stage 1 — 1–10 schools · unlock at first ₦100k collected

| Item | Cost/mo | Trigger |
|---|---:|---|
| Stage 0 baseline | ₦17,000 | — |
| Vercel Pro | ₦32,000 ($20) | **Move here as soon as you charge money** (§7) |
| Supabase Pro | ₦40,000 ($25) | At ~15 schools or when free-tier limits near |
| Business registration (CAC Ltd) | ₦8,000 amortised | ~₦100k one-off; needed for corporate accounts + sponsor contracts |
| **Total** | **~₦57,000–97,000/mo** | Covered by ~4 Growth schools |

### Stage 2 — 10–30 schools · unlock at ₦300k/term recurring

| Item | Cost/mo | Trigger |
|---|---:|---|
| Stage 1 | ₦97,000 | — |
| **Support/onboarding assistant** (part-time) | ₦80,000 | **When founder support exceeds 15 hrs/week** |
| Programme facilitators (variable) | ₦90,000/school/term | **Only against collected programme fees** |
| Error monitoring (Sentry) | ₦0–20,000 | Free tier viable |
| Backups (automated) | ₦8,000 | **Immediately** — non-negotiable ([doc 02](./02-product-claims-audit.md) H5) |
| **Total fixed** | **~₦185,000/mo** | |

### Stage 3 — 30–60 schools · unlock at ₦1M/term recurring

| Item | Cost/mo | Trigger |
|---|---:|---|
| Stage 2 | ₦185,000 | — |
| Programme Coordinator (full-time) | ₦250,000 | ≥5 schools running programmes |
| Second engineer (contract/part-time) | ₦300,000 | Founder coding time <10 hrs/week |
| Sales/onboarding rep | ₦150,000 + commission | Founder selling >20 hrs/week |
| Accounting/compliance | ₦50,000 | Post-CAC registration |
| **Total** | **~₦935,000/mo** | Needs ~₦2.8M/term |

**Design principle:** every line is **revenue-triggered**, not calendar-triggered.
The company cannot become insolvent by following this ladder, because no stage is
entered before the previous stage's revenue exists.

---

## 2. Break-even analysis

### Software-only break-even

| Scenario | Monthly cost | Schools needed (Growth @ ₦30k/term = ₦10k/mo equiv.) |
|---|---:|---:|
| Stage 0 (₦17k) | ₦17,000 | **2 schools** |
| Stage 1 (₦97k) | ₦97,000 | **10 schools** |
| Stage 1 + founder draw ₦250k | ₦347,000 | **35 schools** |
| Stage 3 + founder draw | ₦1,185,000 | **119 schools** |

**The critical finding:** paying yourself ₦250,000/month requires **~35 schools on
software alone.** At a realistic ~35 schools/year of founder capacity
([doc 04](./04-business-model.md) §6), that means **12+ months of unpaid work** —
which is the single largest risk to this venture, and it is a personal-finance risk,
not a business risk.

### Break-even with programmes

One 400-student school running one programme at 30% take-up yields **₦150,000/term
gross profit** ([doc 04](./04-business-model.md) §2).

| To cover | Programmes needed | Schools needed |
|---|---:|---:|
| Stage 1 costs (₦97k/mo = ₦388k/term) | 2.6 | **3 schools** |
| Stage 1 + ₦250k draw (₦1.39M/term) | 9.3 | **~9 schools** |

> **Nine schools with programmes ≈ thirty-five schools without.** This is the entire
> financial argument for prioritising programmes, expressed as a single comparison.
> It is also why the programme pilot is scheduled for *this term* rather than "once
> we have scale."

---

## 3. Three-year projection

### Path A — Software only (the trap)

| | Year 1 | Year 2 | Year 3 |
|---|---:|---:|---:|
| Schools (end of year) | 12 | 35 | 70 |
| Software revenue | ₦730,000 | ₦2,600,000 | ₦5,400,000 |
| Costs | ₦700,000 | ₦2,400,000 | ₦6,000,000 |
| **Net** | **₦30,000** | **₦200,000** | **–₦600,000** |
| Founder draw | ₦0 | ₦0 | ₦0 |

**Verdict:** three years of full-time work for no income. Growing schools raises
support cost faster than revenue. **Path A fails**, and it fails *quietly* — always
almost-working, never actually working. That is the most dangerous kind of failure
because it consumes years.

### Path B — Software + programmes (recommended)

Assumes programmes launch Term 2 of Year 1, ~60% of schools eventually adopt.

| | Year 1 | Year 2 | Year 3 |
|---|---:|---:|---:|
| Schools (end of year) | 10 | 28 | 55 |
| Schools w/ programmes | 3 | 15 | 38 |
| Software revenue | ₦620,000 | ₦2,100,000 | ₦4,300,000 |
| Programme revenue | ₦1,350,000 | ₦9,000,000 | ₦25,650,000 |
| Sponsor revenue | ₦0 | ₦3,000,000 | ₦12,000,000 |
| **Total revenue** | **₦1,970,000** | **₦14,100,000** | **₦41,950,000** |
| Direct costs (facilitators, materials) | ₦675,000 | ₦4,500,000 | ₦12,825,000 |
| Fixed costs | ₦700,000 | ₦3,200,000 | ₦11,000,000 |
| **Net before founder draw** | **₦595,000** | **₦6,400,000** | **₦18,125,000** |
| **Sustainable founder draw** | ₦0–50k/mo | **₦300,000/mo** | **₦800,000/mo** |

**Verdict:** Year 1 remains hard — plan for it explicitly. Year 2 becomes a real
business. Year 3 supports a team. **Note that Path B has *fewer* schools than Path A
and more than 7× the revenue.** Depth beats breadth for a solo founder, because depth
costs founder-hours once and pays repeatedly.

`[ASSUMPTION]` Every figure here depends on programme take-up ≥20%. If measured
take-up is <10%, see [doc 11](./11-data-validation-plan.md) M3 decision table.

---

## 4. Cash-flow seasonality — the August problem

Revenue is **lumpy and predictable**, which is manageable only if planned.

```
Sept  ████████████████  Term 1 collection (peak)
Oct   ███
Nov   ██
Dec   █                 Term 1 ends
Jan   ████████████████  Term 2 collection (peak)
Feb   ███
Mar   ██
Apr   █ / ████████████  Term 2 ends / Term 3 collection
May   ███
Jun   ██
Jul   █                 Term 3 ends
Aug   ─────────────     ₦0 BY PROMISE
```

**Three structural cash risks:**

1. **August is zero-revenue by design** `[CODE]`, and it is also when schools do their
   own annual spending — so it is simultaneously your lowest-income and
   highest-temptation month.
2. **Term-start collection is not instant.** Schools pay 1–3 weeks after resumption,
   because they are waiting for parents to pay fees. Assume a 3-week lag.
3. **Renewal is a decision, not a default** — three times a year.

**Mitigations, in priority order:**

| # | Mitigation | Mechanics |
|---|---|---|
| 1 | **Hold a 2-month reserve at all times** | From Term 3 collections, ring-fence 2× monthly fixed cost before any draw. Non-negotiable. |
| 2 | **Push session-prepay in September** | Full-year cash upfront at ~12% discount ([doc 04](./04-business-model.md) §5), or full price + programme credit |
| 3 | **Run a paid August holiday programme** | Converts the dead month into revenue *and* validates programme demand when schools are idle. **This is the best single answer to seasonality** — it uses a liability as an asset |
| 4 | **Invoice programmes at term start**, alongside school fees | Parents pay when they are already paying |
| 5 | **Never schedule a fixed-cost increase for Q3** | Structural rule |

---

## 5. Sensitivity — what breaks the model

| Variable | Base | Downside | Effect |
|---|---|---|---|
| **Programme take-up** | 30% | **10%** | Year 3 revenue falls ~₦17M. **The dominant variable.** |
| Term renewal rate | 85% | 60% | School count compounds *downward*; Year 3 ≈ 22 schools |
| Schools closed per year | 5% | 15% | Nigerian private schools do close — assume real attrition |
| FX rate | ₦1,600 | ₦2,400 | USD infra costs +50%; a ₦72k/mo bill becomes ₦108k |
| Founder capacity | 35 schools/yr | 15 | Timeline stretches ~2.3× |
| Price realisation | 100% | 70% | Discounting under pressure destroys the thin software margin |

**Ranked, the model is most sensitive to: (1) programme take-up, (2) renewal rate,
(3) founder capacity.** Note that *none* of these are solved by money — all three are
solved by execution quality. That is genuinely good news for a bootstrapper: your
constraint is not the thing you lack.

---

## 6. Founder personal finances `[DECISION]` D5

Ignored in most business plans; **the leading cause of solo-founder failure.**

| Question | Recommendation |
|---|---|
| How long can you survive at ₦0 income? | **Write the number down.** That is your true runway — not the company's. |
| Minimum monthly draw needed | ₦250,000 `[DECISION]` — adjust to reality |
| Trigger for first draw | When collected revenue in a term ≥ 2× (term fixed costs + reserve) |
| Bridge income | **Take on 1–2 paid dev/consulting clients at ≤10 hrs/week.** This buys 12 months of runway and is a rational strategy, not a distraction. |
| Hard stop | If <5 paying schools after 2 terms of full-time effort, **stop and reassess** ([doc 11](./11-data-validation-plan.md)) |

> **The most likely way this company dies is not competition or product failure. It is
> the founder running out of personal money in month 9 and taking a full-time job.**
> Plan the founder's finances with the same rigour as the company's.

---

## 7. `[RISK]` Compliance and financial hygiene — three items

| Item | Issue | Action |
|---|---|---|
| **Vercel Hobby licence** | Hobby tier is **for non-commercial use**; charging schools while on Hobby is a ToS breach that could deplatform every school website you host `[VERIFY]` | Move to Pro ($20/mo) at the first paid school. ₦32k/mo is not worth the platform risk. |
| **CAC registration** | Needed for a corporate bank account, sponsor contracts, government work, and limited liability on child-safeguarding exposure | Register a Ltd before signing sponsors (~₦100k) |
| **NDPA compliance** | You process children's personal data — likely the most sensitive category in Nigerian law. Registration/DPO obligations may apply above thresholds `[VERIFY]` | See [doc 09](./09-operational-bodies.md) — Data Protection function |
| **Separate accounts** | Mixing personal and business cash makes reserve discipline impossible | Separate account from school #1, even before CAC |

---

## 8. Financial dashboard — six numbers, weekly

Do not build reporting. Track these in one spreadsheet:

| # | Metric | Target |
|---|---|---|
| 1 | Cash in bank | ≥ 2× monthly fixed cost |
| 2 | Schools paid this term / total live | ≥90% |
| 3 | Committed revenue this term | Trending up |
| 4 | Monthly fixed cost | Flat unless a trigger fired |
| 5 | Months of reserve | ≥2 |
| 6 | **Founder hours per school per week** | **Trending ↓ — the real scalability signal** |

Metric 6 is the one nobody tracks and the one that decides whether this business can
grow. If founder-hours-per-school is flat as school count rises, you have a
consultancy wearing a SaaS costume. If it declines, you have a product.
