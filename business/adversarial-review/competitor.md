# Competitor: How would an established company destroy this?

> **Role brief:** you are Head of Strategy at a company with capital, distribution and
> engineers. Write the memo that kills NexaForge. Be ruthless and specific.

---

## MEMO — CONFIDENTIAL

**To:** Executive Committee
**Re:** Competitive response — NexaForge (Nigeria, K-12)
**Assessment:** Low immediate threat. **Non-trivial 3-year threat if ignored.**

---

## 1. What they actually have

Let me start by being fair, because underestimating them is how we lose.

**Real assets:**
- **A genuine offline-first sync engine.** Not a marketing claim — batching, exponential backoff, per-record error attribution, local reconciliation. **This is the one thing we cannot quickly copy**, and it addresses the single biggest cause of adoption failure in this market.
- Working multi-tenant SIS, report-card printing, per-school public sites, Paystack billing.
- **Term-based pricing.** Aligned to how schools actually hold cash. Our monthly SaaS pricing looks tone-deaf beside it.
- **Zero cost base.** ~₦17,000/month. They cannot be starved out, which removes our most reliable weapon.

**Real weaknesses — and these are severe:**
- One person. No team, no capital, no brand.
- **No fee management.** In our experience, fees are the #1 stated pain of the person who controls school spending. They are selling to the principal and ignoring the bursar.
- Marketing promises programmes, competitions, scholarships, government partnerships — **none of which exist.** This is exploitable.
- Unverifiable social proof ("20+ schools", "3× Award Winner").
- **Their entire strategy depends on an untested assumption:** that parents will pay for after-school programmes. They have never sold one.

---

## 2. The core strategic read

**Their software is a commodity. Their strategy is not.**

We could replicate their product in one term with three engineers. That is not the
question. The question is whether their *sequence* — offline wedge → data lock →
inter-school league → credentials → sponsor-funded delivery → association exclusivity —
becomes something we cannot enter.

**My honest assessment: yes, in about three years, in whatever LGAs they saturate first.**

Because the sequence has a property I dislike: **it requires calendar time in a fixed
order, and capital cannot compress it.** You cannot buy three years of student academic
history. You cannot buy a parent-recognised league without first having 15 schools in one
locality. We are structurally bad at the local, unglamorous, relationship-heavy work this
requires — and they are structurally good at it, because they have nothing else to do.

**So we should act now, while they are one person with zero references.**

---

## 3. Attack options, ranked by effectiveness

### 🥇 Attack 1 — Make school software free, monetise the fee rail

**This is the winning move and it is barely even an attack — it's just our business
model.**

Offer the complete SIS **free forever** to any school that collects fees through our
platform. We earn 0.5–1% of fee volume. A 500-student school at ₦80,000/term generates
₦120M/year of collections. **At 0.75%, that is ₦900,000/year per school.**

NexaForge's entire software revenue for that school is **₦81,000/year.**

**We can earn 11× their software revenue while charging the school nothing.**

Why this destroys them:
- They cannot match free. Their unit economics collapse to zero.
- **It targets the bursar, who controls spending.** They are courting the principal, who does not.
- We solve the pain they don't address — receivables, reconciliation, defaulter chasing.
- Their term-billing advantage evaporates. Zero beats any price.

**Their only defence** — and I want the committee to understand it — is that they don't
actually make money from software either. Their model is programmes. **Free software
hurts them far less than it would hurt Edves or Safsims.** If they've thought it through,
they'll simply integrate with our rail and keep selling programmes on top.

Which is why Attack 1 alone is insufficient.

### 🥈 Attack 2 — Poach the reference schools before they compound

Their moat is 15 schools in one LGA. **At 5 schools, there is no moat at all.**

- Identify every school they onboard (trivially easy — their public school websites are indexed and branded)
- Offer: free for a full session, free data migration, free devices for the computer lab
- Target their **best** schools specifically — the reference accounts and testimonials
- **Cost to us: ~₦2M for 10 schools. Rounding error.**

**Why the timing matters:** a school with one term of data leaves easily. A school with
six terms does not. **We must do this within 12 months or the switching cost defeats us.**

### 🥉 Attack 3 — Attack the credibility gap

**Their marketing is a liability and we should use it.**

Their site claims:
- "3× Award Winner" — no award named
- "20+ Active Schools", "500+ Students" — arithmetically odd (25 students/school?) and unverifiable
- Programmes, competitions, scholarships, government partnerships — **all in present tense, none delivered**
- Features they do not have (attendance tracking, advanced analytics, white-label)

