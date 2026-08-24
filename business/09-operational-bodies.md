# 09 — Operational Bodies

> You asked which bodies are essential for running this company from here on.
> **Critical framing: a "body" is a *function that must be owned*, not a department
> with staff.** Today one person wears all nine hats. The value of naming them is
> that unowned functions fail silently — nobody notices that safeguarding has no
> owner until an incident occurs.
>
> Each body below states: what it owns, why it cannot be skipped, who owns it now,
> and **the trigger at which it must be separated from the founder.**

---

## 1. The nine bodies

```
                    ┌───────────────────────────────┐
                    │  B1  GOVERNANCE & STRATEGY    │
                    └───────────────┬───────────────┘
        ┌───────────────┬───────────┼───────────┬───────────────┐
        ▼               ▼           ▼           ▼               ▼
  ┌───────────┐  ┌───────────┐ ┌─────────┐ ┌─────────┐  ┌────────────┐
  │ B2        │  │ B3        │ │ B4      │ │ B5      │  │ B6         │
  │ PRODUCT & │  │ CUSTOMER  │ │ REVENUE │ │ PROG.   │  │ FINANCE &  │
  │ ENGINEER  │  │ SUCCESS   │ │ & GROWTH│ │ DELIVERY│  │ COMPLIANCE │
  └───────────┘  └───────────┘ └─────────┘ └─────────┘  └────────────┘
        │               │           │           │               │
        └───────────────┴───────────┼───────────┴───────────────┘
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌──────────────┐ ┌────────────┐ ┌──────────────┐
            │ B7           │ │ B8         │ │ B9           │
            │ DATA PROT. & │ │ PARTNER-   │ │ SAFEGUARDING │
            │ SECURITY     │ │ SHIPS      │ │ & QUALITY    │
            └──────────────┘ └────────────┘ └──────────────┘
```

---

### B1 — Governance & Strategy

**Owns:** direction, pricing, which market to enter, what to build, when to hire, and
**the decision to stop.**

**Why essential:** without it, a solo founder drifts — reacting to whichever school
shouted loudest this week. This body's real product is *saying no*.

**Now:** Founder.

**Cadence:**
- Weekly, 1 hr — review the 6 financial + 5 operational metrics
- **Termly, half a day — the Term Review** (the single most important meeting in the company)
- Annually — strategy reset

**The Term Review agenda (fixed, 6 items):**
1. Schools gained / lost, with reasons
2. Cash position and reserve months
3. Progress against the validation gates ([doc 11](./11-data-validation-plan.md))
4. What broke, and what will be changed
5. Founder hours per school — rising or falling?
6. **Are we still on Path B?** ([doc 05](./05-financial-model.md) §3)

**Separate when:** 3+ staff, or first external investor/sponsor of significant size.
Then form a 3-person advisory board — ideally a school proprietor, an
accountant/lawyer, and an operator who has scaled a Nigerian SME.

> **Cheap and high-value now:** recruit **one school proprietor as an unpaid advisor**.
> They will tell you in 20 minutes what six months of guessing would not.

---

### B2 — Product & Engineering

**Owns:** the codebase, releases, uptime, data integrity, technical debt, migrations,
backups.

**Why essential:** obvious. But the *non-obvious* duty is **restraint** — the biggest
engineering risk here is not bugs, it is building features nobody asked for while
[doc 02](./02-product-claims-audit.md) items stay broken.

**Now:** Founder.

**Standing priorities, in order:**
1. Data safety (baseline migration + verified backups — H5)
2. Making marketing claims true (C1, C2)
3. Deepening the offline moat (L1)
4. Reducing support load (the top 3 recurring support issues each term)
5. New features — **last**

**Separate when:** founder coding time <10 hrs/week for a full term.

---

### B3 — Customer Success & Support

**Owns:** onboarding, training, support SLAs, adoption monitoring, renewal, churn
diagnosis.

**Why essential — and why it is the most undervalued body here:** in a
**term-billed** business, every school makes a fresh purchase decision three times a
year ([doc 04](./04-business-model.md) §4). **Retention is not a background process;
it is an operating function with a calendar.** Most SaaS founders discover this too
late.

**Now:** Founder.

**Owns two numbers:**
- **Teacher activation rate** (≥70%) — the leading churn indicator
- **Termly renewal rate** (≥85%) — the lagging one

**Separate when:** support >15 hrs/week for 3 consecutive weeks. **First hire.**

