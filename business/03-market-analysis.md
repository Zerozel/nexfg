# 03 — Market Analysis

> **Research caveat, read first.** This was produced without live web access. Every
> market figure below is a **reasoned estimate**, tagged `[ASSUMPTION]` or `[VERIFY]`,
> paired with the exact source you should check. Do not put these numbers in a pitch
> deck or a grant application until validated — the validation instructions are in
> [doc 11](./11-data-validation-plan.md).
>
> For a bootstrapped founder, TAM is largely decorative anyway. **The only market
> number that governs your next 12 months is: how many schools are within 20km of
> you, and how many can pay ₦15,000.** That number is countable by hand, and §6
> tells you how.

---

## 1. Market sizing

### Top-down `[ASSUMPTION]`

| Layer | Figure | Reasoning | Validate against |
|---|---:|---|---|
| Nigerian private basic/secondary schools | ~55,000–70,000 | Widely cited range; heavily skewed to small, informal, unregistered schools | UBEC/NPC school census; NAPPS membership figures |
| Registered/formal enough to buy software | ~25,000 | Excludes one-room and unregistered operations | State ministry of education approved-school lists |
| **TAM** (all formal private schools) | 25,000 × ₦81,000 = **₦2.03bn/yr (~$1.3M)** | At current software pricing only | — |
| **SAM** (can pay + has smartphone-capable staff + ≥100 students) | ~8,000 schools = **₦648M/yr** | Requires fees ≥₦40k/term to make ₦15k trivial | Fee surveys in target LGAs |
| **SOM, realistic 3-yr solo-bootstrapped** | 60–150 schools = **₦4.9M–12.2M/yr software** | Founder-hour constrained, not demand constrained | Your own funnel |

**The uncomfortable conclusion, stated plainly:** even *100% of the entire formal
Nigerian private school market* at current pricing is a **₦2bn (~$1.3M) annual
software market.** That is not a venture-scale market. It is a good small business.

This is not an argument against the business. It is an argument that **the software
subscription cannot be the product** — which is exactly what [doc 04](./04-business-model.md)
restructures. When programmes are included at ₦2,000/student/term, the same 8,000-school
SAM becomes an **~₦8–10bn/yr addressable market** `[ASSUMPTION]`, because you are then
selling into the *parent's* wallet (which is ~50× larger than the school's software
budget) rather than the school's.

> **Strategic reframing:** the school is not your market. The school is your
> **distribution channel** to 200–800 fee-paying parents. Schools are how you
> acquire parents at near-zero CAC. That is the single most important sentence in
> this document.

### Bottom-up — the only sizing that should drive decisions

| Level | Count | Basis |
|---|---:|---|
| Schools in one urban LGA | 80–250 | `[VERIFY]` — count yours |
| Meeting SAM criteria (≥100 students, ≥₦40k fees) | ~25–40% → **25–90** | `[ASSUMPTION]` |
| Realistically reachable solo in 12 months | **40–60 conversations** | Founder-hour math, [doc 06](./06-go-to-market.md) |
| Converting at 15–25% | **8–14 schools** | `[ASSUMPTION]` |

**Your real Year-1 target is 10–15 schools in one LGA.** Everything else is theory.

---

## 2. Segmentation — where to fight

| Segment | Students | Fees/term | Count `[ASSUMPTION]` | Can pay ₦15k? | Verdict |
|---|---:|---:|---:|---|---|
| **A. Elite international** | 200–800 | ₦500k–3M | ~500 | Trivially | ❌ **Avoid.** Already on Engage/international SIS; demand integrations, SLAs, dedicated support. You cannot serve them solo. |
| **B. Established mid-tier** | 300–900 | ₦100k–400k | ~4,000 | Easily | ✅ **PRIMARY.** Has a bursar and IT-comfortable admin, feels commoditisation pain, can afford programmes. |
| **C. Growing neighbourhood** | 100–350 | ₦40k–120k | ~12,000 | With effort | ✅ **SECONDARY.** Highest volume, most price-sensitive, most grateful. Best referral behaviour. |
| **D. Low-cost / informal** | 30–150 | ₦5k–35k | ~40,000 | No | ❌ **Avoid until government-funded.** ₦15k/term is real money; support burden is highest, ability to pay lowest. Only viable via state/donor contracts. |
| **E. Public schools** | 200–2,000 | Free | ~60,000 | Only via govt | ⏸ **Later.** Requires procurement capability, political relationships, and cash to survive 6–18 month payment cycles. Not bootstrappable. |

