# 04 — Business Model

> **The central argument of this document:** the subscription business as currently
> priced cannot pay a founder, let alone build a company. But the *same customer
> relationship*, monetised through the parent's wallet instead of the school's
> software budget, is 10–13× larger. The subscription must be reclassified from
> *product* to **customer-acquisition and data infrastructure.**

---

## 1. Business Model Canvas

### Customer segments
- **Primary:** Established mid-tier private schools, 250–600 students, ₦100k–400k/term fees ([doc 03](./03-market-analysis.md) Segment B)
- **Secondary:** Growing neighbourhood schools, 100–350 students (Segment C)
- **The real end customer, unrecognised in the current model:** the **fee-paying parent**, reached through the school. 15 schools × 400 students = **6,000 parent relationships** acquired at effectively zero marginal CAC.
- **Later:** state governments, CSR sponsors, device buyers

### Value propositions
| To whom | What they get |
|---|---|
| Principal | Results week collapses from 40+ hours to an afternoon `[CODE]` |
| Proprietor | A differentiation story and a professional web presence |
| Teacher | Score entry that works without network `[CODE]` |
| **Parent** | **Their child learns to code / pitch / speak — and it's verifiable** |
| Sponsor/CSR | Measurable, auditable education impact across a school network |

### Channels
1. **Founder direct sales** within one LGA cluster (Year 1 — the only channel that works at ₦0)
2. **School-to-school referral** (compounding, near-zero cost)
3. **NAPPS chapter meetings** — one presentation reaches 40 proprietors
4. **Parent word-of-mouth from programme outcomes** (the strongest long-run channel)
5. Later: agent/reseller network, government procurement

### Customer relationships
- High-touch founder onboarding (Year 1 — a temporary advantage worth exploiting: *"the founder will set up your school personally"* is something no incumbent can offer)
- WhatsApp-first support (this is how Nigerian SMEs actually communicate; do not build a ticketing portal)
- Termly on-site check-in during results week — the moment of maximum value and maximum churn risk

### Revenue streams
Detailed in §2. Ranked by strategic priority, **not** by current size:
1. Programme fees (per student, per term) — **the actual business**
2. Software subscription (per school, per term) — the wedge
3. Sponsor/CSR programme funding — the cross-subsidy that makes you unmatchable on price
4. Fee-collection share — the defensive move against payment-company disintermediation
5. Devices — later, working-capital heavy
6. Government/institutional contracts — later, cash-cycle heavy

### Key resources
- The platform `[CODE]` — especially the offline sync engine
- **The accumulating academic dataset** (the compounding asset; see [doc 07](./07-moat-and-defensibility.md) L2)
- Founder's credibility inside the target cluster
- Programme curriculum + facilitator network (to be built)
- The school network itself, once dense enough to have status value

### Key activities
Termly cycle ([doc 08](./08-operational-plan.md)): onboard → support results week → renew → deliver programmes → run competitions

### Key partners
| Partner | Why | Cost |
|---|---|---|
| Paystack | Collection rail `[CODE]` | Transaction fees only |
| Supabase / Vercel | Infrastructure | Free tier → paid at scale |
| **NAPPS chapters** | Distribution | Relationship + sponsorship-in-kind |
| University student societies | **Programme facilitators at near-zero cost** | Certificates + experience + small stipend |
| Corporate CSR / foundations | Programme + scholarship funding | Reporting obligations |
| Device OEMs/importers | Hardware supply | Later; consignment preferred over purchase |

### Cost structure
See [doc 05](./05-financial-model.md). At <50 schools, total cash cost is **under
₦40,000/month** `[ASSUMPTION]` — the entire business is founder time.

---

## 2. Revenue architecture — five layers

### Layer 1 — Software subscription (live today) `[CODE]`

| Plan | Price/term | Students | Staff | Annual (3 terms) |
|---|---:|---:|---:|---:|
| Starter | ₦15,000 | 200 | 10 | ₦45,000 |
| Growth | ₦30,000 | 500 | 30 | ₦90,000 |
| Premium | ₦60,000 | ∞ | ∞ | ₦180,000 |

