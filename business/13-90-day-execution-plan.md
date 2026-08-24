# 13 — 90-Day Execution Plan

> Everything else in this folder is analysis. **This is the part you act on.**
> Total cash required: **~₦150,000** (mostly Vercel Pro + transport + optional CAC).
> Total founder time: **~13 weeks.**
>
> **Sequencing principle:** eliminate catastrophic risk first (it's cheap), then make
> claims honest (it's free), then sell, then test the thesis that decides the company's
> future. Do not reorder — each phase de-risks the next.

---

## Phase 1 — Weeks 1–2: Stop the bleeding

**Goal: eliminate company-ending risk and make every public claim true.**
No selling this fortnight. This is the cheapest two weeks of risk reduction available.

### Week 1 — Data safety + honesty

| # | Task | Hrs | Ref |
|---|---|---:|---|
| 1 | `supabase db dump` → commit `00000000000001_baseline.sql` | 2 | [02](./02-product-claims-audit.md) H5 |
| 2 | Verify a fresh local DB builds from migrations alone | 1 | H5 |
| 3 | Enable automated daily backups + **run one restore test** | 2 | [12](./12-risk-register.md) R4 |
| 4 | Remove "3× Award Winner", "20+ Schools", "500+ Students", "98% Setup" → honest copy | 1 | C3 |
| 5 | Unify trial to **30 days** everywhere | 0.5 | C4 |
| 6 | Label Devices/Programmes/Government as `PLANNED 2026` + add waitlist CTA | 2 | H1 |
| 7 | Remove "attendance", "advanced analytics", "white-label" from copy | 1 | C1a, H2 |
| 8 | Fix session pricing to ~12% discount (₦40k/₦79k/₦158k) | 0.5 | [04](./04-business-model.md) §5 |
| 9 | Move to **Vercel Pro** (₦32k/mo) — Hobby prohibits commercial use | 0.5 | [05](./05-financial-model.md) §7 |
| 10 | Rewrite hero pill → *"Works when the network doesn't"*; add offline block | 3 | [01](./01-value-proposition.md) §4 |
| | **Total** | **~14** | |

### Week 2 — Legal, market, positioning

| # | Task | Hrs |
|---|---|---:|
| 11 | Write the **LGA school census** — every private school within 20km, with students/fees/proprietor | 12 |
| 12 | Filter to ≥150 students **and** ≥₦40k fees → your target list | 1 |
| 13 | Draft the **one-page school agreement** (scope, price, term, data clauses, export right, termination) | 3 |
| 14 | Write + publish **privacy policy** and processor/controller clause | 3 |
| 15 | Open a separate business bank account | 2 |
| 16 | Write your **personal runway in months** on paper. Decide on bridge consulting. | 1 |
| 17 | Build the **M7 teacher-activation SQL query**; run it weekly from now on | 1 |
| 18 | Approach **one respected proprietor** as unpaid advisor | 2 |
| | **Total** | **~25** |

**Phase 1 exit criteria:** database rebuildable · backups tested · every marketing claim
true · target list built · runway known · advisor recruited.

---

## Phase 2 — Weeks 3–6: First five schools

**Goal: 5 paying schools in one LGA. Nothing else matters.**

### Weekly rhythm

| Activity | Hrs/wk |
|---|---:|
| School visits (target 8/week) | 16 |
| Follow-ups, demos, WhatsApp | 8 |
| Onboarding (max 3/month) | 8 |
| Product — export feature | 8 |
| Admin | 4 |
| **Total** | **44** |

### Key tasks

| # | Task | Ref |
|---|---|---|
| 19 | Visit **8 schools/week** from the ranked list — 32 conversations over 4 weeks | [06](./06-go-to-market.md) §4 |
| 20 | Perfect the **airplane-mode demo**. Rehearse until it is flawless | §4 |
| 21 | Ask every principal: *"How long did compiling results take last term?"* — record all answers | [11](./11-data-validation-plan.md) M14 |
| 22 | **Build the data export feature** (ZIP of CSVs) — honours a written promise + kills the biggest objection | [02](./02-product-claims-audit.md) C2 |
| 23 | Onboard each closed school fully — **you do the student import** | [08](./08-operational-plan.md) SOP-1 |
| 24 | Publish each school's public website while they watch | SOP-1 |
| 25 | Identify the **NAPPS LGA chairman**; offer his school free for a presentation slot | [06](./06-go-to-market.md) §7 |
| 26 | Log every loss with a reason code | [11](./11-data-validation-plan.md) M1 |

**Phase 2 exit criteria:** ≥5 paying schools (**3 acceptable**) · export shipped · 10
recorded results-week hour figures · NAPPS contact made.

> **If you have 0–1 schools after 32 visits, stop selling.** Interview 10 schools about
> why. The problem is positioning, price or segment — and more visits will not reveal
> which.

---

## Phase 3 — Weeks 7–10: Prove it works + build the programme pilot

**Goal: schools actually using it, and the programme thesis in market.**

| # | Task | Hrs | Ref |
|---|---|---:|---|
| 27 | **Run M7 weekly.** Any school <50% activation → on-site retraining within 7 days | 4/wk | [11](./11-data-validation-plan.md) M7 |
| 28 | Build the **termly attendance + comments entry screen** (report card completeness) | 10 | [02](./02-product-claims-audit.md) C1b, H3 |
| 29 | **Write one 6-session coding curriculum.** Nothing fancy — Scratch/HTML/Python basics, one output per session | 12 | [04](./04-business-model.md) §2 |
| 30 | Approach **3 university CS/robotics societies**; recruit 2 facilitators @ ₦12–18k/session | 6 | [10](./10-roles-and-hiring-plan.md) R2 |
| 31 | Write the **child-protection policy**; get it signed. Set the school-staff-present rule | 4 | [09](./09-operational-bodies.md) B9 |
| 32 | Write the **parent offer letter** — 6 sessions, ₦2,500, certificate, showcase day | 2 | [11](./11-data-validation-plan.md) M3 |
| 33 | Pick your **best-adopting school**; get the proprietor's agreement to pilot | 3 | M3 |
| 34 | Send the offer through the school in the school's name; **collect payment via Paystack** | 3 | M3 |
| 35 | Close enrolment at day 10 and **count take-up** 🔴 | 1 | M3 |
| 36 | Continue selling — 4 visits/week (schools 6–8) | 8/wk | |

**Phase 3 exit criteria:** M7 ≥60% at every school · **M3 measured** · 2 facilitators
recruited · safeguarding policy live · 8 schools total.

> **Week 10 is the single most important date in this plan.** M3 tells you which company
> you are running. Apply the [doc 11](./11-data-validation-plan.md) §4 decision table
> exactly as written — no renegotiation.

---

## Phase 4 — Weeks 11–13: Results week + renewal + decision

**Goal: survive results week flawlessly, collect renewals, decide the next 90 days.**

| # | Task | Ref |
|---|---|---|
| 37 | **Week 11:** WhatsApp every school — chase teachers with missing scores | [08](./08-operational-plan.md) SOP-2 |
| 38 | Verify every subscription is active — `expired` blocks access at the worst moment | SOP-2 |
| 39 | **Weeks 12–13: ZERO selling.** 2-hour response, 8am–8pm; be visitable in 3 hours | SOP-2 |
| 40 | Watch for sync failures, wrong weightings, print issues | SOP-2 |
| 41 | Verify grade computation against the school's own manual calc for one class per school | [09](./09-operational-bodies.md) B9 |
| 42 | Send each school a **term value summary** (students managed, report cards printed, hours saved) | SOP-3 |
| 43 | **Make the renewal ask immediately after report cards print** | SOP-3 |
| 44 | Collect one testimonial per school | |
| 45 | Ask each happy proprietor for **two named referrals** | [06](./06-go-to-market.md) §4 |
| 46 | Deliver programme sessions 1–6 if the pilot ran | SOP-4 |
| 47 | **Run the Term Review** — the 6-item agenda | [09](./09-operational-bodies.md) B1 |

**Phase 4 exit criteria:** every school printed report cards · renewal rate measured ·
testimonials collected · Term Review completed with next-90-day decisions written down.

---

## The 90-day scorecard

| Metric | Target | Minimum acceptable |
|---|---:|---:|
| Paying schools | 8 | **5** |
| Teacher activation (M7) | ≥70% | ≥50% |
| Report cards printed (M8) | ≥95% | ≥80% |
| Termly renewal (M2) | ≥85% | ≥70% |
| **Programme take-up (M3)** | **≥20%** | **measured at all** |
| Claims audit items closed | 9/9 | 7/9 |
| Backups tested | ✅ | ✅ **non-negotiable** |
| Cash position | ≥₦300k | ≥₦0 |

---

## Cash budget

| Item | Cost |
|---|---:|
| Vercel Pro (3 months) | ₦96,000 |
| Transport + data (13 weeks) | ₦45,000 |
| Printing (report card samples, certificates) | ₦15,000 |
| NAPPS meeting contribution | ₦20,000 |
| Domain (already held) | ₦0 |
| Supabase (free tier sufficient at ≤10 schools) | ₦0 |
| **Total** | **~₦176,000** |
| CAC Ltd registration (optional — required before sponsors/programmes at scale) | ₦100,000 |

**Facilitator fees are paid from collected programme revenue only** — they cannot
create a cash gap.

---

## The five things that actually matter

If the 90 days collapse to a shortlist, it is this:

1. **Commit the baseline migration and test a restore.** 4 hours removes the risk of losing every customer's data.
2. **Make every marketing claim true.** Free, and it protects the only distribution channel you have.
3. **Get 5 schools paying in one LGA.** Density, not spread.
4. **Measure programme take-up with real money.** This decides whether you have a business or a job.
5. **Know your personal runway and protect it.** The most common cause of death for a venture like this is the founder's bank account, not the market's.

---

## Week-one checklist

Start here, today:

- [ ] `supabase db dump > supabase/migrations/00000000000001_baseline.sql`
- [ ] Verify a fresh local DB builds from migrations
- [ ] Enable daily backups; perform one restore test
- [ ] Delete "3× Award Winner", "20+ Schools", "500+ Students", "98% Setup"
- [ ] Change 14-day trial → 30-day everywhere
- [ ] Label Programmes/Devices/Government as `PLANNED 2026` + waitlist
- [ ] Remove "attendance" from Student Management copy
- [ ] Upgrade to Vercel Pro
- [ ] Replace hero pill with the offline claim
- [ ] Write your personal runway, in months, on paper
