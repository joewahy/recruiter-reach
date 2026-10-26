# Recruiter Reach — project and agent instructions

## 1. Purpose and authority

This file guides implementation throughout this repository. Read it before making changes. Direct user instructions override this document. Keep it current when the user makes product decisions; do not silently turn proposals into approved requirements.

Build Recruiter Reach: a web app that helps **job seekers find recruiters and hiring managers, identify relevant work contact information, organize their job-search outreach, and manage individual emails and follow-ups**.

RocketReach is the product-category reference: contact discovery and enrichment support outreach. Our product focuses on a job seeker's workflow rather than attempting complete feature parity with a general sales intelligence platform. Use original branding, interface design, and copy.

## 2. Confirmed user decisions

These decisions were explicitly confirmed on October 26, 2026:

- Audience: job seekers looking for recruiters and hiring managers.
- Core capabilities: work-email discovery, contact organization, individual email composition and sending, and follow-up sequences.
- **Every individual email requires explicit user approval**, including every follow-up. Approving a sequence does not approve its messages for delivery.
- Start with clearly labeled demo contact data. Choose a real contact-data provider later.
- Stack: Next.js, TypeScript, and PostgreSQL as the proposed implementation default.
- Ask focused questions at meaningful decision points and confirm shared understanding before making consequential product choices.

The user subsequently requested a minimal runnable starter and five or six learning milestones for two collaborators. Implement only the small starter now; leave later features as learning issues. See `docs/LEARNING_PLAN.md` for the six-part breakdown, provisional owners, and dependencies. The user confirmed the starter-only scope and supplied usernames in order: `lakerss6` (user, owner A) and `joewahy` (friend, owner B). Both collaborators confirmed they are beginners. The user explicitly authorized publishing all 12 issue drafts to `joewahy/recruiter-reach` and assigning them to the named owners. Publication is pending authenticated GitHub access; do not ask for authorization again. Teach in small steps, define unfamiliar terms, and leave implementation of learning tasks to the collaborators unless asked. Do not complete all learning tasks on the learners' behalf unless asked. No live services or delivery are authorized by the starter request.

## 3. Collaboration rules

- Restate the intended behavior briefly before substantial implementation.
- Ask about ambiguities that materially change the user experience, cost, external integrations, or data handling. Batch related questions; avoid asking about every routine coding choice.
- Continue independent, reversible work while waiting for answers. Do not implement a dependent decision as if silence were approval.
- Label suggestions as proposals. Record confirmed decisions in this file.
- Explain what changed, how it was verified, and any remaining limitations.
- Never imply that a button works against a real provider when it only simulates an action.
- Keep changes scoped to the requested milestone. Do not add sales workflows, candidate sourcing, or large-scale outbound functionality without discussion.

## 4. Product model and terminology

The primary workflow is:

1. A job seeker selects a target company or enters a role, name, or location.
2. Search returns relevant recruiter and hiring-manager profiles.
3. The user reviews role, company, source, and freshness information.
4. A lookup attempts to reveal a work email and its verification status.
5. The user saves the person to a list associated with a company, job opportunity, or search goal.
6. The user writes an individual email or creates a sequence of follow-up drafts.
7. Each message is reviewed and explicitly approved before its own delivery.
8. Replies, bounces, suppression events, and manual stops prevent further follow-ups.

Definitions:

- **Search:** find matching profile summaries. Searching is distinct from revealing an email.
- **Lookup/enrichment:** attempt to obtain additional information about an identified person.
- **Verification:** an assessment of an address at a specific time; never a delivery guarantee.
- **Contact:** a profile saved in a user's workspace.
- **Sequence:** an ordered set of message drafts and follow-up delays.
- **Enrollment:** one contact's participation in one sequence.
- **Approval:** explicit authorization for one exact recipient, sender, subject, body, and attachment set.
- **Demo:** synthetic fixtures and simulated events, with no live discovery or delivery.

## 5. Scope and delivery order

### Milestone 1: complete demo workflow

Deliver an end-to-end experience using synthetic contacts and a simulated mailbox:

- Search people and companies with functioning filters.
- View profiles and simulate work-email lookup results.
- Save contacts to lists and associate them with job opportunities.
- Compose and edit individual messages.
- Create follow-up sequences and enroll contacts.
- Require approval for every simulated send, including follow-ups.
- Show an approval inbox, sequence progress, and contact outreach history.
- Simulate replies, bounces, and opt-outs to demonstrate stopping behavior.
- Export saved contacts to CSV with clear demo provenance.
- Persist user edits; disclose any reset behavior in local fixture-only previews.

### Milestone 2: persistent multi-user foundation

Add authenticated workspaces, PostgreSQL persistence, authorization, background jobs, audit events, and integration settings. A public deployment must not expose one user's contacts, messages, or job-search activity to another user.