---

### B4 — Revenue & Growth

**Owns:** the target list, pipeline, demos, closing, referral generation, association
relationships, pricing execution.

**Why essential:** at ₦0 marketing budget this body *is* the marketing department.
Also owns **disqualification** — the discipline of walking away from bad-fit schools
([doc 06](./06-go-to-market.md) §6), which protects capacity more than any efficiency
gain.

**Now:** Founder.

**Cadence:** weeks 3–5 of each term = concentrated selling; results week = zero
selling; week 14 = renewal asks.

**Separate when:** selling >20 hrs/week and the pipeline is still starved.

---

### B5 — Programme Delivery

**Owns:** curriculum, facilitator recruitment and training, scheduling, delivery
quality, competitions, certificates, outcome evidence.

**Why essential:** this is where the actual business lives
([doc 04](./04-business-model.md) §2) and where the moat is built
([doc 07](./07-moat-and-defensibility.md) L3). **It does not exist today.** That is the
single largest organisational gap in the company.

**Now:** nobody. `[RISK]`

**First deliverables (this term):**
1. One 6-session curriculum, written down (coding is easiest to deliver and easiest to sell)
2. Two recruited facilitators — university student societies, ~₦15k/session
3. One pilot cohort in one school
4. Attendance + output records = **the sponsor evidence pack**

**Separate when:** ≥5 schools running programmes → full-time Programme Coordinator.

> **Note the asymmetry:** B5 is simultaneously the most valuable body and the only one
> with no owner. Every term it stays unowned, the business stays on Path A.

---

### B6 — Finance & Compliance

**Owns:** collections, reconciliation, the reserve, invoicing, CAC registration, tax
filings, contracts.

**Why essential:** term billing creates lumpy cash and a ₦0 August
([doc 05](./05-financial-model.md) §4). Without deliberate reserve discipline, a
profitable business becomes insolvent in Q3.

**Now:** Founder.

**Non-negotiables:**
- Separate business bank account from school #1
- 2-month reserve before any founder draw
- Every school has a written agreement (even one page)
- CAC Ltd registration before signing any sponsor

**Separate when:** ≥20 schools → part-time bookkeeper.

---

### B7 — Data Protection & Security `[RISK]`

**Owns:** NDPA compliance, privacy policy, consent, breach response, access control,
retention, the export right.

**Why essential — read this twice:** you process **children's personal data**, the
most sensitive category in Nigerian law. A breach affecting 6,000 students would
likely end the company — not through fines but through the total collapse of trust in
a referral-driven market where every proprietor knows every other.

This body has **no owner today and is not mentioned anywhere in the product or
marketing.** That is a serious omission for a business whose entire asset is other
people's children's records.

**Now:** nobody. **Assign to Founder immediately.**

**Minimum viable compliance (~8 hrs, ₦0):**

| # | Action |
|---|---|
| 1 | Publish a real privacy policy and DPA-style clause in the school agreement |
| 2 | Add a data-processing clause: NexaForge is *processor*, school is *controller* |
| 3 | **Build the export feature** — portability is both a promise `[CODE]` and likely a right |
| 4 | Define retention: how long after a school leaves is data kept? |
| 5 | Write a 1-page breach-response plan (who is told, in what order, within what hours) |
| 6 | Audit access: confirm RLS prevents cross-school reads `[CODE]`; test it deliberately |
| 7 | Check NDPA registration/DPO thresholds `[VERIFY]` |
| 8 | Enable + **test** backups; an untested backup is a false sense of security |

**Separate when:** ≥50 schools or first government contract → designated DPO.

---

### B8 — Partnerships & External Relations

**Owns:** NAPPS chapters, sponsors/CSR, universities, device partners, government,
press.

**Why essential:** three of the six moat layers (L4 credentials, L5 sponsorship, L6
channel lock) are **entirely relationship-built.** They cannot be coded and cannot be
bought — which is precisely why they are defensible.

**Now:** Founder, informally.

**Priority order:**
1. **NAPPS LGA chapter** — highest leverage, lowest cost
2. University student societies — facilitator supply
3. Corporate CSR — after pilot evidence exists
4. Local press/radio — around the first competition
5. Government — later; no working capital for public-sector payment cycles

**Separate when:** ≥30 schools or ≥₦5M sponsor revenue.

---

### B9 — Safeguarding & Quality Assurance `[RISK]`

