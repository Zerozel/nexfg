# 10 — Roles & Hiring Plan

> **The constraint that shapes everything here: there is no salary budget.** So this
> document is not a conventional org chart. It is a plan for acquiring capability
> through **variable pay, equity, in-kind exchange and structured volunteering** —
> then converting to salary only when revenue justifies it.
>
> Every role states: what it does, when to hire, how to pay for it **without capital**,
> and how to know the hire worked.

---

## 1. Role sequence

```
NOW                 10 SCHOOLS         30 SCHOOLS          60+ SCHOOLS
──────────────      ─────────────      ─────────────       ──────────────
R1 Founder/CEO      R1 Founder         R1 Founder/CEO      R1 CEO
(all 9 bodies)      R2 Facilitators×2  R2 Facilitators×6   R2 Facilitators×15
                    R3 Support Asst    R3 CS Lead          R3 CS team ×3
                    R8 Advisor (free)  R4 Prog. Coordntr   R4 Prog. Manager
                                       R5 Engineer (PT)    R5 Eng ×2
                                       R6 Sales Rep        R6 Sales ×2
                                       R7 Bookkeeper (PT)  R7 Finance Officer
                                                           R9 Safeguarding Lead
```

---

## 2. The roles

### R1 — Founder / CEO — *now*

**Owns:** all nine bodies until delegated ([doc 09](./09-operational-bodies.md)).

**Realistic weekly split** — the honest version of this job:

| Activity | Hrs |
|---|---:|
| Selling + relationships | 15 |
| Onboarding + support | 16 |
| Engineering | 10 |
| Programmes | 5 |
| Admin + finance | 4 |
| **Total** | **50** |

