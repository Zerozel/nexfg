# 06 — Go-To-Market

> **Governing constraint:** ₦0 marketing budget. Every channel below is
> founder-time-funded. The scarce resource is **2,250 founder hours/year**
> ([doc 04](./04-business-model.md) §6), so this document is primarily an
> **hour-allocation plan**, not a marketing plan.

---

## 1. The strategy in one line

> **Own one LGA completely before touching a second.**

### Why geographic density beats geographic reach

| Dispersed (20 schools, 5 cities) | Dense (20 schools, 1 LGA) |
|---|---|
| Travel dominates founder time | 4 school visits per day possible |
| No referral compounding — schools don't know each other | Proprietors meet monthly; referrals compound |
| Cannot run a competition (logistics impossible) | **Inter-school competition is walkable** |
| Support is remote-only | On-site rescue during results week |
| Word-of-mouth dissipates | Word-of-mouth concentrates: "everyone on this road uses it" |
| No local reputation | **You become the local standard** |

**The decisive argument: a competition needs density.** Layer 3 of the moat
([doc 07](./07-moat-and-defensibility.md)) — the inter-school league that gives
parents a reason to care — is *physically impossible* with dispersed schools and
*trivially achievable* with 15 schools in one LGA. Geographic concentration is
therefore not a sales convenience; **it is a prerequisite for the moat.**

`[DECISION]` **D4: pick one LGA. Do not leave it until ≥15 paying schools.**

---

## 2. Channel plan, ranked by cost-per-school

| Rank | Channel | Cash cost | Founder hrs/school | Verdict |
|---:|---|---:|---:|---|
| 1 | **Referral from happy schools** | ₦0 | 3–5 | 🥇 Best. Pre-trusted. Build the machine deliberately. |
| 2 | **NAPPS chapter meeting presentation** | ₦0–20k | 1–2 | 🥇 One meeting = 40 proprietors in one room |
| 3 | **Direct walk-in / cold visit** | ₦2k transport | 8–14 | ✅ Only reliable cold channel. Slow but works. |
| 4 | **Proprietor WhatsApp groups** | ₦0 | 2–4 | ✅ High leverage; requires an insider to admit you |
| 5 | **Programme demo day** (free session at a school) | ₦5–10k | 4–6 | ✅ Sells the differentiator directly to parents |
| 6 | Church/mosque school networks | ₦0 | 3–6 | ✅ Many schools share one owner — multi-school deals |
| 7 | Facebook/Instagram organic | ₦0 | High/low yield | ⚠️ Weak for B2B school sales in Nigeria |
| 8 | Paid ads | ₦50k+ | — | ❌ **No.** Cannot afford; poor targeting for this buyer |
| 9 | Conferences/expos | ₦100k+ | — | ❌ **No.** Not at this stage |
| 10 | SEO/content | ₦0 | Very high, slow | ⚠️ Compounds over years; do 1 hr/week, not more |

**Concentrate ~80% of selling hours on channels 1–4.**

---

## 3. The founder-hour budget

2,250 hrs/year ÷ 45 weeks = **50 hrs/week.** Allocate explicitly, or sales will
silently consume everything.

| Activity | Hrs/week | Rationale |
|---|---:|---|
| **Selling** (visits, demos, follow-up) | 15 | The growth engine |
| **Onboarding** new schools | 8 | Highest-value hours you spend — sets retention |
| **Support** (WhatsApp, results-week rescue) | 8 | Spikes to 20+ in results week |
| **Product/engineering** | 10 | Claims-audit fixes first ([doc 02](./02-product-claims-audit.md)) |
| **Programmes** (curriculum, facilitators, delivery) | 5 | Rising to 15 once validated |
| **Admin/finance/compliance** | 4 | Unavoidable |
| **Total** | **50** | |

**Two rules that protect the plan:**

1. **Cap onboarding at 3 new schools per month.** Beyond that, onboarding quality
   collapses, the school fails to adopt, and it churns at term end — you will have
   spent 10 hours to acquire a churn statistic. Sales velocity is worthless without
   onboarding capacity.