**Blended ARPA** at an assumed 50/35/15 mix:
```
(0.50 × 45,000) + (0.35 × 90,000) + (0.15 × 180,000) = ₦81,000 / school / year
```

**Function of this layer:** not profit. It (a) proves the school will pay you at all,
(b) installs the data spine, (c) creates the relationship that makes Layer 2 sellable.
Treat it as **paid customer acquisition that happens to be cash-positive.**

### Layer 2 — Programmes (the actual business) `[ASSUMPTION]`

Already marketed `[CODE]`, entirely unbuilt.

| Programme | Price/student/term | Take-up | Delivery |
|---|---:|---:|---|
| Coding & Digital Skills | ₦2,500 | 25–35% | 6 sessions, facilitator-led |
| Entrepreneurship & Financial Literacy | ₦2,000 | 20–30% | 6 sessions |
| Public Speaking & Debate | ₦1,500 | 15–25% | 6 sessions |
| Competition entry fee | ₦1,000/participant | 10–20% | Termly event |

**Per-school economics, 400 students, 30% take-up on one ₦2,500 programme:**
```
Revenue:      120 students × ₦2,500        = ₦300,000 / term
Facilitator:  6 sessions × ₦15,000         = ₦90,000
Materials:    120 × ₦500                   = ₦60,000
Gross margin:                                ₦150,000 / term  (50%)

vs. software subscription:                    ₦30,000 / term
→ Programmes = 5× the revenue, 10× the gross profit, from the SAME school.
```

Run two programmes at 30% take-up and one school produces **~₦1.2M/year gross**
versus ₦90,000 from software. **This is the business.** `[DECISION]` **D2: pilot this
term.**

Note the crucial structural feature: **programme revenue comes from parents, not the
school.** The school's budget is fixed and contested; the parent's spend on their
child's advantage is elastic and emotionally driven. You are not asking the school
for more money — you are asking it for *access*, which is far cheaper for it to give.

### Layer 3 — Sponsor / CSR funding `[ASSUMPTION]`

Nigerian banks, telcos and foundations have CSR budgets and a permanent shortage of
credible, measurable education programmes to fund.

| Product | Ticket | What the sponsor buys |
|---|---:|---|
| Named competition sponsorship | ₦500k–5M | Brand across N schools, prize-giving, media |
| Scholarship fund (branded) | ₦1M–10M | Named awards + verified recipient outcomes |
| Programme underwriting for low-income schools | ₦2M–20M | Reach + hard impact numbers |

**Why this layer is strategically decisive, not merely additional revenue:** sponsor
money lets you deliver programmes *free* to schools that cannot pay. A pure-SaaS
competitor cannot match a free offering funded by a third party. **Sponsorship is not
income — it is a pricing weapon** ([doc 07](./07-moat-and-defensibility.md) L5).

**Prerequisite:** you cannot raise this before you have measurable outcomes from ≥5
schools. That is why the programme pilot is on the critical path for *everything*.

### Layer 4 — Fee-collection share `[ASSUMPTION]`

Defensive. A 400-student school collects ~₦44M/term; at 0.3–0.5% that is
₦132k–220k/term — **4–7× your software fee** ([doc 03](./03-market-analysis.md) §4).

Build **fee invoicing + parent payment tracking** on top of Paystack. Do not become a
PSP; do not touch settlement or hold funds — licensing and compliance would end you.
Partner, take a share or a flat SaaS uplift.

**Strategic function:** whoever owns fee collection owns the bursar. If a payments
company owns it, they own the school and you become a removable add-on. This layer is
about **preventing disintermediation**, and it is why it must not be deferred
indefinitely.

### Layer 5 — Devices `[ASSUMPTION]` — deprioritise

Marketed `[CODE]`, but: high working capital, FX exposure, import/customs friction,
warranty liability, theft/damage disputes in schools. **For a ₦0-capital founder this
is a trap.**

**If pursued:** referral-and-margin only (partner imports, you introduce, take
10–15%), or bulk-buy-club aggregation. **Never hold inventory.**

### Layer 6 — Government / institutional — later