### Milestone 3: real contact discovery

Choose a provider with the user after evaluating coverage for recruiters and hiring managers, source rights, freshness, verification semantics, API limits, pricing, and data retention terms. Implement the chosen adapter and disclose lookup costs before billable actions. Do not assume access to RocketReach's database.

### Milestone 4: connected email and reply synchronization

Choose Gmail, Microsoft, or another sending integration with the user. Add OAuth connection, per-message approval, delivery reconciliation, reply detection, bounce handling, suppression, and disconnection behavior. Obtain real provider credentials through configuration, never committed source.

### Later, only after discussion

Browser extension, CRM integrations, phone discovery, shared teams, subscriptions, public developer API, AI writing, resume ingestion, job-board ingestion, and advanced analytics. Do not add these to the first milestone by default.

## 6. Screens and precise behavior

### Application shell

Use original Recruiter Reach branding and navigation for Search, Contacts, Lists, Outreach, Approvals, and Settings. Show a persistent demo indicator when demo adapters are active. A disconnected integration must have an honest setup or unavailable state.

### Search

- Support name, company/domain, role category (recruiter or hiring manager), title keywords, and location.
- Apply OR within a multi-select filter and AND across filter categories. Document any provider-specific limitation.
- Distinguish a person's location from company headquarters.
- Search results show name, current title, company, location, available source link, freshness, and email availability without exposing unrevealed emails in API responses.
- Preserve filters in the URL; reset pagination when filters change.
- Use stable pagination and selection. “Select page” must not silently select all results.
- Provide loading, empty, no-match, unavailable-provider, and retryable-error states.
- Do not infer that a person owns a vacancy from their title alone. Label relevance explanations as heuristics unless supported by source evidence.

### Profile and lookup

- Show professional context, public professional profile links when supplied, provenance, and last-updated timestamps.
- Distinguish `not_requested`, `pending`, `found`, `not_found`, and `failed` lookup outcomes.
- Model email verification separately: `unverified`, `valid`, `invalid`, `catch_all`, or `unknown`, with provider and checked-at metadata.
- A generated address pattern is an unverified candidate, never a verified result.
- No result is a valid outcome. Do not fabricate an address, phone number, employer, or verification timestamp.
- Repeated clicks and retried requests must reuse an active lookup rather than create duplicate provider charges.

### Contacts, lists, and job opportunities

- Save contacts with notes, tags, source, and outreach status.
- Support list creation, rename, removal, membership changes, and CSV export.
- Removing list membership does not delete the contact or its history.
- An opportunity may record company, role title, job URL, application status, application date, and related contacts.
- Keep application status separate from contact or message status.
- Offer a merge workflow for likely duplicates; never merge people solely because their names match.
- Export only records the user is authorized to access and fields they have actually revealed or supplied.

### Composer and sequences

- Composer fields: sender, recipient, subject, body, and optionally an opportunity link for context.
- Show the final rendered message and resolved personalization before approval.
- Block approval when required fields or template variables are unresolved.
- Start with plain-text or safely sanitized email content. Do not render arbitrary HTML.
- Sequence editor supports ordered steps, delays relative to the previous successful send, and a selected user timezone.
- Proposed initial template: introduction, follow-up after 3 business days, final follow-up after 5 additional business days. This is an editable suggestion, not a confirmed default or an auto-send rule.
- When a step becomes due, create a draft awaiting approval. Do not automatically approve or send it.
- Permit pause, resume, stop, and individual-step skip with explicit effects visible in the UI.
- Pausing or stopping cancels pending delivery work; resuming does not approve messages.
- Start with no attachments; discuss resume storage and attachment handling before adding them.

### Approval inbox

- Display recipient identity/address, sending mailbox, opportunity, step number, due time, exact subject, and full rendered body.
- Require a separate approval action per message. No blanket sequence approval or automatic follow-up approval.
- Bind approval to an immutable message snapshot or content hash.
- Editing recipient, sender, subject, body, or attachments invalidates approval.
- Draft generation, sequence enrollment, and reaching the due date are not approval events.
- Default behavior: approving a due message authorizes its immediate send attempt. Future scheduled approvals are outside initial scope.
- Record approving user, timestamp, snapshot version, and send outcome.
- Demo actions must say “Simulate send” and show simulated outcomes.

## 7. Outreach state and correctness

Keep enrollment state, draft approval state, and delivery state separate.

