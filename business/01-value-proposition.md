# 01 — Value Proposition

Extracted from the marketing layer (`src/lib/marketing/constants.ts`, `src/components/marketing/*`)
and then stress-tested against what the code actually delivers.

---

## 1. The marketing narrative as written `[CODE]`

The site makes a deliberate, unusual choice: it **refuses to lead with features.**

| Section | The claim | Verdict |
|---|---|---|
| Hero | *"We Did Not Come to Manage Schools. We Came to Change What They Produce."* | **Strong.** Positions against the entire category. Memorable, quotable, ownable. |
| Problem | *"Nigerian education has been producing job-seekers for 60 years"* + *"The certificate is not the ceiling. But nobody told the school."* | **Excellent.** The pull-quote is the best asset in the whole property. |
| Platform | *"Everything a school needs. Nothing it doesn't."* | Accurate to the code. Defensible. |
| Programmes | *"This is where NexaForge stops being software."* | **The core differentiator — and entirely unbuilt.** |
| Ecosystem | 4 pillars: Platform / Devices / Programmes / Government | 1 of 4 exists. |
| Pricing | *"Pay per term. Not per month."* | **Genuinely excellent positioning.** Real insight into buyer psychology. |

### What the copy gets right

1. **It sells identity, not utility.** "Schools that refuse to produce students who are only good at passing exams" invites a principal to self-identify as a certain *kind* of educator. Utility can be undercut on price; identity cannot.

2. **The billing insight is a genuine wedge.** *"Nigerian schools do not operate month to month."* This is correct and most competitors get it wrong. A school's cash arrives in a lump at resumption; monthly debits during a holiday feel like theft. "No August charges" is a small promise that signals *we actually understand you* louder than any feature list.

3. **The website inclusion is asymmetric value.** A school perceives a website as a ₦80k–250k purchase `[ASSUMPTION]`. Bundling it into a ₦15k/term plan makes the plan feel underpriced — while costing you a subdomain and a database row `[CODE]`.

4. **"Your data. Always yours."** Directly attacks the #1 unspoken fear: *hostage data*. The FAQ commits to export in standard formats — this must actually be built (see [doc 02](./02-product-claims-audit.md)).

### What the copy gets wrong

1. **It buries the only hard-to-copy technical asset.** Offline-first sync `[CODE]` appears nowhere in the marketing. Instead we get *"Works on any phone or laptop"* — a feature pill so generic it is worthless. This is the single biggest copy error on the site. See §4.

2. **It sells four pillars and delivers one.** The Ecosystem section presents Devices, Programmes and Government as existing infrastructure. They do not exist. `[RISK]`

3. **The FAQ names competitors and then loses the comparison.** *"Competitors automate your paperwork. NexaForge does that too — but that is only the door."* This concedes feature parity (which we may not have) and then pivots to benefits we cannot yet deliver. A principal who calls an Edves customer will find Edves does *more* paperwork automation, and that our door leads to an empty room.

4. **The claimed traction is unsubstantiated.** "20+ Active Schools", "500+ Students Managed", "3× Award Winner", "98% Setup Success Rate" `[CODE]`. If these are not literally true, they are the highest-risk items on the property. See [doc 02](./02-product-claims-audit.md).

---

## 2. The value proposition, per buyer

A school is not one customer. It is **four decision-makers with different fears.**

### Proprietor / Owner — buys growth and prestige
> *"You are competing with six schools within 3km that look exactly like you to a parent doing a WhatsApp comparison. NexaForge gives you something none of them have: a professional web presence a parent can find, and programmes that let you say — truthfully — that your students learn to code, pitch a business, and compete nationally. That is a reason to charge ₦20,000 more per term."*

**Buying trigger:** enrolment growth. **Price sensitivity:** low if enrolment story is credible. **Fear:** looking like a small local school when parents research online.

### Principal / Head Teacher — buys the end of results week
> *"Right now results week costs you 40+ hours of chasing teachers for score sheets, recalculating totals by hand, and finding an error the day before you distribute report cards. NexaForge collapses that to an afternoon: teachers enter scores from their phones — even with no network — grades compute on the A1–F9 scale automatically, and you print an entire class in one action."* `[CODE]`

**Buying trigger:** the memory of the last results week. **Price sensitivity:** low — measured against pain. **Fear:** a public error on a report card handed to a parent.

**This is the primary buyer. Sell to this person first.** The pain is acute, recent, recurring, and already understood.

### Bursar — buys reconciliation, and is the gatekeeper
> *"Every term you reconcile fee payments against a register in a notebook, and every term there is a gap you cannot explain."*