### Beachhead `[DECISION]`

**Segment B, in one LGA, prioritising schools with 250–600 students.**

Why this precise slice:
- Large enough that manual results processing is genuinely painful (the real buying trigger)
- Small enough to have no incumbent software and no IT department
- Fees high enough that ₦30,000/term is a rounding error against ~₦45M/term collections
- **Enough parents (250–600) to make a programme cohort economically viable** — this is the criterion nobody else would think to apply, and it is the one that matters most, because these schools are your route to programme revenue
- Proprietors in this tier are NAPPS-active and talk to each other → referral compounding

---

## 3. Competitor teardown

> All competitor specifics are `[VERIFY]` — confirm pricing and features directly
> before using them in a sales conversation. Never state a competitor's price to a
> prospect unless you have seen it in writing; being caught wrong destroys the
> comparison.

### Direct: Nigerian school-management platforms

| Competitor | Position `[VERIFY]` | Strengths | Exploitable weaknesses |
|---|---|---|---|
| **Edves** | Best-known Nigerian SIS; broad module suite; some state deals | Brand, references, CBT, fee module, parent app | Assumes connectivity; per-student pricing scales painfully; enterprise sales motion neglects small schools; no programme layer |
| **Classnote / Schoolable / SAFSMS / Flexisaf** | Established mid-market | Feature depth, fee management, years of hardening | Same: online-only assumptions, monthly billing mismatch, no differentiation layer for the school |
| **Regional/informal builders** | Freelancers selling ₦50k–200k one-off school portals | Cheap, local, personal relationship | No maintenance, no multi-tenancy, no updates, disappears; **your true incumbent in Segment C** |
| **Excel + WhatsApp + paper** | 🥇 **The actual market leader** | ₦0, universally understood, no vendor risk, no training | Catastrophic at scale, error-prone, no continuity when a teacher leaves |

**Recognise the real opponent.** You are not displacing Edves. You are displacing
**a Head Teacher's laptop containing 14 Excel files and a WhatsApp group.** That
opponent's price is ₦0 and its switching cost is emotional, not technical. Which
means your pitch is not "better than Edves" — it is *"remember last results week?"*

### Adjacent and more dangerous

| Threat | Why worse than direct competitors |
|---|---|
| **Payments companies** (Moniepoint, OPay, Flutterwave, Paystack, banks) | Can give SIS away free forever, funded by fee-collection take rate. **See §4.** |
| **Telcos** (MTN, Airtel) | Own distribution + zero-rated data + billing relationship with every parent |
| **WAEC/NECO or state ministries** | If a government mandates a platform, private alternatives become redundant overnight `[RISK]` |
| **International SIS going downmarket** | Google Classroom / Microsoft Education are free and already in schools; weak on Nigerian grading/report cards, but that gap could close |

---

## 4. The existential competitive threat: fee-collection economics

This deserves its own section because it invalidates any pure-SaaS strategy.

**The arithmetic** `[ASSUMPTION]`:

```
Target school:        400 students
Fees:                 ₦110,000 / student / term
Termly collection:    ₦44,000,000
Payment take rate:    0.5%
Revenue per term:     ₦220,000

NexaForge Growth plan: ₦30,000 / term

→ The payment rail earns 7.3× your entire software fee.
```

**Therefore:** any payments company can offer a complete school-management system
**free, permanently**, and be more profitable per school than you are. This is not
predatory pricing they must sustain at a loss — it is their **natural, rational,
indefinitely-sustainable business model.** Free SIS is simply a customer-acquisition
cost for the payment flow, and a cheap one.

They also have advantages you cannot answer with product quality:

- **Agent networks** — Moniepoint has hundreds of thousands of agents `[VERIFY]`; you have one person on a motorcycle
- **The right buyer** — they call the bursar (who controls money); you call the principal (who controls process)
- **Existing trust** — the school already banks with them
- **Zero marginal CAC** — the school is already a customer

### Strategic response — four moves, in order

1. **Never compete on the money rail. Ride it.**
   Integrate Paystack for *school fees* (not just your subscription) and take a
   modest share, or none at all. Losing the payments war is fine. Being
   *disintermediated* is not.