₦50M–500M contracts `[ASSUMPTION]`, but 6–18 month payment cycles, procurement
capability and political relationships required. **A zero-capital company cannot
survive a government receivable.** Revisit at >₦5M/month recurring revenue.

---

## 3. Combined per-school economics at maturity

| Layer | Annual per school `[ASSUMPTION]` | Gross margin | Gross profit |
|---|---:|---:|---:|
| Software | ₦81,000 | 85% | ₦68,850 |
| Programmes (1.5 programmes, 30% take-up, 400 students) | ₦900,000 | 50% | ₦450,000 |
| Fee-collection share (0.3%) | ₦396,000 | 70% | ₦277,200 |
| Devices (referral) | ₦60,000 | 12% | ₦7,200 |
| **Total** | **₦1,437,000** | — | **₦803,250** |

**A mature 15-school cluster: ~₦21.5M revenue, ~₦12M gross profit.** That is a real
business for one founder plus a small team — reachable without external capital.

Compare software-only: 15 × ₦81,000 = **₦1.2M/year.** Not a business.

---

## 4. Why term-based billing is right — and its hidden cost

**Keep it.** *"Nigerian schools do not operate month to month"* `[CODE]` is genuine
insight and a differentiator no competitor is currently claiming.

**But price the risk honestly:**

| Consequence | Detail |
|---|---|
| **3 churn events/year** | Every term boundary is a fresh purchase decision. Monthly SaaS churns passively; you churn *actively*, three times a year. |
| **Renewal is an operational function, not a background process** | Requires a deliberate 3-week renewal campaign per term ([doc 08](./08-operational-plan.md)) |
| **August = ₦0 revenue** | By design and by promise. Must be funded from Term 3 cash ([doc 05](./05-financial-model.md)) |
| **Value must be re-proven each term** | Actually healthy — it forces you to remain useful |

**The mitigation is timing, not pricing.** Renewal must be requested in the **final
two weeks of term, immediately after report cards print** — the single moment of peak
demonstrated value. Ask in the holiday and you are asking a principal to pay for a
memory.

---

## 5. `[DECISION]` D3 — Pricing corrections

### 5.1 The session discount is a serious leak

Current copy: *"Pay per session and save one term's cost"* `[CODE]` — i.e. **3 terms
for the price of 2 = a 33% discount.**

```
Growth, per term:      ₦30,000 × 3 = ₦90,000
Growth, per session:   ₦60,000
Annual revenue lost:   ₦30,000 per school (33%)
```

At 50 schools that is **₦1.5M/year given away** — for a cash-flow benefit worth a
fraction of that. Standard annual-prepay discounts are 10–20%.

**Recommended:**

| Plan | Per term | Per session (recommended) | Discount |
|---|---:|---:|---:|
| Starter | ₦15,000 | **₦40,000** | 11% |
| Growth | ₦30,000 | **₦79,000** | 12% |
| Premium | ₦60,000 | **₦158,000** | 12% |

**Better still — discount with something other than price:** charge the full
₦90,000 and include a **₦30,000 programme credit.** The school perceives equal value,
you retain full software revenue, and you have pre-sold a programme — which
simultaneously funds and validates Layer 2. This is the single highest-leverage
pricing move available.

### 5.2 Add the programme revenue line

Programmes must be a **separate per-student charge**, never bundled into the
subscription. Bundling caps your revenue at the school's software budget; separating
it lets you reach the parent's wallet. Remove "NexaForge Programmes access" as a
Growth *feature* `[CODE]` and make it a purchasable add-on with a real price.

### 5.3 Keep prices low deliberately — and know why

₦30,000 is *underpriced* for a school collecting ₦60M/term ([doc 03](./03-market-analysis.md) §7).
Hold it low anyway, because:
- Speed of adoption → data density → league viability → the moat
- A low price makes you not-worth-attacking to incumbents
- Programme revenue is the margin engine; software is the door

**But make this a conscious strategy with a review trigger:** revisit software pricing
once ≥20 schools are live and programme revenue exceeds subscription revenue.

### 5.4 Fix the ₦0-revenue tier confusion

