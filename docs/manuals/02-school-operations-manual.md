# NexaForge — School Operations Manual

**For school administrators, principals and teachers**
Version 1.0 · 24 August 2026

> Welcome. This manual covers everything your school needs to run a full term on
> NexaForge — from setting up your classes to printing report cards.
>
> **If you read only one page, read [Part 3: The Setup Order](#part-3--the-setup-order).**
> Almost every problem schools run into is a step from that list being skipped.

**Need help?** WhatsApp `[FILL: support WhatsApp number]` · Email `[FILL: support email]`
Support hours: 8am–8pm, Monday–Saturday. See [our SLA](../legal/service-level-agreement.md) for response times.

---

## Contents

- [Part 1 — Getting started](#part-1--getting-started)
- [Part 2 — Who does what (roles)](#part-2--who-does-what-roles)
- [Part 3 — The setup order](#part-3--the-setup-order) 🔴
- [Part 4 — Students and enrollment](#part-4--students-and-enrollment)
- [Part 5 — Staff accounts and assignments](#part-5--staff-accounts-and-assignments)
- [Part 6 — Assessments and grading](#part-6--assessments-and-grading)
- [Part 7 — Entering scores (including offline)](#part-7--entering-scores-including-offline) 🔴
- [Part 8 — Report cards and printing](#part-8--report-cards-and-printing)
- [Part 9 — Your school website](#part-9--your-school-website)
- [Part 10 — Billing and subscription](#part-10--billing-and-subscription)
- [Part 11 — Starting a new term or session](#part-11--starting-a-new-term-or-session)
- [Part 12 — When something goes wrong](#part-12--when-something-goes-wrong)
- [Part 13 — What NexaForge does not do yet](#part-13--what-nexaforge-does-not-do-yet)
- [Part 14 — Your data and your rights](#part-14--your-data-and-your-rights)
- [Part 15 — The termly rhythm](#part-15--the-termly-rhythm)

---

## Part 1 — Getting started

### Logging in

1. Go to **`https://nexaforges.me/login`**
2. Enter the email and password we gave you
3. You will land on your dashboard

> 🔴 **Change your password immediately after your first login, and keep it
> safe.** We cannot see your password. If you lose it, recovery requires
> contacting us and waiting — so store it somewhere you trust.

### What you can reach

| Section | What it is for |
|---|---|
| Dashboard | Overview of your school |
| Students | Student records |
| Teachers | Staff accounts |
| Classes | Your classes and arms |
| Subjects | Your subject list |
| Assessments | CA1, CA2, Exams and their weights |
| Enrollments | Placing students in classes each term |
| Teacher Assignments | Which teacher teaches which subject in which class |
| School Website | Your public site |
| Billing | Your plan and payments |
| School Settings | Logo, colours, address, motto, signature |

### Which device to use

| Task | Best device |
|---|---|
| Setting up the school, importing students | **Laptop** |
| Entering scores | Phone or laptop — both work well |
| **Printing report cards** | 🔴 **Laptop with Chrome.** Phone printing is unreliable. |

---

## Part 2 — Who does what (roles)

| Role | Can do | Cannot do |
|---|---|---|
| **Admin** | Everything for your school: students, staff, classes, subjects, assessments, website, billing | Nothing outside your school |
| **Principal** | The same as Admin | — |
| **Teacher** | Enter scores for classes/subjects assigned to them; print report cards for those classes | See other teachers' classes; manage students, staff or billing |

**Two things worth knowing:**

1. **Admin and Principal accounts have the same powers.** Both can edit and
   delete. If you want only one person doing data entry, give only that person an
   admin account.
2. **A teacher sees a class only after they are assigned to it in the system.**
   Telling a teacher verbally that they teach JSS2 Maths is not enough — see
   [Part 5](#part-5--staff-accounts-and-assignments). This is the single most
   common "it's not working" report, and it is a two-minute fix.

> **Only Admin and Principal accounts can access Billing.** A teacher trying to
> pay will be blocked by design.

---

## Part 3 — The setup order

🔴 **This is the most important page in this manual.** Each step depends on the
ones above it. If something isn't appearing where you expect, come back here and
check each step in order.

```
1  Academic Session (e.g. 2026/2027)     — we create the first one for you
2  Terms (First, Second, Third)
3  Classes (JSS1A, JSS1B, Primary 4 …)
4  Subjects (Mathematics, English …)
5  Link subjects to each class
6  Students (their personal records)
7  Enroll students into a class FOR THIS TERM   ← most commonly missed
8  Teacher accounts
9  Assign teachers to class + subject
10 Assessments (CA1, CA2, Exam with weights)
11 Teachers enter scores
12 Print report cards
```

### The quick diagnosis table

| What you're seeing | Which step to check |
|---|---|
| A teacher says they have no classes | Step 9 — teacher assignment |
| A class shows no students when entering scores | **Step 7 — enrollment for the current term** |
| There is nowhere to type scores | Step 10 — no assessment exists yet |
| A subject is missing from a class | Step 5 — subject not linked to that class |
| A report card is missing subjects | Steps 11 and 12 — scores not entered or not synced |
| Report card totals look wrong | Step 10 — check your assessment weights |

> **Steps 6 and 7 are different things, and this catches nearly everyone.**
> Creating a student adds them to your school register. **Enrolling** them puts
> them in a class for a specific term. New students need *both*.

---

## Part 4 — Students and enrollment

### Adding students

**Students → Add Student.** Give each student a unique **admission number** — you
will use it constantly, especially for bulk enrollment.

### Enrolling students into a class

**Enrollments → select class and term**, then choose one of:

| Method | Best for |
|---|---|
| One at a time | A single new student mid-term |
| Select many | Normal class setup |
| **Paste a list of admission numbers** | 🔴 **Fastest way to set up a whole class** |

The third option is the one to use at the start of a session. You can paste the
admission numbers straight from your existing register.

> **Bulk enrollment reports successes and failures separately.** If you enroll 40
> students and see "38 enrolled, 2 failed", the two failures are almost always a
> mistyped admission number or a student who hasn't been created yet. Fix those
> two and run it again — the 38 are already done and will not be duplicated.

### Removing a student

Deleting a student **hides** them rather than erasing them, so past results stay
intact. Tell us if you need a student permanently erased — see
[Part 14](#part-14--your-data-and-your-rights).

> A student who has left mid-session should simply not be enrolled for the next
> term. Do not delete them, or you lose their history.

---

## Part 5 — Staff accounts and assignments

### Creating a teacher

**Teachers → Add Teacher.** Enter their name and email, and a password is created
for the account.

> 🔴 **Give the teacher their password immediately and confirm they can log in
> that day.** Password recovery currently requires contacting us, so an untested
> account can quietly become a problem weeks later.

### Assigning teachers — the step that matters

**Teacher Assignments → choose teacher, class and subject.**

A teacher can only see and enter scores for a class if they are **either**:
- assigned to a subject in that class, **or**
- set as that class's form teacher

Until then, their dashboard will be empty. This is not a fault — it is how access
control keeps each teacher to their own classes.

**Do this for every teacher before the term's first assessment.** It is the
difference between "the app doesn't work" and a term that runs smoothly.

---

## Part 6 — Assessments and grading

### Creating assessments

**Assessments → Add Assessment**, for each class + subject + term:

| Field | Meaning |
|---|---|
| Name | e.g. "CA1", "Mid-term Test", "Third Term Exam" |
| Type | Exam, Test or Quiz |
| Max score | The score it is marked out of |
| **Weight** | Its share of the final total, between 0 and 1 |
| Date | Optional |

### 🔴 Weights must add up to 1.00

A typical Nigerian scheme:

| Assessment | Max score | Weight |
|---|---:|---:|
| CA1 | 20 | 0.20 |
| CA2 | 20 | 0.20 |
| Exam | 100 | 0.60 |
| **Total** | | **1.00** |

**The system does not currently check this for you.** If your weights add up to
0.80, every student's total will be 20% lower than it should be — and it will look
believable enough that nobody notices until a parent recalculates.

> **Check the sum once, per subject, at the start of term.** It takes five minutes
> and prevents the single most damaging error possible on a report card. If you
> would like us to review your assessment setup before exams, ask — we would much
> rather check it in week 3 than correct 400 report cards in week 13.

### Grading

Grades are calculated automatically on the Nigerian **A1–F9** scale:

| Grade | Score | Remark |
|---|---|---|
| A1 | 80–100 | Excellent |
| B2 | 75–79 | Very Good |
| B3 | 70–74 | Very Good |
| C4–C6 | 50–69 | Credit |
| D7 | 50–54 | Pass |
| E8 | 45–49 | Pass |
| F9 | 0–44 | Fail |

If your school uses a different scale, tell us and we will configure it.

---

## Part 7 — Entering scores (including offline)

This is what NexaForge does best. **Teachers can enter scores with no internet
connection at all** — on a phone, in a staff room with no data, during a power cut.

### How a teacher enters scores

1. Log in at `https://nexaforges.me/login`
2. **My Classes** → pick a class
3. **Enter Scores** → choose the subject and assessment
4. Type each student's score
5. Every score is saved to the phone or laptop **instantly**, online or not
6. When there is internet, press **Sync**

### 🔴 The one rule every teacher must know

> **Scores you have entered but not synced exist only on that one phone or
> laptop. They are not yet with us. Get online and press Sync until the pending
> count reads zero.**

Until a score is synced it is **not** on our servers, which means it is **not**
backed up and **cannot** be recovered by us.

**Unsynced scores are permanently lost if the teacher:**

| Action | Result |
|---|---|
| Clears browsing data / "clears cache" | 🔴 All unsynced scores gone |
| Used private / incognito mode | 🔴 Gone when the window closes |
| Uses a phone "cleaner" or booster app | 🔴 Gone |
| Resets or changes phone | 🔴 Gone |
| Logs in on a different device expecting their work | Not there — it stayed on the first device |

**Safe:** closing the browser, restarting the phone, running out of battery,
losing signal mid-entry, logging out and back in. None of these lose data.

### The habit that prevents every score-loss incident

> **End of each marking day: get online, press Sync, confirm the pending count is
> zero. Then it is safe.**

Print this rule and put it in the staff room. A school that follows it has never
lost a mark.

### What the sync screen tells you

| Indicator | Meaning |
|---|---|
| Pending count | Scores on this device not yet sent to us. **Target: 0** |
| Sync progress | Large classes are sent in batches — let it finish |
| "X failed" | Some scores did not save. They are **still on the device** — see below |

### If sync fails

Sync retries automatically three times before reporting failure. If it still
fails:

| Message | What to do |
|---|---|
| Session expired / Unauthorized | Log out, log back in, press Sync again. **Your scores are safe.** |
| A specific student's score failed | That student may have been removed from the class. Contact your admin. |
| It keeps failing on good internet | 🔴 **Do not clear your browser.** Contact us — your scores are still on the device and we will help you recover them. |

> The worst thing a teacher can do after a failed sync is "clear the cache to fix
> it". That deletes exactly the data we are trying to save. Tell your staff this
> explicitly.

---

## Part 8 — Report cards and printing

### Printing

| To print | Go to |
|---|---|
| One student | Report Cards → Student → select → Print |
| A whole class broadsheet | Report Cards → Class → select class → Print |
| Every card in a class | Report Cards → Batch → select class → Print |

### 🔴 Always print one card first

Before printing 400 report cards:

1. Print **one** card
2. Check the school name, logo, subjects, scores, total, grade and position
3. Only then print the rest

This one habit prevents almost every printing disaster.

### Getting the print settings right

| Setting | Value |
|---|---|
| Browser | **Chrome on a laptop** |
| Paper | A4 |
| Margins | Default |
| **Background graphics** | 🔴 **On** — otherwise grade colours disappear |
| Scale | 100% |

Print in batches of about 40 cards. Very large jobs can overwhelm older laptops.

### If a report card is empty or missing subjects

Work through this in order:

1. Have the teachers **synced**? Unsynced scores are not on our servers, so they
   cannot appear on a report card. (Part 7)
2. Is the student **enrolled** for this term? (Part 4)
3. Do **assessments** exist for those subjects? (Part 6)
4. Are you looking at the correct **term**?

If all four are correct and the card is still empty, contact us — do not reprint
repeatedly, and please send the class name and term so we can look directly.

### What is blank on report cards today

Please read this before your first results week:

| Section | Status |
|---|---|
| **Attendance** (days present / absent) | **Not yet available.** The space is on the card; write it in by hand, or ask us for a version without it. |
| Affective traits (neatness, punctuality…) | Not yet available |
| Teacher and principal comments | Not yet available |

> We would rather tell you this in week 1 than have you discover it in week 13.
> These are on our roadmap; ask us for current timing.

---

## Part 9 — Your school website

Your school has a public website at **`https://{your-school}.nexaforges.me`**,
included in every plan.

**School Website** in your dashboard lets you edit:

| Section | Contents |
|---|---|
| Hero | Main headline and subtitle |
| About | Your mission and vision |
| Gallery | Photos and YouTube videos |
| Contact | Email, phone, address, contact form |
| Pricing | Your school fees, if you wish to publish them |
| Social links | Facebook, Twitter/X, Instagram |
| Theme | Your primary colour and font |

**School Settings** controls your logo, motto, address and the principal's
signature — these appear on both the website **and** your report cards, so upload
a good-quality logo once and it is used everywhere.

Messages from the contact form are sent to the contact email you set. **Check that
email regularly** — parent enquiries arrive there.

**Not yet available:** a news/blog section and online admission applications.
**Custom domains** (e.g. `www.yourschool.com`) are available on the Premium plan;
allow 2–3 working days for DNS setup.

---

## Part 10 — Billing and subscription

### Plans

| Plan | Per term | Students | Staff |
|---|---:|---|---|
| Starter | ₦15,000 | Up to 200 | Up to 10 |
| Growth | ₦30,000 | Up to 500 | Up to 30 |
| Premium | ₦60,000 | Unlimited | Unlimited |

**You are billed per term, not per month — and there are no August charges.**
A paid term runs for **120 days** from the date payment is received.

### Paying

**Billing → choose your plan → pay via Paystack** (card or bank transfer). Your
subscription activates automatically once payment confirms.

### 🔴 Two important billing facts

**1. Do not pay early.** Your 120 days start on the **day you pay**, not when your
current term ends. Paying two weeks early costs you two weeks. Pay when your term
is ending, or just after.

**2. If payment succeeds but your account is not activated within 30 minutes,**
contact us with your payment reference (it starts with `nexa-`). Do not pay twice.
We will confirm with Paystack and activate you manually.

### Payment history

**Billing → Payment History** shows every transaction, its reference and status.
Use this for your records at audit time.

### Cancelling

You may cancel any time from Billing. **You keep access until the end of the term
you have already paid for.** We do not offer partial refunds for an unused part of
a term — see the [Terms & Conditions](../legal/terms-and-conditions.md).

> When you cancel, we will confirm in writing: the date your access ends, and that
> nothing further will be charged. If you do not receive that message, contact us.

---

## Part 11 — Starting a new term or session

### New term (same session)

1. Confirm the new term exists
2. **Enroll students into their classes for the new term** — enrollment is per
   term, so this must be done every term
3. Create the new term's assessments
4. Confirm your subscription covers the term

### New session (e.g. 2026/2027 → 2027/2028)

1. Create the new Academic Session and mark it as current
2. Create its three terms
3. Create or verify classes for the new session
4. **Enroll every student into their new class**

> 🔴 **Students are not promoted automatically.** Nothing moves JSS1A students
> into JSS2A — you must enroll them into their new class.
>
> **We will do this for you.** Send us your class-by-class promotion list before
> the session starts and we will complete it in minutes rather than days. Ask
> early — September is busy for every school at once.

---

## Part 12 — When something goes wrong

### Try these first — they solve most issues

| Problem | First try |
|---|---|
| A page won't load | Refresh; check your internet |
| Something looks stale or wrong | Log out and log back in |
| A teacher can't see their class | Check their Teacher Assignment (Part 5) |
| No students in the score sheet | Check enrollment for this term (Part 4) |
| Nowhere to enter scores | Create the assessment (Part 6) |
| Printing looks wrong | Use Chrome on a laptop, enable background graphics (Part 8) |

### 🔴 Never do these

| Don't | Why |
|---|---|
| **Clear your browser data while scores are unsynced** | Permanently deletes those scores |
| Enter scores in private/incognito mode | Lost when the window closes |
| Delete a student to "fix" something | You lose their academic history |
| Pay twice when a payment seems stuck | Contact us instead — we will trace it |
| Share one login between several teachers | Nobody can tell who entered what, and access breaks |

### Contacting us

**WhatsApp is fastest:** `[FILL: support WhatsApp number]`

To get help quickly, send:
1. Your school name
2. What you were trying to do
3. What happened instead
4. A screenshot
5. Class, subject and term if it relates to scores or report cards

| Channel | Response time |
|---|---|
| WhatsApp | Within 4 hours (8am–8pm, Mon–Sat) |
| Email | Within 24 hours |
| **Exam/results week** | Within 2 hours — we prioritise results week above everything |

Full commitments: [Service Level Agreement](../legal/service-level-agreement.md).

---

## Part 13 — What NexaForge does not do yet

We would rather you know now than find out in week 13.

| Not yet available | What to do instead | Status |
|---|---|---|
| **Attendance tracking** | Keep your paper register; write attendance on the card by hand | Planned |
| **Report card comments / affective traits** | Write by hand | Planned |
| **Self-service password reset** | Contact us — we reset it for you, usually same day | Planned |
| **Automatic student promotion** | We will run your promotion list for you (Part 11) | Planned |
| **Self-service data export** | Request it; we deliver your data in CSV within 7 days | Planned |
| **Fee / payment tracking for school fees** | Not part of the platform | Under consideration |
| Parent logins / parent portal | Report cards are printed and given to parents | Not planned this session |
| SMS / email alerts to parents | — | Not planned this session |
| News section / online admissions on your website | Use the Gallery and Contact sections | Planned |
| Automatic weight validation | Check manually (Part 6) | Planned |

**Ask us for current timing on anything marked Planned.** We only give dates we
intend to keep.

---

## Part 14 — Your data and your rights

### Your data belongs to your school

We hold student records **on your behalf**. You decide what goes in, and you may
have it back or have it deleted.

| Your right | How to use it |
|---|---|
| **Get a copy of your data** | Ask us. We provide CSV files of students, enrollments, scores and results **within 7 working days** at no cost. |
| **Correct anything wrong** | Edit it yourself, or ask us |
| **Delete a student permanently** | Ask us in writing. Deleting in the dashboard only hides the record; permanent erasure is done by us. |
| **Take your data and leave** | Request an export before you close your account, and we will provide it |

We do **not** sell your data, and we do **not** show advertising. Full detail:
[Privacy Policy](../legal/privacy-policy.md).

### What your school is responsible for

Because you control the records, a few duties sit with you:

- Tell parents that your school uses NexaForge to process student records
- Only enter information you actually need
- Give each staff member their **own** account — never share logins
- Remove staff accounts promptly when someone leaves
- Keep your own copy of critical records (we back up daily, but a school should never depend on a single system)

### If data is ever lost or exposed

We back up daily. If we ever suffer a breach affecting your data, **we will tell
you within 72 hours** with what happened, what was affected, and what we are doing
about it. See the [Data Processing Addendum](../legal/data-processing-addendum.md).

---

## Part 15 — The termly rhythm

Schools that follow this rhythm rarely have an emergency in results week.

| When | What to do |
|---|---|
| **Before term starts** | Confirm session and term · create/verify classes · **enroll all students** · confirm subscription is active |
| **Week 1–2** | Create teacher accounts · assign teachers · create assessments · check weights sum to 1.00 |
| **Week 3–6** | Teachers enter CA scores as they mark. **Sync weekly.** |
| **Week 7–8** | Spot-check: is every teacher entering and syncing? |
| **Week 10–11** | 🔴 **Pre-exam check** (below) |
| **Week 12–13** | Exams · enter and sync exam scores · print report cards |
| **Week 14** | Distribute report cards · renew for next term |

### 🔴 The pre-exam check (do this in week 11 — it takes 30 minutes)

- [ ] Every teacher's pending sync count is **zero**
- [ ] Every class+subject has its assessments created
- [ ] Assessment weights add up to 1.00
- [ ] Every student is enrolled for **this** term
- [ ] Subscription is active and not expiring during exams
- [ ] **Print one test report card and look at it carefully**

That last item is the most valuable thing in this manual. Finding a problem in
week 11 costs ten minutes. Finding the same problem in week 13, with parents
waiting, costs your whole week.

---

## Quick reference — pin this in the staff room

| Situation | Do this |
|---|---|
| Forgot password | WhatsApp us — we reset it, usually same day |
| Teacher can't see their class | Admin: add a Teacher Assignment |
| No students in the score sheet | Admin: enroll students for this term |
| Nowhere to enter scores | Admin: create the assessment |
| **Finished marking for the day** | 🔴 **Go online and Sync until pending = 0** |
| Sync keeps failing | 🔴 **Do not clear your browser.** Contact us. |
| Report card blank | Check sync → enrollment → assessments → term |
| Paid but not activated | Send us the `nexa-` reference. **Do not pay twice.** |
| Need your data | Ask us — CSV within 7 working days |

**Support:** `[FILL: support WhatsApp number]` · 8am–8pm, Mon–Sat

---

## Related documents

- [Terms & Conditions](../legal/terms-and-conditions.md)
- [Privacy Policy](../legal/privacy-policy.md)
- [Data Processing Addendum](../legal/data-processing-addendum.md)
- [Service Level Agreement](../legal/service-level-agreement.md)

---

*NexaForge · Version 1.0 · 24 August 2026*
*We update this manual as the platform grows. Tell us what is unclear or missing —
your questions are how it improves.*

