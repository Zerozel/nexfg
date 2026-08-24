# Founder: Make this opportunity commercially attractive

> **Role brief:** argue the strongest honest case for why this is a commercially
> attractive opportunity. No fabrication — every claim must survive the other four
> reviewers.

---

## 1. The pitch

**Nigerian private schools are trapped in a commodity war they cannot win.**

There are ~55,000–70,000 of them `[ASSUMPTION]`, and to a parent choosing between six
schools within 3km, they are indistinguishable: same curriculum, same WAEC promise, same
uniform, same fence. So they compete on the only visible axes — buildings and fees —
which is a race to the bottom for everyone.

**Meanwhile the product they sell is losing its value.** A Nigerian secondary
certificate no longer guarantees employment, and parents know it. That creates a gap
between what schools deliver (exam passes) and what parents now want (a child who can
actually do something).

**NexaForge sells schools the escape from commoditisation.** We take over the
administrative burden that consumes their term, then give them something none of their
neighbours have: coding programmes, entrepreneurship training, inter-school
competitions, scholarships, and a professional public presence a parent can find
online.

**We are not selling software. We are selling differentiation to businesses that are
dying from the lack of it.**

---

## 2. Why the entry point works

The wedge is not the vision — it is a specific, recurring, acute pain.

**Results week.** Three times a year, every school does this: chase 20 teachers for
score sheets, transcribe hundreds of scores into Excel, hand-calculate totals and
positions, discover an error, redo a class, print report cards at midnight. Principals
routinely describe **40+ hours** of work compressed into a fortnight `[VERIFY — M14]`.

We collapse it to an afternoon. Teachers enter scores on their phones. Grades compute on
the A1–F9 scale automatically. The principal prints an entire class in one action. `[CODE]`

**And critically — it works when the network doesn't.** Score entry is offline-first
with a real sync engine: batching, retry with backoff, per-record error attribution
`[CODE]`. In a country where connectivity is the reason most school software fails
adoption, this is the difference between a system teachers use and a system they
abandon.

**The sales demo is one gesture:** turn on airplane mode, type three scores, turn it
off, watch them sync. **No competitor in this market can perform that demonstration.**

---

## 3. The commercial architecture — where the money actually is

Here is the part that makes this attractive rather than merely worthy.

**The subscription is not the business.** ₦15,000–60,000 per term is deliberately
cheap — it is the price of admission to a relationship, and to the school's academic
data.

**The business is the programmes.** Consider one 400-student school:

| | Revenue/term | Gross profit/term |
|---|---:|---:|
| Software subscription (Growth) | ₦30,000 | ₦25,500 |
| One programme @ ₦2,500, 30% take-up | ₦300,000 | ₦150,000 |

**Programmes generate ~6× the gross profit of the software, from the same school, with
no additional customer acquisition.** `[ASSUMPTION — M3]`

**The structural insight that makes this work:** programme revenue comes from the
**parent's** wallet, not the school's. A school's software budget is small, fixed and
contested. A parent's spend on their child's advantage is elastic and emotional. We
never ask the school for more money — we ask for **access to its parents**, which is
almost free for the school to grant and enormously valuable to us.

**Reframed: we are not acquiring 15 school customers. We are acquiring 6,000 parent
relationships at near-zero marginal CAC.**

At maturity, one school is worth **~₦1.4M/year across all layers**, against ₦81,000 from
software alone.

---

## 4. Why the economics are attractive at this specific size

| Metric | Value |
|---|---|
| Cash to operate today | **~₦17,000/month** ([05](../05-financial-model.md)) |
| Cash CAC per school | **~₦2,000–5,000** (transport and data) |
| Break-even on operating costs | **2 schools** |
| Break-even with programmes + founder salary | **~9 schools** |
| Gross margin, software | ~85% |
| Gross margin, programmes | ~50% |

**Nine schools with programmes replaces a ₦250,000/month salary.** Not ninety. Nine.

And the product is **already built and deployed** — multi-tenant SIS, offline sync,
report-card printing, per-school public websites, Paystack subscription billing, RLS
tenant isolation. `[CODE]` There is no build risk between here and revenue.

---

## 5. Why this is hard to take away from us

Anyone can copy the software in a term. Nobody can copy the sequence.

| Layer | Why it resists replication |
|---|---|
| Offline sync | Architectural, not a feature — a retrofit is a rewrite. 6–12 months of lag. |
| **Multi-year academic history** | **Requires elapsed time. Cannot be bought at any price.** |
| Single-LGA density | Built relationship by relationship, in person |
| Parent-visible inter-school league | Status systems are winner-take-all. Two leagues cannot coexist. |
| Sponsor-funded delivery | Lets us be *free and better* — unmatchable by a pure-SaaS rival |
| Association exclusivity | A competitor must displace an institution, not a product |

**The layers are sequentially dependent.** A league needs multi-school data. Credentials
need programme outcomes. Sponsors need proven outcomes. Associations need event value.
A funded competitor with ₦500M can copy the software in eight weeks and still be three
years from the credential layer — because **the early layers are the least profitable,
which is exactly why a company optimising for this quarter will never start them.**

---

## 6. Why now

- Teacher smartphone penetration has crossed the threshold that makes phone-based entry viable `[ASSUMPTION]`
- Paystack made ₦15,000 recurring collection trivial and cheap `[CODE]`
- Serverless infrastructure means one person can run multi-tenant infra for the price of a phone plan
- Parental faith in certificates-as-employment is visibly eroding — **this is the wind behind the programme thesis specifically**
- Incumbents are still selling online-only software with monthly billing to a market that has neither reliable internet nor monthly cash flow

---

## 7. What I am asking for

**Nothing.** That is the point, and it is the most attractive feature of this
opportunity.

The product is built. Operating cost is ₦17,000/month. The 90-day plan requires
~₦176,000 — transport, a Vercel Pro subscription, and printing. There is no
funding round to close, no runway to burn, no dilution to accept.

**The only investment required is founder time, and the only question worth answering is
the one experiment in [doc 11](../11-data-validation-plan.md) M3: will 20% of parents in
one school pay ₦2,500 for a coding programme?**

That test costs one curriculum, one facilitator, one term. If it clears 20%, the path to
₦14M in year 2 is arithmetic. If it fails, we know inside 90 days, having spent almost
nothing.

---

## 8. The honest version

I will not pretend this is a venture-scale software business. **The entire formal
Nigerian private school market at our software pricing is only ~₦2bn/year (~$1.3M).**

But the programme layer sells into the parent's wallet, which is roughly 50× larger,
turning the same customer base into an **₦8–10bn addressable market** `[ASSUMPTION]`.

And there is a second honest constraint: **Path A — software only — does not work.**
Three years of it produces ₦5.4M revenue against ₦6M costs and pays the founder nothing
([05](../05-financial-model.md) §3). I am not asking anyone to believe in a SaaS
business. **I am asking them to fund one experiment that determines whether the real
business exists.**

That is the commercially attractive proposition here: **an already-built distribution
asset, a near-zero cost base, and one cheap, decisive test standing between it and a
₦40M/year business with a moat that takes competitors three years to cross.**