`PLAN_LIMITS` contains both `free` (50/5) and `trial` (100/10) `[CODE]`, and marketing
mentions neither. **Recommendation: no permanent free tier.** Free schools consume the
scarcest resource you have — founder support hours — and rarely convert. Use the
30-day trial only, and remove `free` from the codebase to eliminate a route to
indefinite non-payment.

---

## 6. Unit economics — the metric that actually binds you

Money is not your constraint. **Founder hours are.**

| Metric | Value `[ASSUMPTION]` |
|---|---:|
| Founder hours to close one school | 8–14 (visits, demo, follow-up, objections) |
| Founder hours to onboard one school | 6–10 (setup, data import, staff training) |
| Founder hours per school per term (support) | 3–6, concentrated in results week |
| **Total Year-1 hours per school** | **~30** |
| Founder capacity | 50 hrs/week × 45 weeks = **2,250 hrs/year** |
| **Theoretical max** | ~75 schools/yr if doing *nothing* else |
| **Realistic** (50% on product, admin, programmes) | **~35 schools/yr** |

**CAC in cash:** ~₦0 (transport + data ≈ ₦2,000–5,000/school).
**CAC in founder time:** ~20 hrs at an opportunity cost of ~₦10,000/hr = **₦200,000.**

Against ₦81,000/yr software revenue, **software-only LTV/CAC is roughly 0.4× — you
lose money on every school** once your own time is valued. Including programmes at
₦900,000/yr, LTV/CAC exceeds 10×.

> **This single calculation is the whole argument.** The subscription does not repay
> the founder time required to sell it. Programmes do. Any plan that delays
> programmes indefinitely is a plan to work for free.

---

## 7. What must be true for this model to work

| # | Assumption | How to test | Where |
|---|---|---|---|
| A1 | Schools pay ₦15k–30k/term for admin software | 5 paying schools, no extra discount | [11](./11-data-validation-plan.md) M1 |
| A2 | Schools renew at the term boundary | Term-2 renewal rate ≥70% | M2 |
| **A3** | **≥20% of parents pay ₦2,000+/term for programmes** | **One pilot cohort, one school** | **M3 — the critical one** |
| A4 | Facilitators are recruitable at ₦15k/session | Approach 3 university societies | M4 |
| A5 | Sponsors fund competitions once outcomes exist | 3 CSR conversations after pilot | M5 |
| A6 | Referral works inside a cluster | ≥1 referral per 3 happy schools | M6 |

**A3 is the load-bearing assumption of the entire business.** It is unvalidated,
untestable by analysis, and cheap to test in practice. Everything in
[doc 13](./13-90-day-execution-plan.md) is organised around testing it this term.

---

## 8. Model summary

```
                    ┌──────────────────────────────┐
                    │   SOFTWARE SUBSCRIPTION      │  ← the wedge
                    │   ₦15k–60k / term / school   │     (acquisition + data)
                    └──────────────┬───────────────┘
                                   │ installs data spine + relationship
                    ┌──────────────▼───────────────┐
                    │       PROGRAMMES             │  ← the business
                    │   ₦1.5k–2.5k / student / term│     (parent's wallet)
                    └──────────────┬───────────────┘
                                   │ produces measurable outcomes
        ┌──────────────────────────┼──────────────────────────┐
        ▼                          ▼                          ▼
┌───────────────┐        ┌──────────────────┐      ┌──────────────────┐
│ SPONSOR / CSR │        │ FEE COLLECTION   │      │ CREDENTIALS &    │
│ ₦500k–20M     │        │ 0.3–0.5% of fees │      │ LEAGUE STATUS    │
│ (pricing      │        │ (anti-disinter-  │      │ (the long-run    │
│  weapon)      │        │  mediation)      │      │  moat)           │
└───────────────┘        └──────────────────┘      └──────────────────┘
```

**One sentence:** *Sell cheap software to own the school's academic data, use that
relationship to sell programmes to parents at 10× the value, use the resulting
outcomes to attract sponsor money that lets you undercut every competitor, and use
the accumulated network to become the standard nobody can rebuild.*