2. **Block results week entirely.** No selling in the last 2 weeks of term. That
   window is for support and renewals, which are worth more than new logos.

---

## 4. The sales motion, step by step

### Stage 1 — Target list (once, ~2 days)
Build the LGA census from [doc 03](./03-market-analysis.md) §6. Output: 20–60 schools
ranked by (students × fee band × reachability).

### Stage 2 — First contact
**Do not cold-call. Walk in.** Nigerian school proprietors respond to physical
presence; phone calls to schools reach a gatekeeper who cannot decide.

- **Best time:** 10am–12pm, Tue–Thu (avoid Monday chaos, Friday closing)
- **Ask for:** the Head Teacher or Proprietor by name if known
- **Bring:** phone with live demo, one A4 sheet, **a sample printed report card**
- **Do not bring:** a laptop bag full of brochures. You are a peer, not a vendor.

**The 30-second opener:**
> *"Good morning ma. I build software for schools in this area — I'm not here to sell
> you anything today. Can I show you one thing on my phone that takes two minutes?
> It's about how your teachers submit scores at the end of term."*

Then **show, do not tell**:
1. Open the score matrix on your phone
2. **Turn on airplane mode.** Enter three scores. They save. `[CODE]`
3. Turn it off. Watch them sync.
4. Print preview a report card with their school's name already on it

> **That airplane-mode moment is the single most persuasive 15 seconds in your entire
> sales process.** It is concrete, it is visual, it addresses the objection they were
> already forming ("our network is bad"), and **no competitor can perform it.** Build
> the whole pitch around it.

### Stage 3 — Trial with a real class
Do not leave them a login. **Set up one class with them, in the room.** A trial where
nothing is configured is a trial that fails. Configure: 1 class, real students, real
subjects, one assessment. Then have an actual teacher enter real scores.

### Stage 4 — Close at the pain point
The natural close is **during or right after results week**. Ask:
> *"Last term, how long did compiling results take you? … If it took an afternoon
> instead, what would that be worth?"*

Then present ₦15,000/₦30,000 against the number they just said out loud.

### Stage 5 — Onboard properly (6–10 hrs)
- **You do the student data entry.** Do not ask a school to type 400 students; that
  request kills more deployments than any bug.
- Train the admin (1 hr) and 2–3 teachers (30 min each)
- Publish their public website — **this is the emotional win that creates advocates**
- Print one real report card and hand it to the principal

### Stage 6 — Convert to referral
At the end of a successful term, ask precisely:
> *"Which two proprietors do you know who complain about results week? Would you send
> them a message introducing me?"*

**A specific ask with a number gets acted on; "any referrals?" does not.**

---

## 5. Objection handling

| Objection | Response |
|---|---|
| *"We already use Excel."* | *"Keep it. Use us for one class this term. If results week isn't easier, don't pay."* Never attack their existing system — it is their own work. |
| *"Our network here is bad."* | Airplane-mode demo. **This objection is your best asset.** |
| *"Too expensive."* | *"₦15,000 is one term's fee for one student. How many parents are you losing to the school with the nice website?"* |
| *"Teachers won't use it."* | *"Let me train them myself, free. If they don't use it by mid-term, don't renew."* |
| *"What if you disappear?"* | Export button, live, on the spot ([doc 02](./02-product-claims-audit.md) C2 — **build it**) |
| *"Send me a proposal."* | Usually a polite no. *"I'll send it today — can I also come back Thursday to set up one class so you can see it working?"* |
| *"I need to discuss with my husband/partner/board."* | *"Of course. Can I come back when you're both available? It's a 10-minute demo."* Real, common, and closable. |
| *"Can you add [X feature]?"* | Never promise. *"Not today. Here's what it does now."* Overpromising is how you become [doc 02](./02-product-claims-audit.md). |

---

## 6. CAC ceilings

Since cash CAC ≈ ₦0, the meaningful ceiling is **founder hours**.

