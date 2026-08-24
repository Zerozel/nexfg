# 02 — Product Claims Audit

> **Read this document before any sales activity.**
> It compares what the marketing site promises against what the repository actually
> contains. Several claims are contradicted by the code, in writing, by your own
> developer comments. Fixing this costs nothing and is the highest-ROI action in
> this entire folder.

**Why this matters more for a bootstrapped solo founder than for a funded company:**
a funded company survives a credibility hit with paid ads. You are relying on
**referrals within one cluster of schools** — and Nigerian private school
proprietors talk to each other constantly, through NAPPS meetings, WhatsApp groups
and shared teacher pools. One principal discovering that "track attendance" does
not exist will tell fifteen others. In a referral-driven model, **a credibility
failure is not a marketing problem, it is a distribution failure.**

---

## 1. Severity summary

| Severity | Count | Meaning |
|---|---:|---|
| 🔴 **Critical** | 4 | Directly contradicted by code, or legally exposed. Fix before next sales call. |
| 🟠 **High** | 5 | Materially overstated; will be discovered during evaluation or first term. |
| 🟡 **Medium** | 4 | Aspirational framing; fix at next copy revision. |
| 🟢 **Verified** | 8 | True and defensible. **Lean on these harder.** |

---

## 2. 🔴 Critical findings

### C1 — "Track attendance" is marketed but explicitly not implemented

**The claim** `[CODE]` — `SERVICE_CARDS`, `src/lib/marketing/constants.ts`:
> *"Student Management — Register students, **track attendance**, manage class assignments and guardian information — all in one place."*

**The reality** `[CODE]` — your own code comments:
```
src/app/api/report-cards/student/[id]/route.ts
  // The real `enrollments` table has no attendance columns; attendance is
  // not tracked yet, so return null and let the template omit it.
  attendance: null,

src/app/api/report-cards/class/[classId]/route.ts
  // `enrollments` has no attendance columns; not tracked yet.
  attendance: null,
```

Worse: `ReportCardTemplate.tsx` and `report-card.css` contain a **fully built
attendance section** (School Days / Days Present / Days Absent) that silently
renders nothing because the data is always `null`.

**Why this is critical.** Nigerian report cards conventionally carry attendance.
A principal will not discover this during a demo — they will discover it at the end
of term, when they are printing 400 report cards under time pressure and the
attendance block is blank. That is the single worst possible moment to lose trust,
and it happens to *every* school, in *every* term, until fixed.

**Remediation — pick one, this week:**
- **(a) Cheapest, ~0 hrs:** remove "track attendance" from the marketing copy.
- **(b) Recommended, ~6–10 hrs:** add `days_present` / `days_absent` / `total_days` columns to `enrollments`, plus one simple termly bulk-entry screen. Do **not** build daily register attendance — schools keep paper registers and only need the termly summary for the report card. The UI already exists; you only need the data.

> `[DECISION]` Do (b). It is small, it unblocks a report card that looks complete,
> and "attendance on the report card" is a feature every competitor has.

---

### C2 — "Your data. Always yours" — no export capability found

**The claim** `[CODE]` — FAQ + feature pill:
> *"Your data belongs to your school. You can **export all student records, results, and information at any time, in standard formats.** We do not hold your data hostage."*

**The reality** `[CODE]`: a repository-wide search for CSV/export functionality
returns **only import** paths — `enrollCsv`, `csvUploadSchema`,
`handleCsvUpload`, `bulkEnrollByAdmissionNumbers`. There is no export route, no
CSV/XLSX generation, no download handler.

**Why this is critical.** This is not a feature gap, it is an **unambiguous written
promise** ("at any time, in standard formats") that the system cannot honour. It
is also the exact promise most likely to be invoked at the worst moment: when a
school is leaving, angry, and may involve a lawyer or a WhatsApp group. And under
the **Nigeria Data Protection Act 2019/2023, data portability is a data-subject
right** `[VERIFY]` — so this is plausibly a compliance obligation, not just a
marketing claim.

**Remediation, ~8–12 hrs:** one authenticated admin route producing a ZIP of CSVs
(students, enrollments, scores, results). Not elegant — sufficient. It also
doubles as your own backup tool and as a **sales asset**: "here is the export
button, press it now" defeats the hostage-data objection instantly, which no
competitor demo does.

---

### C3 — Unsubstantiated traction and award claims

**The claims** `[CODE]` — `HERO_STATS`, `BAND_STATS`:

| Claim | Type | Exposure if untrue |
|---|---|---|
| "500+ Students Managed" | Quantified performance | Moderate |
| "20+ Active Schools" | Quantified performance | **High** — trivially disproved; a prospect will ask for two references |
| "3× Award Winner" | **Factual claim about a third party** | **Highest** — a specific, checkable assertion |
| "98% Setup Success Rate" | Fabricated-looking metric | Moderate — no plausible measurement method exists yet |