- Enrollment: `active`, `paused`, `completed`, `stopped`.
- Approval: `draft`, `awaiting_approval`, `approved`, `rejected`, `invalidated`.
- Delivery: `not_queued`, `queued`, `sending`, `accepted`, `delivered`, `failed`, `unknown`.
- A provider accepting a request is not proof of delivery. Mark `delivered` only with appropriate provider evidence.
- Store stop reasons such as `reply`, `bounce`, `opt_out`, `manual`, or `disconnected`.
- Reply, hard bounce, and opt-out events stop affected enrollments and invalidate unsent approvals.
- Check enrollment state, suppression, mailbox connection, message snapshot, and approval again immediately before dispatch.
- Use stable idempotency keys and a durable send-attempt record. A network timeout after submission creates an uncertain outcome requiring reconciliation; do not blindly resend.
- Deduplicate incoming events and account for delayed or out-of-order webhooks.
- Prevent concurrent active enrollments from sending overlapping outreach to the same address in a workspace.
- Store timestamps in UTC and calculate display/due times using IANA timezones and daylight-saving rules.
- Use configurable application limits plus provider limits; do not invent a universal safe daily send quota.
- Track successful sends and replies where supported. Do not claim accurate open tracking or infer delivery from an open pixel.

## 8. Architecture defaults

Use a modular monolith initially:

- Next.js App Router and TypeScript in strict mode.
- PostgreSQL as the production source of truth.
- Server-side schema validation and typed domain/service boundaries.
- Proposed supporting choices: Tailwind CSS for styling, Prisma for migrations, Vitest for domain tests, and Playwright for critical browser flows. Confirm material tooling preferences at project setup.
- Use a maintained authentication solution; choose it during authenticated implementation.
- Durable background processing for lookups, sequence scheduling, sending, and webhook reconciliation. Do not run durable work in browser timers or assume request handlers remain alive after responding.
- Keep provider SDKs, secrets, database queries, and business authorization on the server.

Suggested structure, adaptable to the eventual scaffold:

```text
src/app/                  routes, layouts, server entry points
src/components/           shared interface components
src/features/             search, contacts, lists, outreach, approvals
src/server/domain/        business rules and state transitions
src/server/db/            persistence and transaction helpers
src/server/providers/     discovery, verification, and mailbox adapters
src/server/jobs/          scheduling and durable task handlers
src/server/auth/          session and authorization helpers
src/lib/                  shared utilities and validation
fixtures/                 synthetic profiles and simulated events
tests/                    meaningful domain and end-to-end tests
```

Define internal provider contracts for `searchPeople`, `searchCompanies`, `lookupPerson`, `getLookupStatus`, `verifyEmail`, `sendMessage`, and `syncReplies` as applicable. Normalize external statuses and errors at the adapter boundary. Discovery, verification, and mailbox providers may be different vendors.

Demo adapters must exercise the same domain interfaces as live adapters. Demo mode must never fall through to a live provider. Production must not silently fall back to fabricated contacts or simulated delivery.

## 9. Data model

Use opaque IDs, created/updated timestamps, relational constraints, and indexed foreign keys. Scope private records to a workspace and enforce that scope on every request and background job.

| Entity | Required responsibility and key fields |
| --- | --- |
| User | Auth identity, display name, timezone |
| Workspace / Membership | Ownership boundary, user membership, role |
| Company | Name, normalized domain, location, source, source identifier, freshness |
| Person | Name, current title, company reference, professional URL, location, source, freshness |
| Contact | Workspace-owned saved person, notes, tags, owner, outreach summary |
| EmailAddress | Address, normalized comparison key, type, provenance, verification status/provider/time |
| ContactReveal | Workspace entitlement to an email field, lookup reference, revealed-at timestamp |
| List / ListMember | Workspace list and unique list/contact membership |
| Opportunity | Company, job title, URL, application status and date |
| OpportunityContact | Explicit relationship between opportunity and contact |
| LookupJob | Workspace, identity input, provider request ID, status, idempotency key, error |
| MailboxConnection | Owner, provider, encrypted credential reference, granted scopes, health |
| Sequence / SequenceStep | Owner, ordered templates, delays, timezone, version |
| Enrollment | Contact, sequence snapshot, current step, next due time, state, stop reason |
| MessageDraft / Approval | Exact message snapshot/version, approval state, approver, approved-at |
| SendAttempt | Draft snapshot, idempotency key, provider message ID, outcome, reconciliation state |
| MessageEvent | Deduplicated provider event, message/thread association, event time |
| Suppression | Workspace/address scope, reason, source, active state |
| AuditEvent | Actor, workspace, action, entity reference, timestamp; avoid message bodies in logs |

Do not expose a shared provider cache as a user's saved-contact collection. Shared caching is conditional on provider terms; private notes, job applications, drafts, and activity remain workspace-owned.

Do not implement subscription credits in the demo unless requested. If a paid lookup model is introduced, use an append-only usage ledger with reservations, final charges, and releases. Make charging atomic and idempotent; distinguish provider costs from user-facing credits and avoid charging twice for a retry or existing reveal.