**What only you can do, and must not delegate in Year 1:**
- The relationship with each proprietor (this *is* the moat's ninth layer)
- Pricing and strategic decisions
- Deciding what not to build
- Safeguarding accountability

**Compensation:** ₦0 until the reserve test passes ([doc 05](./05-financial-model.md) §6).
**Write down your personal runway.** It is the real deadline.

**Biggest personal failure modes, ranked:**
1. Building features instead of talking to schools
2. Onboarding faster than support capacity → churn
3. Never launching programmes → Path A → 3 years unpaid
4. Personal cash exhaustion at month 9 → job → company dies

---

### R2 — Programme Facilitators — *first non-founder role* 🔴

**Why first:** programmes are the business ([doc 04](./04-business-model.md) §2),
and this is the **only role that pays for itself on day one** — it is funded entirely
by fees already collected from parents.

**Profile:** final-year student or recent graduate in CS/engineering/business.
Confident with teenagers, reliable, presentable. **Not necessarily an expert** — the
curriculum carries the content.

**Where to find them (₦0 cost):**
- University CS/robotics/entrepreneurship societies — approach the society president
- NYSC corps members posted locally (huge, underused, motivated pool)
- Recent alumni of the schools you serve — **they already know the environment and are credible to students**

**Pay:** **₦12,000–18,000 per 90-minute session.** Purely variable — only paid against
collected programme fees. This is the key structural point: **facilitators can never
create a cash-flow problem.**

**Non-cash sweeteners that materially raise quality:**
- A written reference / certificate ("NexaForge Facilitator")
- Public credit on the school website `[CODE]`
- Path to Programme Coordinator
- Free training in facilitation — genuinely valuable to a student CV

**Hire when:** the first pilot cohort has ≥15 paid enrolments.

**Success test:** ≥80% session attendance, ≥1 parent-visible output per student, zero
safeguarding incidents.

**Mandatory before first session:** signed child-protection policy, ID + references on
file, school staff member present at every session ([doc 09](./09-operational-bodies.md) B9).

---

### R3 — Support & Onboarding Assistant — *at ~10 schools*

**Why:** support is the first function to consume the founder. Each hour bought back
here is an hour returned to selling or programmes.

**Owns:** WhatsApp first-response, student data entry during onboarding, training
walk-throughs, results-week chasing, support log upkeep.

**Profile:** organised, patient, excellent written English, comfortable on WhatsApp all
day. **Teaching or school-admin background is ideal** — they already speak the customer's
language and understand results week viscerally.

**Pay:** ₦60,000–100,000/month part-time.

**Zero-capital alternatives — genuinely viable:**
- **A teacher from one of your own schools, part-time.** They know the product, know the pain, and welcome supplementary income. Cheapest and best-informed option available.
- Trade: free subscription to a school in exchange for their admin officer's 10 hrs/week
- NYSC corps member on placement

**Hire when:** support >15 hrs/week for 3 consecutive weeks.

**Success test:** founder support hours drop ≥50%; first-response SLA still met.

---

### R4 — Programme Coordinator — *at ~5 programme schools*

**Owns:** scheduling, facilitator management, quality, competitions, certificates,
outcome evidence, parent showcases. Effectively runs body B5.

**Profile:** ex-teacher or education-programme manager. Organised, credible with
principals, comfortable with logistics.

**Pay:** ₦200,000–300,000/month, or **₦120,000 base + ₦40,000 per school running a
programme** — commission aligns them with the metric that matters.

**Hire when:** ≥5 schools running programmes (≈₦1.5M/term programme revenue —
comfortably affordable).

**Success test:** programme take-up rises term-on-term; facilitator retention >70%;
one competition delivered per term.

---

### R5 — Engineer (part-time / contract) — *at ~30 schools*

**Owns:** feature delivery, bug fixes, sync reliability, backups, monitoring.

**Profile:** mid-level Next.js/TypeScript/Postgres. **Must be comfortable with Supabase
RLS** — multi-tenant isolation is a security-critical area and a wrong RLS policy is a
data-breach vector.

**Pay:** ₦250,000–400,000/month part-time, or per-project contracts.

**Zero-capital alternatives:**
- **Equity-for-work with a technical co-founder** (5–15%, vesting, written agreement) — the only truly free option, and only worth it for someone who will stay
- Paid interns from a local CS department (₦50k/month, real learning value)
- Fixed-scope freelance contracts against specific revenue

`[RISK]` **Do not hire an engineer before the baseline migration exists**
([doc 02](./02-product-claims-audit.md) H5). Onboarding a developer to a database that
cannot be rebuilt from source is how production data gets destroyed.

**Hire when:** founder coding <10 hrs/week for a full term.

---

### R6 — Sales / Onboarding Rep — *at ~30 schools*

**Owns:** prospecting, demos, closing, onboarding within an assigned LGA.

**Profile:** field-sales experience in a school-facing business (textbooks, uniforms,
school supplies) — **they arrive with the relationships you would spend a year
building.** This is the single highest-leverage hiring insight in this document.

**Pay:** **₦100,000 base + ₦15,000 per school closed + ₦5,000 per termly renewal.**
Renewal commission is essential — it prevents closing bad-fit schools that churn.

**Zero-capital alternative — commission-only agents:** ₦25,000 per closed school, no
base. Works well with book/uniform sellers who already visit schools weekly. **Cap
their territory** to protect cluster density.

**Hire when:** selling >20 hrs/week and pipeline still starved.

**Success test:** ≥3 schools/month closed; renewal rate on their schools ≥80%.

---

### R7 — Bookkeeper (part-time) — *at ~20 schools*

**Owns:** reconciliation, invoicing, records, tax filings, reserve tracking.

**Pay:** ₦40,000–80,000/month part-time, or an external firm on retainer.

**Zero-capital alternative:** monthly-only engagement (~₦25k) — sufficient at low
volume.

---

### R8 — Advisory Board (unpaid) — *now* 🔴

**The single highest-ROI "hire" available, and it costs nothing.**

| Advisor | What they give | Compensation |
|---|---|---|
| **School proprietor** (respected, in your LGA) | Buyer truth, credibility, referrals, sanity-checks on pricing | Free subscription + title |
| **Accountant or lawyer** | CAC, contracts, tax, NDPA | Small equity (0.25–0.5%) or reciprocal work |
| **Nigerian SME operator who has scaled** | Hiring, cash discipline, avoiding known traps | Advisory equity (0.5%) |

**Cadence:** one 45-minute call per term each. **Total cost: ₦0.**

> Recruit the proprietor advisor **this month**. A single honest conversation about why
> they would or wouldn't pay is worth more than every assumption in
> [doc 03](./03-market-analysis.md).

---

### R9 — Safeguarding Lead — *at ≥5 facilitators*

**Owns:** child-protection policy, vetting, incident handling, training.

**Before this hire:** the Founder owns it, non-delegably
([doc 09](./09-operational-bodies.md) B9). **This function must never be unowned once a
facilitator is in a classroom.**

**Zero-capital alternative:** a school's own designated safeguarding teacher, on
retainer for policy review and incident escalation — they are already trained and
already accountable.

---

## 3. Hiring principles

| # | Principle | Why it matters here |
|---|---|---|
| 1 | **Hire variable before fixed** | Facilitators paid per session cannot cause insolvency; a salary can |
| 2 | **Hire from your customers** | Teachers and school admins already understand the product and the pain |
| 3 | **Hire against a trigger, never a plan** | [doc 08](./08-operational-plan.md) §7 — calendar-based hiring kills bootstrapped companies |
| 4 | **Commission on renewal, not just on sale** | Aligns incentives with retention, which is where the money is |
| 5 | **One month paid trial before any permanent offer** | Cheap error correction |
| 6 | **Write every arrangement down** | Even a WhatsApp-agreed contractor. Especially equity. |
| 7 | **Never give equity for effort — only for sustained contribution, vesting** | Unvested equity to someone who leaves in 3 months is permanent damage |
| 8 | **Hire slow around children** | One safeguarding failure is terminal ([doc 09](./09-operational-bodies.md) B9) |

---

## 4. Cost of the team by stage

| Stage | Roles | Monthly fixed | Monthly variable | Revenue required |
|---|---|---:|---:|---:|
| **Now** | R1 (unpaid), R8 (free) | ₦17,000 | ₦0 | ₦17,000 |
| **10 schools** | + R2 ×2, R3 (PT) | ₦97,000 | ₦180,000* | ~₦400,000 |
| **30 schools** | + R4, R5 (PT), R6, R7 | ₦935,000 | ₦540,000* | ~₦2,000,000 |
| **60 schools** | Full team ~12 | ₦2,800,000 | ₦1,350,000* | ~₦6,000,000 |

\* Variable costs are **facilitator fees, paid only from collected programme revenue.**

**Every stage is funded by the previous stage's revenue.** No stage requires capital.
That is the defining property of this hiring plan, and the reason it is safe to follow
without funding.

---

## 5. Compensation philosophy `[DECISION]` D7

| Element | Position |
|---|---|
| Salaries | **Slightly below market, transparently** — offset with flexibility, ownership and real responsibility |
| Variable pay | Aggressive — commissions and per-session fees keep fixed costs low |
| Equity | Reserve **10–15% ESOP**; grant only to R4/R5-level long-term contributors, always vesting over 3–4 years with a 1-year cliff |
| Non-cash | References, certificates, public credit, training, career path — **these genuinely work with students and early-career hires and cost nothing** |
| Founder pay | Last to be paid, but **write down the trigger** and honour it ([doc 05](./05-financial-model.md) §6) |

---

## 6. The first three hires, in order

If you only do three things from this document:

| Order | Hire | Trigger | Cost | Why this order |
|---:|---|---|---|---|
| **1** | **School proprietor advisor** (R8) | **Now** | ₦0 | Zero cost, immediate correction of wrong assumptions |
| **2** | **Two programme facilitators** (R2) | First 15 paid programme enrolments | Variable, self-funding | Unlocks the entire business model |
| **3** | **Part-time support assistant** (R3) — ideally a teacher from a customer school | Support >15 hrs/wk | ₦60–100k/mo | Buys back the founder hours that everything else depends on |

**All three are achievable with ₦0 capital.** Nothing in the growth plan requires
external funding — it requires sequencing.