**Why this is critical.** Under the **FCCPA 2018**, misleading representations to
consumers are an offence, and the FCCPA covers services `[VERIFY]`. Beyond legal
exposure, the practical risk is sharper: your entire GTM is
**cluster-based referral** ([doc 06](./06-go-to-market.md)). "20+ active schools"
invites *"which ones? I'll call them."* If you cannot produce them, you have not
lost one deal — you have lost the cluster.

**Remediation, 1 hr:** replace with true statements. Honest early-stage framing
converts *better* with school owners, who are wary of slick vendors:

| Instead of | Use |
|---|---|
| "20+ Active Schools" | "Now onboarding our founding cohort" |
| "500+ Students Managed" | "Built for 50–800 student schools" |
| "3× Award Winner" | *Remove entirely* unless you can name the awards |
| "98% Setup Success Rate" | "Setup in under one working day" (a promise you control) |
| "₦0 August Charges" | ✅ **Keep** — this is a policy, and it is true `[CODE]` |

> **Founding-cohort framing is an asset, not a weakness.** "We're taking 10 schools
> this term and I will personally set yours up" is a *stronger* pitch than fake
> scale, because it promises founder attention — which you can actually deliver and
> which no incumbent can match.

---

### C4 — Trial length: marketing says 14 days, the system enforces 30

**The claim** `[CODE]`: `TRUST_BADGES` and pricing footer both say **"14-day free trial"**.

**The reality** `[CODE]` — `src/lib/cron/check-subscription.ts`:
```js
// End trial period (30 days after creation)
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)...
```

Also inconsistent: `PLAN_LIMITS.trial` allows 100 students / 10 staff, while
`PLAN_LIMITS.free` allows 50/5 — and the marketing never mentions a free tier at all.

**Why it matters.** Two directions of harm. If a school believes it has 14 days,
it may abandon before the real 30 elapse. And any contradiction between written
terms and system behaviour is the seed of a billing dispute.

**Remediation, 15 min** `[DECISION]`: make it **30 days everywhere**. It is more
generous, it is what the system already does, and — critically — 30 days
**spans a full assessment cycle**, so a school can experience one complete
CA-entry-to-report-card loop before paying. 14 days does not. The longer trial is
the better product decision *and* the cheaper fix.

---

## 3. 🟠 High-severity findings

### H1 — Three of four "Ecosystem" pillars do not exist
`ECOSYSTEM_CARDS` `[CODE]` presents Platform, **Devices**, **Programmes**,
**Government** as current infrastructure, and `PROGRAMME_CARDS` describes six
programmes in the present tense ("delivered directly in partner schools",
"distributed through the NexaForge network"). None are built. The Growth plan
even lists "NexaForge Programmes access" as a **paid feature** `[CODE]` — meaning a
school could pay ₦30,000 partly for something undeliverable. That edges from
overstatement toward misrepresentation.

**Fix:** add a visible `PLANNED — 2026` / `IN PILOT` label per card and change verbs
to future tense. Retain the vision; timestamp it. Add a waitlist CTA so the section
becomes a **demand-measurement instrument** ([doc 11](./11-data-validation-plan.md) M12).

### H2 — "Advanced analytics" (Growth) and "White-label reports" (Premium) not located
Both appear in `SUBSCRIPTION_PLANS` `[CODE]`. No analytics dashboard or white-label
template system was found. These are *paid* tier differentiators — a Premium school
can reasonably demand them. **Fix:** remove, or define minimally (e.g. white-label =
school logo + colours on the report card, which likely already works via school settings).

### H3 — Report-card fields exist in the template with no source of truth
`ReportCardTemplate` renders `affective_traits`, `principal_comment`,
`teacher_comment` `[CODE]`, but the transform defaults them to `null` / `[]`. If no
admin UI writes these, Nigerian report cards will print without the affective-domain
table and comments that principals expect. **Fix:** verify whether an entry UI exists;
if not, add comments to the termly bulk screen from C1 — same screen, same trip.

### H4 — "News and admissions" on the school website not verified
FAQ promises a site "with your logo, colours, contact details, gallery, news, and
admissions page" `[CODE]`. Located: Hero, About, Gallery, Contact, Pricing, Social,
YouTube. **Not located:** news/blog or admissions-application flow. **Fix:** align
copy to what exists (already impressive) rather than building more.

### H5 — 🔴/🟠 The migrations directory cannot build a working database
`supabase/migrations/` contains only three files — scores, academic_years,
subscriptions — and the subscriptions migration itself states that `schools` "is
created in an earlier (Section-1) migration" `[CODE]`. **That migration is not in the
repository.**

**Why this is a business risk, not merely a technical one.** Your production database
exists only as a live artefact that cannot be reconstructed from source. For a solo
founder this is an **existential single point of failure**: lose or corrupt that
project and there is no rebuild path, no staging environment, and no way to test a
migration before running it against live school data. It also makes the platform
effectively unsellable as an asset and un-handoverable to a future engineer.