## 10. Data provenance, access, and integration requirements

- Synthetic fixtures use invented identities, reserved example domains, and an explicit `isDemo` marker. Never seed real people's private details.
- Demo verification badges must explicitly identify the result as simulated.
- Start real discovery with permitted provider APIs or user-supplied records. Do not assume public visibility grants permission to scrape or resell information.
- Choose provider contracts and retention behavior before ingesting a live dataset.
- Do not implement unauthorized scraping, access-control bypasses, or mailbox credential collection.
- Work-email discovery is in scope; personal email and phone discovery require a separate user decision.
- Record provenance and freshness; retain only necessary provider payload fields.
- Support removal/correction requests and suppression so removed records are not reintroduced on the next enrichment.
- Suppressed addresses cannot be sent messages through another sequence or re-import. Recheck immediately before sending.
- Before live outreach launch, establish applicable privacy, sender identification, and opt-out requirements for the supported markets. This document is an engineering specification, not a legal conclusion.
- Use OAuth with minimal required scopes for mailboxes. Encrypt refresh tokens and keep them out of browser state, logs, and repository files.
- Verify webhook authenticity using the selected provider's documented mechanism.
- Treat provider data, job descriptions, imported CSVs, and template variables as untrusted input.
- Enforce authorization server-side, protect mutations against cross-site requests as applicable, rate-limit costly actions, and avoid logging raw addresses or message content.
- Prevent CSV formula injection in spreadsheet exports. Validate file type, size, row count, and mappings before implementing imports.

## 11. Interface quality

- Favor a focused job-search workspace with readable tables, clear filters, and visible next actions.
- Make company, job opportunity, contact, and outreach context easy to connect.
- Distinguish unavailable, unverified, stale, and verified data with text, not color alone.
- Provide keyboard access, visible focus, labeled controls, accessible dialogs, and responsive layouts.
- Confirm destructive data removal; give recoverable actions undo where practical.
- Do not advertise database size, delivery rate, verified accuracy, or integrations without evidence.
- Show meaningful errors without exposing tokens, provider internals, or private data.

## 12. Testing and completion criteria

Run checks appropriate to each implemented change. Prioritize tests for behavior that can charge money, expose data, or send messages:

- Cross-workspace reads and writes are rejected, including jobs and exports.
- Search filters compose correctly and pagination remains stable.
- Lookup retries do not duplicate work or charges.
- Unrevealed contact values never appear in unauthorized API responses or page payloads.
- Every individual message, including follow-ups, requires its own approval.
- Content or recipient edits invalidate earlier approval.
- Reply, bounce, suppression, pause, and disconnect events block dispatch even if the message was previously queued.
- Retries and uncertain send outcomes do not cause duplicate outreach.
- Timezone and business-day calculations handle daylight-saving boundaries.
- Demo mode cannot send real email or invoke paid discovery.

Milestone 1 is complete when a user can search synthetic recruiters, simulate an email reveal, save a list, connect a contact to an opportunity, compose an introduction and follow-ups, approve each simulated message individually, and observe a simulated reply stopping the sequence. Empty, loading, error, and disconnected states must also work.

Document setup, environment variables, demo behavior, migration steps when relevant, and the commands actually used for validation in the README. Do not claim unrun tests passed. Do not commit secrets, deploy, purchase a provider plan, or make live outreach part of a demo milestone.

## 13. Decisions to ask about when they become relevant

- Primary geography, languages, and target industries.
- Whether users search from a specific job posting or begin with companies and people.
- Contact-data provider, permitted uses, budget, and lookup billing behavior.
- Gmail versus Microsoft versus another mailbox integration.
- Authentication provider and deployment host.
- Whether AI-assisted writing, resumes, attachments, imports, or paid plans belong in a later milestone.
- Final sequence defaults, business-day calendar, and sending-hour behavior.

Do not block documentation or a synthetic-data prototype on all of these answers. Ask before implementing the affected integration or consequential behavior.

## 14. Reference and research limits

Product reference: [RocketReach](https://rocketreach.co/). Official API reference URLs include [People Search](https://docs.rocketreach.co/reference/people-search-api) and [People Lookup](https://docs.rocketreach.co/reference/people-lookup-api).

Research was attempted on October 26, 2026. The official website and API reference pages could not be retrieved in this session. Secondary search results describe contact search, lookup/enrichment, lists/exports, and outreach features; they are insufficient to establish exact current API contracts, pricing, plan entitlements, or verification guarantees. Those specifics are intentionally not requirements here.

The detailed behavior above is **our app's specification**, based on the user's confirmed direction and explicitly identified proposals. It is not a claim that RocketReach implements the same rules. Before selecting a real provider, inspect its current official documentation and contract rather than implementing from remembered or third-party endpoint descriptions.