**The play:** a comparison sheet distributed to schools in their target LGA. Two columns:
"What they claim / What they have." Invite the school to ask for a reference and a
competition date.

**Why this is disproportionately effective:** this market runs on word of mouth. **One
proprietor telling five others "they promised programmes that don't exist" does more
damage than ₦10M of our advertising.** And unlike our other attacks, this one costs
almost nothing and requires no product work.

> ⚠️ **Note for the committee:** if they read their own claims audit and fix these before
> we act, this attack disappears entirely. It has a short window.

### Attack 4 — Buy the channel above them

Sponsor **NAPPS at national level.** Fund the national conference. Become the officially
endorsed platform.

They are courting individual LGA chapters. **We buy the parent body and make their
chapter-level relationships look parochial.**

Cost: ₦20–50M. Meaningful but affordable. Effect: every LGA chapter they approach has
already been told the national body endorses us.

**Limitation, honestly:** Nigerian local associations are not tightly controlled from the
top. A chapter chairman with a personal relationship may ignore a national endorsement.
This weakens but does not eliminate their channel play.

### Attack 5 — Copy the offline engine

6–12 weeks of focused work for our team. Then their demo advantage disappears.

**Do this, but understand it is defensive, not decisive.** It removes their wedge; it
doesn't take their schools.

### Attack 6 — Hire the founder

**₦25M/year, a title, and a small team.** For a solo founder with no salary, this is a
life-changing offer, and one many would accept.

We acquire: the offline architecture, the market knowledge, the school relationships,
and — most valuably — **the person who thought of the sequence.** The company dissolves
without us needing to compete at all.

**Cost-effectiveness: extremely high.** This is my recommended parallel action.

### Attack 7 — Simply wait

They have no salary. Their own financial model shows software-only revenue never pays the
founder. **Most solo founders in this position exit within 18 months to a job offer.**

**Cost: ₦0. Probability of success: perhaps 50%.**

---

## 4. What I would NOT do

Instructive to state, because it reveals what actually protects them:

- **Don't compete on features.** Their advantage isn't the feature list, and a feature war validates them.
- **Don't launch our own after-school programme network.** Facilitators, safeguarding, curriculum, scheduling, parent collections — this is a low-margin operational business we would run badly and abandon within four quarters. **This is genuinely their most defensible ground, and it is defensible precisely because we don't want it.**
- **Don't fight them school-by-school in their saturated LGA.** Once a locality has a functioning inter-school league with parent visibility, entering it means asking a school to leave a status system. Very expensive. **Better to take the LGAs they haven't reached yet.**
- **Don't attack their credibility after they've fixed it.** Timing-dependent.

---

## 5. Recommendation

| Priority | Action | Cost | Timeline |
|---|---|---:|---|
| **1** | Free SIS bundled with fee collection | Existing roadmap | Q1 |
| **2** | Acquisition/hiring approach to the founder | ₦25M/yr | Immediately |
| **3** | Targeted poaching of their 10 best schools | ₦2M | Within 12 months |
| **4** | Credibility comparison sheet in their LGA | ₦200k | **Now, while the window exists** |
| 5 | Build offline sync | 3 engineers, 1 quarter | Q2 |
| 6 | NAPPS national sponsorship | ₦20–50M | Q3 |

**Estimated probability we eliminate them as a competitive factor within 24 months: 65–75%.**

---

## 6. The uncomfortable part of this memo

I have to be honest with the committee about the 25–35%.

**If they do four specific things, they become genuinely difficult:**

1. **Fix the marketing claims immediately** — removes our cheapest attack
2. **Prove the programme thesis** — gives them revenue we structurally will not compete for
3. **Reach 15 schools in one LGA with a parent-visible league** — creates a status system we cannot enter cheaply
4. **Add fee tracking** — closes the bursar gap that is currently our best entry point

**And there is a deeper problem.** Their strategy is designed around the assumption that
we will behave like a large company — optimise quarterly, avoid operationally messy
low-margin work, prefer software margins to service margins. **That assumption about us is
correct.** It is the most uncomfortable sentence in this memo.

We will not run coding clubs in Ilorin. We will not vet facilitators or manage
safeguarding for after-school programmes. We will not spend three years building a
schools league in one LGA before it produces revenue. **Our own strengths prevent us from
occupying the ground they are claiming.**

**Which means: we win if we act in the next 12 months. If they execute their sequence
before we move, we are looking at a niche competitor we cannot dislodge from whatever
localities they've saturated — and eventually an acquisition at a price set by them
rather than by us.**

Recommend we proceed with priorities 1–4 immediately.