**Fix, ~3–4 hrs, highest priority in this document alongside C3:** run
`supabase db dump` (or `pg_dump --schema-only`), commit the result as
`00000000000001_baseline.sql`, and verify a fresh local database can be built from
migrations alone. Then set up automated daily backups. Do this **before** onboarding
paying schools — because the moment real student records exist, data loss stops being
an inconvenience and becomes a reportable NDPA breach and a reputational end.

---

## 4. 🟡 Medium-severity findings

| ID | Claim | Issue | Fix |
|---|---|---|---|
| M1 | "Our team reaches out within 4 hours" (`STEPS`) vs "within 24 hours" (FAQ) `[CODE]` | Internal contradiction, and "our team" is one person | Standardise on **24 hours**; keep "team" (acceptable business convention) but never promise 4 hours as a solo operator |
| M2 | "Setup takes less than one working day" / "under 20 minutes" | Plausible for a small school, unlikely with 400 students and no bulk student import | Qualify: "under 20 minutes to configure; student records same day with our help" — and **offer to do the import yourself**, it is your best onboarding lever |
| M3 | "Pay per session and save one term's cost" | This is a **33% discount** — see [doc 04](./04-business-model.md) §5. Very likely unaffordable | Reduce to ~12%, or reframe as bundled programme credit |
| M4 | "Custom domain support" (Premium) `[CODE]` | Not verified; needs DNS + TLS automation | Confirm before selling Premium, or handle manually at low volume (fine at <10 Premium schools) |

---

## 5. 🟢 Verified — claims you can defend, and should push harder

These survived audit. **Most are under-marketed.**

| Claim | Evidence | Note |
|---|---|---|
| Offline score entry + reliable sync | `src/lib/sync/orchestrator.ts` — batching, exponential backoff, per-record error attribution, abort support | **Your strongest asset and it is absent from the marketing site.** Promote to hero. |
| Teachers enter scores from phones | Score matrix + offline cache + `useOnlineStatus` | True |
| Automatic A1–F9 Nigerian grading | Grading utilities + compiled results | True and locally correct |
| Print one student or a whole class | `BatchPrintModal`, `ClassResultSheet`, `print.css` | True; genuinely valuable |
| Branded public website at `slug.nexaforges.me` | `src/app/school/[slug]/` + public components | True |
| Per-term billing, no monthly charges | `PLAN_TERM_DAYS = 120`, Paystack integration | True |
| **No August charges** | Consequence of term billing | True, and excellent positioning |
| Role-scoped permissions | `src/config/roles.ts`, RLS policies on JWT `school_id` | True — real tenant isolation |

---

## 6. Remediation plan — ordered by (impact ÷ effort)

All items are founder-time only. **Total: ~30–40 hours to make every public claim true.**

| Order | Action | Effort | Why first |
|---:|---|---|---|
| 1 | Commit a baseline DB migration + enable daily backups (**H5**) | 3–4 h | Prevents unrecoverable loss of paying customers' data |
| 2 | Rewrite unverifiable stats + award claim (**C3**) | 1 h | Free; removes legal exposure; protects the referral cluster |
| 3 | Unify trial to 30 days (**C4**) | 15 m | Free; removes contradiction; better product decision |
| 4 | Label Devices/Programmes/Government as roadmap + add waitlist (**H1**) | 2 h | Removes the largest misrepresentation; creates a demand signal |
| 5 | Remove or scope "attendance", "advanced analytics", "white-label" (**C1a, H2**) | 1 h | Free honesty |
| 6 | Build data export (ZIP of CSVs) (**C2**) | 8–12 h | Honours a written promise; becomes a sales weapon; NDPA alignment |
| 7 | Termly attendance + comments entry screen (**C1b, H3**) | 8–12 h | Makes the report card complete — the thing schools actually buy |
| 8 | Rewrite hero/platform copy to lead with offline (**§5**) | 3 h | Converts the hidden moat into the sales message |
| 9 | Fix session discount to ~12% (**M3**) | 30 m | Protects a third of revenue |

> **Sequencing logic:** items 1–5 are nearly free and remove risk, so they precede
> all feature work. Item 6 before 7 because a promise already made in writing
> outranks a feature gap. Item 8 last among the quick wins only because it should
> reflect the now-honest product.

---

## 7. Standing rule

> **Nothing goes on the marketing site in the present tense until it exists in the
> repository.** Roadmap items are welcome — labelled, dated, and honest.

For a bootstrapped founder selling into a tight-knit referral network, credibility
is not a brand value. It is your only distribution channel, and it is
**non-renewable**: you can recover from a bug, but not from being the vendor who
overpromised. Every audit item above is cheap now and expensive later.