| Channel | Max acceptable hrs/school | Reasoning |
|---|---:|---|
| Referral | 5 | Pre-trusted; should close fast |
| NAPPS/association | 4 | Warm, credentialed context |
| Cold walk-in | 14 | Beyond this, disqualify and move on |
| **Any school, any channel** | **20 (hard stop)** | Past 20 hrs, expected software revenue (₦81k/yr) no longer justifies the time |

**Disqualify fast and without guilt.** Signals to walk away:
- Fees <₦30,000/term (cannot afford; will consume support)
- <80 students (economics never work)
- Proprietor unreachable after 3 visits
- Asks for a bespoke feature as a precondition
- Wants it free "to test for a year"

> One badly-fit school can absorb 40 support hours — the equivalent of acquiring three
> good ones. **Saying no is a growth strategy for a solo founder.**

---

## 7. The NAPPS play — highest-leverage move available

The **National Association of Proprietors of Private Schools** has LGA/state chapters
that meet regularly `[VERIFY]`. One meeting = 30–60 decision-makers in a room,
pre-assembled, who trust each other.

**Sequence:**
1. Identify the LGA chapter chairman `[VERIFY]`
2. **Offer NexaForge free to the chairman's own school**, in exchange for a 15-minute presentation slot. This is the trade: your product for their platform.
3. Present with the airplane-mode demo, not slides
4. Offer a chapter-specific incentive: *"Any school here that starts this term gets the founding-member rate locked for a year."*
5. Sponsor something small and visible — refreshments, a printed programme (₦20k)

**Then convert the association relationship into structural advantage:** offer the
chapter a **free inter-school competition** for its members. You get density and
data; they get an event that makes the chapter look valuable to its members. That is
[doc 07](./07-moat-and-defensibility.md) **L6 — channel lock** — and once a chapter
associates its annual competition with you, a competitor must displace a *relationship*
and an *institution*, not merely a product.

---

## 8. Programme-led acquisition (from Term 2)

Once one programme cohort has run, invert the funnel: **sell to parents to acquire the
school.**

1. Offer a **free 90-minute coding taster** to any school — no software commitment
2. Deliver it to 40 students; let parents see the output
3. Parents ask the school for more
4. School asks you; you attach the software as infrastructure

**Why this is strategically superior:** the school is no longer evaluating a software
purchase (a cost, resisted), it is responding to parent demand (a revenue
opportunity, welcomed). Same product, inverted power dynamic, and it is unavailable to
any competitor without a programme layer.

---

## 9. What NOT to do

| Don't | Why |
|---|---|
| Launch in multiple cities | Destroys density, kills competitions, wastes travel hours |
| Spend on ads | No budget; poor channel for this buyer |
| Build a partner/reseller programme now | Unmanageable solo; damages quality control |
| Chase government contracts | 6–18 month payment cycles; you have no working capital |
| Discount below published pricing | Trains the market and destroys thin software margin |
| Onboard >3 schools/month | Onboarding quality is retention; this is the #1 self-inflicted wound |
| Take a school with <80 students | Support cost exceeds lifetime revenue |
| Promise unbuilt features to close | Creates the [doc 02](./02-product-claims-audit.md) problem again |

---

## 10. 12-month GTM targets

| Term | Cumulative schools | Focus | Key milestone |
|---|---:|---|---|
| **T1 (Sept–Dec)** | 5 | Claims fixes, cluster census, first 5 schools | 5 schools survive results week |
| **T2 (Jan–Apr)** | 10 | Renewals + **first programme pilot** | ≥20% programme take-up in 1 school |
| **T3 (Apr–Jul)** | 15 | First inter-school competition + NAPPS presentation | Competition with ≥5 schools |
| **Aug** | 15 | Paid holiday programme | Revenue in the dead month |

**Year 1 success = 15 schools in one LGA, ≥80% termly renewal, one competition run,
one programme cohort proven.** Not 100 schools. Density, evidence, and a moat that has
started compounding.
