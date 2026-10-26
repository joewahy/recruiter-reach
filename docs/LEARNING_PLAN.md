# Six learning milestones

Scope: gradually complete the demo experience, then add a persistent foundation. Real data providers and live mail remain a later, separately discussed phase. These six milestones replace the broad delivery grouping in AGENTS.md for the learning project; they do not remove its product requirements.

Only the minimal starter is implemented. No later milestone is marked complete.

**Suggested task split:** A = @lakerss6 (you), B = @joewahy (your friend), using the supplied username order. Both collaborators are beginners. Publishing and assigning all 12 issues on `joewahy/recruiter-reach` is authorized; authenticated GitHub access is still needed, so assignments currently remain local. Alternate implementation/review duties so neither person is confined to frontend or backend. Milestones are practice sessions, not a six-week commitment.

| Milestone | Outcome | @lakerss6 (A) | @joewahy (B) | Suggested effort each |
| --- | --- | --- | --- | --- |
| 1. Foundation | Both can run, explain, and extend the starter | RR-01: page/component boundary | RR-02: fixtures and types | 1–2 sessions |
| 2. Search | Search and composable filters with URL state | RR-03: text search | RR-04: role/location filters | 2–3 sessions |
| 3. Save and enrich | Simulated lookup, saved lists, reload persistence | RR-06: lists and local storage | RR-05: demo lookup API | 2–3 sessions |
| 4. Opportunities | Connect contacts to jobs and exchange data | RR-07: opportunities | RR-08: notes and safe CSV export | 2–3 sessions |
| 5. Outreach demo | Compose messages and approve each simulated send | RR-10: approval/simulation service | RR-09: composer | 3–4 sessions |
| 6. Follow-ups and persistence | Due drafts, stop rules, then a persistence slice | RR-11: sequence domain rules | RR-12: PostgreSQL/auth design and first slice | 3–5 sessions |

One session can be roughly 60–90 focused minutes; adjust to your schedules. Both developers are beginners: treat these estimates as rough planning only and take as many sessions as needed. RR-12 is intentionally gated: agree on auth and database setup before building it. If milestone 6 grows, split RR-12 into smaller child issues rather than rushing it.

## Beginner working method

Start only RR-01 and RR-02 now. Read the issue together, then work on one acceptance criterion at a time. A checkbox is done when you can demonstrate it, not merely when the code compiles.

1. Read the starting files and explain their current behavior out loud.
2. Make one small change. Run the app and inspect the result.
3. Run typecheck; read the first error before changing more code.
4. Ask your partner to review and explain the change back to you.
5. Write one learning note and commit a small, working step.

Use the guided first steps in each issue. Ask an agent for an explanation or a hint first; ask for a full implementation only when you deliberately want to hand off that task. You do not need to understand authentication, database migrations, or job queues to begin.

Vocabulary: a **component** renders part of the UI; **props** are inputs to a component; **state** is changing application data; a **type** describes a value's expected shape; an **API endpoint** handles a network request; **persistence** keeps data after a reload or restart; a **migration** changes database structure; **authentication** identifies the user, while **authorization** decides what that user can access; **idempotency** means retrying an operation does not repeat its effect.

## Gates and dependencies

1. Both developers run the starter from a clean dependency install and explain the data-to-UI flow. Review each other's first change.
2. RR-03 establishes the search component boundary. RR-04 builds on it; avoid simultaneous edits to the same module. Test combined filters, no results, and shared URLs.
3. Agree on lookup response shapes before RR-05/RR-06. Email fixtures stay server-only; only an explicit simulated lookup reveals an address. Local storage is for synthetic personal-demo state, not production authorization.
4. Agree on contact and opportunity IDs before RR-07/RR-08. Lists, job statuses, and message statuses remain separate. Never export unrevealed addresses.
5. Define an immutable message snapshot together. RR-09 prepares it; RR-10 approves and simulates delivery. Every email needs approval, and edits invalidate it.
6. RR-11 builds on message rules, including reply/bounce/manual-stop checks. Finish a complete synthetic demo first. RR-12 then introduces one authenticated persistence slice, tested for workspace isolation; no public deployment until that boundary is enforced.

At every gate: author demos acceptance criteria, reviewer reproduces one edge case, both record a short learning note. Types/build passing is necessary but does not demonstrate product behavior.

## Issue index

RR numbers are local planning IDs, not GitHub issue numbers. Files in `docs/issues/` are complete issue bodies with owners, dependencies, acceptance criteria, learning goals, and debugging prompts. Publish them only once and record GitHub URLs here after creation.

| Local ID | Draft | Status |
| --- | --- | --- |
| RR-01 | [Component boundary](issues/RR-01.md) | Open draft |
| RR-02 | [Fixtures and types](issues/RR-02.md) | Open draft |
| RR-03 | [Text search](issues/RR-03.md) | Open draft |
| RR-04 | [Filters and URL state](issues/RR-04.md) | Open draft |
| RR-05 | [Demo lookup](issues/RR-05.md) | Open draft |
| RR-06 | [Saved lists](issues/RR-06.md) | Open draft |
| RR-07 | [Opportunities](issues/RR-07.md) | Open draft |
| RR-08 | [Notes and export](issues/RR-08.md) | Open draft |
| RR-09 | [Composer](issues/RR-09.md) | Open draft |
| RR-10 | [Approval and simulated send](issues/RR-10.md) | Open draft |
| RR-11 | [Follow-ups and stop rules](issues/RR-11.md) | Open draft |
| RR-12 | [Authenticated persistence slice](issues/RR-12.md) | Open draft |