2. **Own the academic + status layer they structurally will not enter.**
   A fintech will build a gradebook. A fintech will not run a national inter-school
   science competition, maintain a curriculum, employ facilitators, or accept child
   safeguarding liability. Those are unattractive, operationally heavy, low-margin
   activities — which is exactly why they are defensible. **Your moat is made of
   the work they don't want to do.** ([doc 07](./07-moat-and-defensibility.md))

3. **Become the integration partner, not the target.**
   If a payments company's schools want NexaForge programmes and league
   participation, you become a feature they'd rather partner for than rebuild. Be
   acquirable-or-partnerable by design — that is also your best exit path.

4. **Move faster than an incumbent's roadmap in one narrow place.**
   Offline-first score entry `[CODE]` is unglamorous, hard to retrofit, and
   invisible in a feature comparison — but it decides whether teachers actually use
   the system in a school with bad connectivity. Own it completely.

---

## 5. Market timing — why now

**Tailwinds:**
- Smartphone penetration among teachers now sufficient for phone-based score entry `[ASSUMPTION]`
- Paystack/Flutterwave made small-ticket recurring collection trivial `[CODE]`
- Serverless (Supabase/Vercel) means a solo founder can run multi-tenant infra for <₦40k/month ([doc 05](./05-financial-model.md))
- Post-COVID normalisation of digital school administration
- Rising parental scepticism that certificates guarantee employment — **this is the wind behind the programmes thesis specifically**, and it is the reason the marketing narrative resonates

**Headwinds:**
- Severe FX/inflation pressure — schools are cutting discretionary spend `[RISK]`
- Connectivity and power remain unreliable (mitigated by offline design — a headwind you've converted into an advantage)
- Deep vendor scepticism from prior EdTech disappointments
- Every naira you charge competes with a generator, a bus, or teacher salaries

**Net:** timing is favourable *for the offline-first, term-billed, low-price wedge*
and unfavourable for anything requiring large upfront school spend. The current
product happens to be shaped correctly for the moment.

---

## 6. What to actually do this week — the only market research that matters

Two days of work, ₦0 cost, replaces every `[ASSUMPTION]` above with fact.

**Build a physical census of your own LGA:**

| Step | Action | Output |
|---|---|---|
| 1 | List every private school within 20km. Sources: state ministry approved-school list, NAPPS chapter secretary, Google Maps "private school" pins, physical drive-around noting signboards | Raw list of 80–250 |
| 2 | For each, record: name, est. student count, fee band (ask a parent or check the signboard/gate), proprietor name if obtainable, current software (usually none) | Qualified sheet |
| 3 | Filter to: ≥150 students **and** ≥₦40k/term fees | **Your actual target list — typically 20–60 schools** |
| 4 | Rank by: (student count) × (fee band) × (proprietor reachability) | Call order |
| 5 | Identify the NAPPS chapter chair and the 2–3 most-respected proprietors | **Your channel** ([doc 06](./06-go-to-market.md)) |

That sheet is worth more than every TAM figure in §1. It is also the seed of
[doc 11](./11-data-validation-plan.md)'s measurement programme, and it is the one
asset a competitor in Lagos cannot copy remotely.

---

## 7. Segment-level pricing power

| Segment | Software willingness `[ASSUMPTION]` | Programme willingness (per student/term) | Implication |
|---|---:|---:|---|
| A. Elite | ₦200k+/term | ₦10,000+ | Rich, but unserviceable solo |
| **B. Mid-tier** | **₦30k–80k/term** | **₦2,000–5,000** | **Priced correctly today; programme upside is large** |
| **C. Neighbourhood** | **₦10k–25k/term** | **₦1,000–2,000** | Starter tier fits; keep support cost near zero |
| D. Low-cost | ₦0–8k/term | ₦0–500 | Needs subsidy |
| E. Public | Govt-funded | Donor/CSR-funded | Later |

**Read this carefully: the ₦30,000 Growth plan is *underpriced* for Segment B.**
A 500-student school paying ₦120k/term/student collects ~₦60M per term. ₦30,000 is
0.05% of that. There is room to charge ₦50,000–60,000 — and the reason to hold price
low anyway is strategic (fast adoption → data → league density), not
market-driven. Know the difference: you are *choosing* to leave money on the table
to buy network density. That is a legitimate strategy. Doing it accidentally is not.