**Owns:** child-protection policy, facilitator vetting, incident reporting, programme
quality, report-card accuracy.

**Why essential — this is the body most likely to be skipped and most catastrophic if
skipped:** the moment you place an adult facilitator in a room with children, you
carry **child-protection responsibility**. One incident ends the company, permanently,
and no amount of product quality or revenue offsets it. There is no recovery path.

It also owns a quieter risk: **report-card correctness.** A school that hands parents
report cards with wrong grades will not merely churn — it will actively destroy your
reputation in the cluster, because it was publicly embarrassed.

**Now:** nobody. **Must be assigned before the first programme session.**

**Minimum viable safeguarding (before any facilitator meets a student):**

| # | Rule |
|---|---|
| 1 | Written child-protection policy, signed by every facilitator |
| 2 | **A school staff member present at every session, always** — the single most effective control, and it is free |
| 3 | No 1-to-1 unsupervised contact, ever |
| 4 | No facilitator-to-student private messaging; all comms via the school |
| 5 | Reference checks + ID on file for every facilitator |
| 6 | Written incident-reporting route: facilitator → coordinator → founder → school, same day |
| 7 | Parents receive a written consent form naming what happens in sessions |

**Quality assurance for report cards:**
- Verify grade computation against the school's own manual calculation for one class, every term, at every new school
- Never let a school print for the first time unsupervised

**Separate when:** ≥5 facilitators → dedicated safeguarding lead.

---

## 2. Ownership map by stage

| Body | Now (solo) | 10 schools | 30 schools | 60+ schools |
|---|---|---|---|---|
| B1 Governance | Founder | Founder + advisor | Founder + advisory board | Board |
| B2 Product | Founder | Founder | Founder + engineer | Eng lead + 2 |
| B3 Customer Success | Founder | **+ PT assistant** | CS lead | CS team of 3 |
| B4 Revenue | Founder | Founder | + sales rep | Sales lead + 2 |
| B5 Programmes | **UNOWNED** 🔴 | Founder + facilitators | **Coordinator** | Programme mgr + team |
| B6 Finance | Founder | Founder | + PT bookkeeper | Finance officer |
| B7 Data Protection | **UNOWNED** 🔴 | Founder | Founder | DPO |
| B8 Partnerships | Founder | Founder | Founder | Partnerships lead |
| B9 Safeguarding | **UNOWNED** 🔴 | **Founder — mandatory** | Coordinator | Safeguarding lead |

**Three bodies are unowned today, and all three are the ones that carry
company-ending risk (B7, B9) or all of the upside (B5).** That is the actionable
conclusion of this document: assign B5, B7 and B9 to yourself in writing this week,
with the minimum-viable checklists above. Total cost: **~16 hours, ₦0.**

---

## 3. Legal structure `[DECISION]` D6

| Item | Recommendation | When | Cost |
|---|---|---|---|
| Entity | **Private Limited Company (Ltd)** via CAC | Before first sponsor or govt contract | ~₦100k |
| Why not Business Name | No limited liability — unacceptable given child-data and safeguarding exposure | — | — |
| Shareholding | 100% founder now; leave room for future co-founder/ESOP | At incorporation | ₦0 |
| Bank account | Corporate account, separate from personal | With CAC | ₦0 |
| School agreements | One-page: scope, price, term, data clauses, export right, termination | **Before school #1** | ₦0 |
| Facilitator agreements | Contractor terms + safeguarding policy + confidentiality | Before programme #1 | ₦0 |
| IP | Ensure all code is owned by the company, not personally | At incorporation | ₦0 |

> **Sequencing note:** you can legitimately operate pre-CAC with a few schools on
> written agreements. But do **not** sign a corporate sponsor, take government money,
> or place facilitators with children without a limited-liability entity behind you.

---

## 4. The two-page operating charter

Write this once and keep it visible. It is the whole company in two pages:

**Page 1 — What we do**
1. We sell school software cheaply to earn the right to sell programmes.
2. We win one locality completely before entering another.
3. We never promise what we have not built.
4. We protect children's data as if the company depends on it — because it does.
5. Retention beats acquisition. Results week beats everything.

**Page 2 — Never break these**
1. ≤3 new schools per month.
2. No selling during results week.
3. Two-month cash reserve before any founder draw.
4. No facilitator with students unsupervised, ever.
5. Backups tested monthly.
6. Every school can export its data on demand.
7. Any support question asked three times becomes a fix or a video.
