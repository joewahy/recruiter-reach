# Recruiter Reach

A small learning project for two developers: help job seekers find recruiters and hiring managers, then manage outreach with approval for every email.

## Start locally

Requires Node.js 22.13+ and npm. From this directory:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Stop the server with Ctrl+C.

```sh
npm run typecheck
npm run build
npm start
```

`npm start` serves the production build; run `build` first. The lockfile keeps both developers on the same dependency versions. The demo page needs no environment variables, database, or paid services. The email finder below works without a key for name-based guessing and needs a Hunter API key for company-wide discovery.

## Email finder

Finds work emails for recruiters and hiring managers. It never sends email.

The home page now has a search form: enter the recruiter's first name, last name, and company website, then click **Search for email**. An optional LinkedIn profile URL can be entered as a reference; it is validated locally but is not sent to the finder, stored, scraped, or used to identify an employer. Results show provider notes and email verification status; pattern guesses are explicitly unverified. Search has loading, error, no-result, and retry states. Editing the fields clears previous results.

Setup (optional, enables discovery): create `.env.local` in this directory containing one line, `HUNTER_API_KEY=your_key`. It is git-ignored; never commit it. Hunter lookups may use credits on your Hunter plan, check your plan's limits.

```sh
npm run find -- stripe.com --role recruiter     # discover recruiters (needs HUNTER_API_KEY)
npm run find -- stripe.com --role hiring_manager
npm run find -- stripe.com --name "Jane Doe"    # find or guess one person's address
npm run find -- stripe.com --json               # raw JSON
npm test                                        # unit tests with a fake Hunter and DNS
```

Or over HTTP while `npm run dev` is running: `GET /api/find?domain=stripe.com&role=recruiter` (also `name`, `limit`). The route has no login and only a small in-memory rate limit, so use it locally and do not deploy it as is.

How to read results:

- With a key and a name, Hunter's Email Finder is tried first. Without a key, or if Hunter finds nothing, you get **pattern guesses** (`first.last@`, `flast@`, and so on) after a check that the domain has mail servers. Guesses are always `unverified`; they are not confirmed to exist.
- Hunter results carry Hunter's own verification status and check date. A verified address is an assessment at that time, not a delivery guarantee.
- `hiring_manager` is matched by title keywords, which is a heuristic. `recruiter` uses Hunter's HR department filter.
- No result is a valid outcome. If Hunter has been asked not to process a person's data (HTTP 451), no address is returned and none is guessed.

Not yet verified against a live account: the Hunter calls follow Hunter's published API docs and are tested only with a fake `fetch`. Run once with your key and check a result before relying on it.

## What exists today

- Next.js App Router and strict TypeScript.
- A responsive page rendering three invented recruiter/hiring-manager profiles.
- A shared public-profile type and a separate fixture module.
- The email finder: core in `src/server/finder/`, CLI in `scripts/find.ts`, API route in `src/app/api/find/route.ts`, tests in `tests/`.
- Contribution guidance, a pull-request template, and a foundations guide for beginners.

There is no persistence, auth, sending, or sequence logic yet. Refreshing clears search state and rerenders fixtures. PostgreSQL remains the eventual persistence target and is deliberately deferred. This starter is the foundation of the demo phase in AGENTS.md, not completion of that phase.

## Where to look

| File | Purpose |
| --- | --- |
| `src/app/page.tsx` | Server-rendered directory page; start learning here |
| `src/features/finder/finder-search.tsx` | Interactive name/company finder form and results; optional LinkedIn reference |
| `src/app/layout.tsx` | Shared document and metadata |
| `src/app/globals.css` | Styling and mobile layout |
| `src/features/contacts/types.ts` | Contract for public profile summaries |
| `src/features/contacts/demo-people.ts` | Invented example data; contains no email addresses |
| `src/server/finder/find.ts` | Email finder entry point: chooses Hunter or guesses, returns normalized results |
| `src/server/finder/hunter.ts` | Hunter adapter: calls, error mapping, status normalization |
| `src/server/finder/guesser.ts` | Name parsing, address patterns, mail-server (MX) check |
| `scripts/find.ts` | `npm run find` command-line interface |
| `src/app/api/find/route.ts` | `GET /api/find` JSON route |
| `tests/finder.test.ts` | Finder tests with a fake Hunter and DNS |
| `docs/FOUNDATIONS.md` | Git, issues, web basics, TypeScript, testing, and privacy background |
| `docs/LEARNING_PLAN.md` | Beginner working method, vocabulary, and review habit (no roadmap yet) |
| `docs/DEBUGGING.md` | Debugging workflow and optional exercises |
| `CONTRIBUTING.md` | Two-person branch and PR workflow |
| `AGENTS.md` | Product requirements and agent guidance |

No broken behavior has been intentionally planted. Debugging exercises run on disposable branches.

## First session together

Both run the app, trace how the fixture reaches the page, and each change one profile locally. Then read the working method in `docs/LEARNING_PLAN.md` and agree on the next roadmap together. Both collaborators (@lakerss6 and @joewahy) are beginners. There is no roadmap yet; build one small step at a time.

## Technical reference

The scaffold follows the [official Next.js manual installation guide](https://nextjs.org/docs/app/getting-started/installation). The project uses plain CSS to keep the first lesson small; styling libraries can be introduced when needed. Tests use Node's built-in test runner (`npm test`), so there is no test dependency yet.

## Starter verification

Verified during setup: clean `npm ci`, TypeScript checking, production build, and an HTTP smoke check returning 200 with the demo label and all three fictional profiles. Browser interaction and visual QA were not performed. The temporary verification server was stopped; use `npm run dev` to work locally. GitHub Actions is configured but has not run remotely.

Verified for the email finder (issue #16): `npm test` (13 passing, fake Hunter and DNS), `npm run typecheck`, `npm run build`, `npm run find` for a missing key, a bad domain and a name guess, and `curl` against `npm start` for `/api/find` success and 400 cases. Not verified: any call to the real Hunter API, `npm test` in CI, or the browser.
