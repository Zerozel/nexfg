# Synthesis — Bringing the Five Conclusions Together

> Five adversarial roles argued independently: the founder made the commercial case, four
> buyer voices explained why they would or wouldn't pay, a competitor wrote the memo to
> destroy the company, an engineer priced the build, and a VC tried to prove it fails.
>
> **This document reconciles them.** Where they agree, treat it as established fact.
> Where they conflict, the conflict itself is the finding.

---

## 1. What all five agreed on — treat as established

| # | Agreed finding | Who said it |
|---|---|---|
| 1 | **The offline-first sync engine is the one genuinely differentiated asset** | Founder (it's the demo) · Proprietor ("the only reason I let you finish talking") · Competitor ("we cannot quickly copy this") · Engineer ("genuinely good, 6–8 weeks of careful work") · VC ("genuinely differentiated") |
| 2 | **Software price is not the obstacle; ₦15,000/term is trivially affordable** | Proprietor ("₦15,000 is not money to me") · Founder · VC (concedes) |
| 3 | **The programme thesis is completely unvalidated and decides everything** | Founder ("the only question worth answering") · Competitor ("they have never sold one") · VC ("never sold a single programme") · Engineer (implicitly) |
| 4 | **The marketing claims are a live, self-inflicted liability** | Proprietor ("give me two names") · Competitor ("our cheapest attack") · VC ("a character question") |
| 5 | **Founder cash exhaustion is the most probable cause of death** | VC (§3, full timeline) · Competitor (Attack 7: "simply wait") · Founder (concedes Path A fails) |
| 6 | **The cost base is genuinely near-zero and this is a real strategic advantage** | Engineer (₦85k/mo at 15 schools) · Competitor ("removes our most reliable weapon") · VC ("cannot be starved out") |
| 7 | **Term-based billing is smarter than incumbent monthly pricing** | Proprietor ("why am I paying you in August?") · Competitor ("our pricing looks tone-deaf beside it") · VC (concedes) |

**Seven points of unanimous agreement across five adversarial perspectives is unusual.**
It means the plan's core reading of the market is sound. The disagreements are about
whether it can be executed, not whether it is correct.

---

## 2. 🔴 The finding nobody expected: the bursar

**This emerged independently from three roles and it was not in the original plan at all.**

| Role | What they said |
|---|---|
| **Customer (Bursar)** | *"You are selling report cards. I am drowning in receivables. The Moniepoint agent already came here and said the software is free."* |
| **Competitor** | *"They are selling to the principal and ignoring the bursar. Attack 1 is our winning move — free SIS on the fee rail. ₦900,000/year per school vs their ₦81,000."* |
| **Engineer** | *"Fee tracking: move it forward. 40–60 hours closes the competitor's best attack vector."* |
| **VC** | *"Their defence against the competitive threat is to exit the market they built a product for."* |

### The chain of reasoning, assembled

1. The plan sells to the **principal** (results-week pain) and the **proprietor** (differentiation)
2. But the **bursar** controls spending approval, and her pain is **fees**, not report cards
3. There is **no fee module** in the product
4. Payments companies solve fees, monetise 0.5–1% of collections, and can therefore give software away **free forever**
5. ₦900,000/year per school from the rail vs ₦81,000 from a subscription — **11× the revenue at a price of zero**
6. **The agent has already visited.** This is not a future threat.

**Conclusion: fee tracking is not a Layer-4 nicety. It is the gap through which a funded
competitor takes the entire account — software, relationship, and the programme channel
built on top of it.**

**Revision to the plan:** build **fee tracking as a ledger** (record payments, receipts,
outstanding-fees list) at ~40–60 hours, positioned after the claims fixes and the export
feature. **Do not build payment processing** — the engineer and the bursar both warn
against touching fee money, for different but equally good reasons.

---

## 3. Where the roles genuinely conflicted

### Conflict 1 — Is the market big enough?

| | Position |
|---|---|
| **VC** | ₦1.13bn total SIS market ≈ $750k. 100% share is a small restaurant group. Unfundable. |
| **Founder** | Correct — which is why the software isn't the business. Programmes sell into the parent wallet, ~50× larger. |

**Resolution: both are right, and the VC's number is the more useful one.**

The software market genuinely is too small to build a company on. The founder's answer is
correct in principle but **entirely unproven**, which means at this moment **the VC's
assessment is the operative one**. It becomes wrong only when M3 validates.

> **This resolves to a single instruction: the software business is not a business. Either
> the programme layer works, or there is nothing here. Test it now.**

### Conflict 2 — Is the moat real?

| | Position |
|---|---|
| **Founder** | Six sequentially-dependent layers; capital cannot compress calendar time. 3–4 years to parity. |
| **Competitor** | Agrees — *"yes, in about three years, in whatever LGAs they saturate first"* — but adds: **at 5 schools there is no moat at all.** Poach within 12 months. |
| **VC** | The key asset is "founder credibility, non-transferable." That's a definition of unfundability. |

**Resolution: the moat is real but not yet built, and there is a closing window.**

The competitor's most valuable admission: *"our own strengths prevent us from occupying
the ground they are claiming."* Large companies will not run coding clubs, vet
facilitators, or spend three unprofitable years building a local league.

**But the same memo says: act within 12 months and they lose.** The moat's protection is
a function of elapsed time, and the clock has not started.

> **Resolution: the moat thesis survives, with a deadline attached. Density in one LGA
> within 12 months, or the strategy's central premise expires unrealised.**

### Conflict 3 — Will parents pay when they can't pay fees?

**This is the sharpest conflict in the review, and it comes from the plan's own research.**

| | Position |
|---|---|
| **Founder** | 20–30% take-up at ₦2,500. Parent spend on a child's advantage is elastic and emotional. |
| **VC** | **Your own bursar says 180 of 620 students are in fee arrears — 29%. You are assuming 20–30% of those same parents pay extra for an optional coding club. That is a contradiction inside your own research.** |

**Resolution: the VC lands a genuine hit, and the plan must absorb it.**

There is a defensible counter — the arrears cohort and the discretionary-spend cohort are
not the same families, and Nigerian parents demonstrably fund extra lessons, lesson
teachers and holiday coaching. But that counter is **an assumption defending an
assumption.**

> **Resolution: this conflict cannot be argued to a conclusion. It can only be measured.**
> It raises the stakes on M3 and argues for **testing at two price points** (₦2,500 and
> ₦1,500) rather than one, so a low result distinguishes *"no demand"* from *"wrong price."*

### Conflict 4 — Is the real CAC ₦5,000 or ₦100,000?

| | Position |
|---|---|
| **Founder** | ₦2,000–5,000 cash CAC. |
| **VC** | 20 founder-hours ≈ ₦100,000 at any reasonable opportunity cost. **20–50× understated.** |

**Resolution: the VC is analytically right, and the founder is operationally right.**

Founder time has a real opportunity cost — the ₦600,000/month job in the VC's own §3
timeline proves it. So ₦100,000 is the honest economic CAC.

**But the constraint is not money, it is hours.** The plan already recognises this via the
founder-hour budget in [doc 06](../06-go-to-market.md).

> **Resolution: stop quoting cash CAC. Adopt the founder-hour budget as the real
> constraint, and add the VC's discipline: at 20 hours per school and ~45 sellable hours
> per week, the ceiling is ~3 schools/month. Any plan implying more is arithmetically
> false.**

### Conflict 5 — What should be built next?

| | Position |
|---|---|
| **Plan** | Claims fixes → export → attendance → programmes |
| **Engineer** | **Baseline migration first** (existential), then export, **then fee tracking and CSV import** — because support hours, not features, cap growth |
| **Customer** | Export is a **closing tool**. Attendance matters for complete report cards. Fees matter to the person who approves spending. |

**Resolution: the engineer's reordering wins, with one addition.**

> **Migration/backups (4h) → claims fixes (4h) → export (14h) → CSV import (16h) →
> attendance (18h) → fee ledger (40–60h).**
>
> CSV import moves up because it converts non-scalable founder hours into software — the
> single highest-leverage engineering trade available.

---

## 4. The four roles that agreed on the same 12-month deadline

Read independently, these converge on one date. That convergence is the review's most
important structural finding.

| Role | Their 12-month statement |
|---|---|
| **Competitor** | *"We must poach within 12 months or the switching cost defeats us... if they execute before we move, we cannot dislodge them."* |
| **VC** | *"Month 10: founder accepts a job. Month 15: company dead."* |
| **Engineer** | *"Full PWA within 12 months or the offline lead evaporates."* |
| **Founder** | *"Nine schools with programmes replaces a salary."* |

**All four describe the same window from different angles.** Roughly twelve months in
which the company either reaches ~9–15 schools in one LGA with a validated programme
layer, or it becomes either (a) poachable, (b) abandoned for a salary, or (c) technically
overtaken.

> **The synthesis conclusion: this is not a business with an open-ended runway. It has a
> ~12-month strategic window, and the constraint is founder hours and founder cash — not
> capital, not competition, not product.**

---

## 5. The combined verdict

### Everyone agreed on the diagnosis

**This is not a software company and cannot succeed as one.** The software market is
₦1.13bn (VC), the software is copyable in a term (competitor), the software is already
built and cheap to run (engineer), the software is affordable but not transformative to
buyers (customer), and the software's entire purpose is to buy access to parents
(founder).

**The software is a distribution asset. The business is the programme layer. And the
programme layer has never been tested.**

### The single most important sentence in the review

> **Every role — including the two trying to destroy the company — concluded that the
> decisive question is whether 20% of parents at one school will pay ₦2,500 for a
> programme, and that this can be answered in one term for under ₦200,000.**

The founder called it *"the only question worth answering."* The competitor called
programme delivery *"genuinely their most defensible ground."* The VC called it *"a
question that cheap and that decisive."* The engineer noted it requires no engineering at
all.

**A five-way adversarial review converging on one cheap experiment is the strongest
possible signal about what to do next.**

### What changes in the plan as a result

| # | Change | Source |
|---|---|---|
| **1** | **Baseline migration + verified restore, before anything else** (4h) | Engineer |
| **2** | **Fix every marketing claim this week** — it is the competitor's cheapest attack and the customer's stated objection | Competitor, Customer, VC |
| **3** | **Bring fee tracking forward** — ledger only, 40–60h. The bursar controls spending. | Customer, Competitor, Engineer |
| **4** | **Test M3 at two price points** (₦2,500 and ₦1,500) to separate "no demand" from "wrong price" | VC |
| **5** | **Adopt founder-hours as the real CAC**; cap at 3 schools/month | VC |
| **6** | **CSV import before any customer-facing feature** — converts founder hours into software | Engineer |
| **7** | **Give the principal a one-page hours-saved report with his name on it** — career cover, not features | Customer (Voice 2) |
| **8** | **Two callable references before the next sales call** | Customer (Voice 1) |
| **9** | **Take bridge consulting deliberately, now, at ≤10 hrs/week** — it defends against the #1 failure mode | VC, Competitor |
| **10** | **12-month density deadline: 15 schools in one LGA with a parent-visible league** | Competitor |

---

## 6. Final position

**The VC is right that this is not venture-backable.** ₦1.13bn software market,
non-transferable founder asset, services-business margins. That is structural and no
execution changes it.

**The competitor is right that a 12-month window exists** — and right, more importantly,
that large companies structurally will not occupy the programme-and-league ground, which
is precisely why it is defensible.

**The engineer is right that the software is cheap and already good**, and that the
missing baseline migration is an unmanaged existential risk that four hours eliminates.

**The customers are right that the pain is real, the price is trivial, the claims are
damaging, and the bursar is unaddressed.**

**And the founder is right about the one thing that matters most: nothing here requires
capital.** ₦176,000 and thirteen weeks stands between this plan and the truth.

> **The reconciled conclusion: proceed — but proceed as an experiment with a written
> deadline, not as a commitment. Fix the four-hour existential risk today. Make every
> public claim true this week. Then spend the term answering one question with real
> money: will parents pay?**
>
> **If yes, you have a business with a moat that takes competitors three years to cross,
> and you will never need an investor. If no, you will know inside ninety days, having
> spent less than ₦200,000 — and you will have saved yourself the two unpaid years that
> the VC's timeline predicts.**
>
> **Either outcome is a good outcome. The only bad outcome is spending another year
> building software and never asking the question.**
