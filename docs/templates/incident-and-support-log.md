# Incident & Support Log

> 🔴 **Log every ticket. This is the file that turns support from an endless
> treadmill into a shrinking one.**
>
> **The rule: any issue logged 3 times becomes a permanent fix** — a code change, a
> manual update, or a training video. That rule is the whole mechanism by which
> founder-hours per school fall from ~40 to ~8 (`business/08` §7).

---

## How to log fast (30 seconds per ticket)

One row. Don't write an essay. The fields exist so the monthly review is possible.

| Field | Note |
|---|---|
| **RB#** | The runbook entry used ([`../manuals/03`](../manuals/03-troubleshooting-runbook.md)). Write `NEW` if it isn't there — then **add it**. |
| **P** | P1 / P2 / P3 / P4 |
| **Mins** | Your actual time. Be honest; this number decides what you build next. |
| **Fix?** | `Y` if this should become a permanent fix |

---

## Active log

| Date | School | Reported by | Issue (their words) | RB# | P | Resolution | Mins | Fix? |
|---|---|---|---|---|---|---|---:|---|
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |

---

## Recurrence tracker

Increment the count each time. **At 3, schedule the fix.**

| Issue | RB# | Count | Trigger reached? | Permanent fix | Status |
|---|---|---:|---|---|---|
| Password reset requests | RB-1 | 0 | | Build self-service reset (`GAP-1`) | Not started |
| Teacher sees no classes | RB-2 | 0 | | Empty-state message: "Ask your admin to assign you" | Not started |
| Class empty at score entry | RB-5 | 0 | | Warn admin when a class has 0 enrollments for current term | Not started |
| Weights don't sum to 1.00 | RB-6/8 | 0 | | Validate on save (`GAP-10`) | Not started |
| Unsynced scores lost | RB-10 | 0 | | Server-side draft saves (`GAP-7`) | Not started |
| Report cards blank | RB-15 | 0 | | Verify/repair compilation (`GAP-6`) | Not started |
| Paid but not activated | RB-20 | 0 | | Fix webhook + add reconciliation job (`GAP-9`) | Not started |
| Attendance expectation | RB-16 | 0 | | Build attendance, or remove the block from the card (`GAP-4`) | Not started |
| Data export requests | RB-33 | 0 | | Self-service CSV export (`GAP-3`) | Not started |
| Promotion / new session help | RB — | 0 | | Bulk promotion tool (`GAP-5`) | Not started |

> The `GAP-` codes match [`../manuals/01` §12](../manuals/01-admin-operations-manual.md#12-known-gaps-and-the-workarounds-that-cover-them).
> **Let this table choose your engineering priorities, not your intuition.** What
> schools actually contact you about beats what you assume they need.

---

## P1 incident report

> Complete one per P1. Also send a short version to affected schools within 3
> working days — [SLA §5](../legal/service-level-agreement.md).

**Incident:** `INC-____`   **Date:** ______   **Duration:** ______

| | |
|---|---|
| **What happened** | |
| **Schools affected** | |
| **When detected / how** | |
| **Detected by us, or reported?** | 🔴 *If reported by a school, your monitoring failed too* |
| **Root cause** | |
| **Immediate fix** | |
| **Data lost?** | 🔴 **If yes — what, and was the school told?** |
| **Schools notified at** | |
| **Permanent prevention** | |
| **Prevention shipped on** | |

### Post-incident questions — answer honestly

1. Could monitoring have caught this before a school did?
2. Was it caused by a change made in the last 7 days?
3. Was it caused by a change made during a results period? *(If yes — that is a process failure, not a technical one.)*
4. Is the runbook entry now accurate enough for a future assistant to handle it?

---

## Data breach report

> 🔴 Use for any suspected unauthorised access, including one school seeing
> another's data. **72-hour notification clock starts at awareness** —
> [DPA §8](../legal/data-processing-addendum.md).

**Breach:** `BR-____`   **Aware at (date/time):** ______

| | |
|---|---|
| What happened | |
| Data categories involved | |
| Approx. records / individuals | |
| Schools affected | |
| Children's data involved? | 🔴 |
| Contained at | |
| **Schools notified at** | 🔴 **must be within 72h** |
| NDPC notified? | Yes / No / Not required — reason: |
| Individuals notified? | Via the school: Yes / No |
| Root cause | |
| Prevention | |

---

## Monthly review

> **First Monday of each month, 30 minutes.** Non-negotiable. This is where the
> log earns its keep.

**Month:** ______

| Metric | This month | Last month |
|---|---|---|
| Total tickets | | |
| P1 count | | |
| Total support minutes | | |
| **Support minutes ÷ active schools** | | |
| Top 3 recurring issues | | |
| Issues that hit the 3× trigger | | |
| Fixes shipped from the tracker | | |
| SLA breaches | | |
| Credits issued | | |

### The three questions

1. **Is support-minutes-per-school falling?** If not, you are scaling headcount-per-school, which does not work with one head. Fix the top recurring issue before onboarding another school.
2. **What did I build this month that no ticket asked for?** Be suspicious of it.
3. **Which school hasn't contacted me at all?** 🔴 Silence is usually disengagement, not satisfaction. Call them.

**Decisions for next month:**
1.
2.
3.

---

## Termly review

**Term:** ______

| | |
|---|---|
| Schools active at start / end | ___ / ___ |
| Renewals / churn | ___ / ___ |
| **Churn reasons (real ones)** | |
| Report cards printed | |
| Results-week P1s | |
| **Did every school get results out on time?** | 🔴 |
| Referrals generated | |
| Avg. founder-hours per school | |

> 🔴 **"Did every school get results out on time?"** is the only metric that
> genuinely predicts renewal. A school that printed its report cards without drama
> renews. One that didn't will not, whatever else the numbers say.

---

*Keep this file in version control. It is the company's institutional memory, and
the document your first hire will be trained from.*