**Currently unserved by the platform** — there is no fee-management module `[CODE]`. This is a strategic hole: the bursar controls the money and is exactly who a payments-company competitor will call ([doc 07](./07-moat-and-defensibility.md)).

### Teacher — the veto, not the buyer
Teachers cannot approve purchases but can absolutely kill adoption by refusing to use it. The offline capability is the answer: it is the difference between *"this doesn't work, network is bad"* and *"just enter the scores, it syncs later."*

> *"Enter scores on your phone during break. No network needed. It saves on your device and uploads itself when data returns."* `[CODE]`

---

## 3. Positioning statement

**For** private school owners and principals in Nigeria (100–800 students, ₦40k–200k/term fees)
**who** are commoditised against near-identical local competitors and lose 40+ hours per term to manual results processing,
**NexaForge is** a school operating system with an education programme network attached
**that** removes results-week pain, gives the school a professional public presence, and delivers skills programmes and competitions that give parents a concrete reason to choose it,
**unlike** Edves, Classnote or free bank-provided software, which automate administration and stop there,
**because** we operate a network of schools — with shared programmes, competitions and a common standard — not merely a database per school.

---

## 4. `[DECISION]` Copy changes to make immediately

Zero cost, meaningful conversion impact.

| # | Change | Rationale |
|---|---|---|
| 1 | **Lead with offline.** Replace the pill *"📱 Works on any phone or laptop"* with *"📶 Works when the network doesn't — scores save offline, sync later"* | Promotes the only genuinely hard-to-copy asset from invisible to headline |
| 2 | **Add an offline block to the Platform section** | This is the demo that closes principals: turn off wifi, type scores, turn it on, watch them sync |
| 3 | **Move Devices / Programmes / Government to a visibly-labelled roadmap** — "Rolling out 2026" with a waitlist CTA | Removes `[RISK]`, and a waitlist is a *demand measurement instrument* ([doc 11](./11-data-validation-plan.md)) |
| 4 | **Replace unverified stats** with true ones, or with qualitative proof | An honest "Now onboarding our first cohort of schools" outperforms a fake "20+" that a principal can disprove |
| 5 | **Rewrite the competitor FAQ** to stop conceding parity — pivot to offline + website + term billing, which are all true today | Never lose a comparison on ground you don't have to fight on |
| 6 | **Reconcile trial length** — copy says 14 days, cron enforces 30 `[CODE]` | Contradiction between promise and system behaviour |
| 7 | **Add the bursar's language** even before the module exists — "designed to sit alongside how you already collect fees" | Keeps the gatekeeper from becoming the blocker |

---

## 5. The one-line pitch, three lengths

**5 words:** *The operating system for African schools.*

**25 words:** *NexaForge runs your school — students, scores, report cards, website — and connects it to skills programmes and competitions that make parents choose you.*

**Elevator, 60 seconds:**
> *"Nigerian private schools all sell the same thing: help your child pass exams. So they compete on buildings and uniforms. We give a school two things. First, we end results week — teachers enter scores on their phones, offline if the network is down, and the principal prints the whole class in one afternoon. Second, and this is the part nobody else does, we plug that school into a network: coding and entrepreneurship programmes, inter-school competitions, scholarships. So when a parent asks 'why your school?', the principal has an answer that isn't about the fence. Fifteen thousand naira a term. Website included. Nothing charged in August."*

---

## 6. Where the value proposition is currently unsupported

Honest ledger. Anything in the right column is a promise you cannot yet keep.

| Marketing promise | Supported by code? | Gap |
|---|---|---|
| Student records & report cards | ✅ `[CODE]` | — |
| Branded public website | ✅ `[CODE]` | — |
| Pay per term, no August charges | ✅ `[CODE]` | — |
| Works on any phone/laptop | ✅ `[CODE]` | Understated — should be the offline claim |
| Your data, always yours (export) | ⚠️ Partial | **No verified export feature found.** Must build — it is an explicit FAQ commitment |
| Skill programmes & competitions | ❌ | Entire layer unbuilt |
| Scholarships | ❌ | Unbuilt |
| Educational devices | ❌ | Unbuilt, capital-intensive |
| Government deployments | ❌ | Unbuilt |
| Attendance tracking (Platform card) | ❌ Not found | Claimed in `SERVICE_CARDS` `[CODE]`; no attendance module located |
| "News / admissions" on school site | ⚠️ Partial | Gallery, about, contact exist; news/admissions unverified |

→ Full audit with severity ranking and remediation: [doc 02](./02-product-claims-audit.md)
