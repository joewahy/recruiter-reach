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

`npm start` serves the production build; run `build` first. The lockfile keeps both developers on the same dependency versions. No environment variables, database, API keys, or paid services are needed for this starter.

## What exists today

- Next.js App Router and strict TypeScript.
- A responsive page rendering three invented recruiter/hiring-manager profiles.
- A shared public-profile type and a separate fixture module.
- Contribution guidance, a pull-request template, and a foundations guide for beginners.

There is no search, persistence, auth, email lookup, sending, or sequence logic yet. Refreshing simply rerenders fixtures. PostgreSQL remains the eventual persistence target and is deliberately deferred. This starter is the foundation of the demo phase in AGENTS.md, not completion of that phase.

## Where to look

| File | Purpose |
| --- | --- |
| `src/app/page.tsx` | Server-rendered directory page; start learning here |
| `src/app/layout.tsx` | Shared document and metadata |
| `src/app/globals.css` | Styling and mobile layout |
| `src/features/contacts/types.ts` | Contract for public profile summaries |
| `src/features/contacts/demo-people.ts` | Invented example data; contains no email addresses |
| `docs/FOUNDATIONS.md` | Git, issues, web basics, TypeScript, testing, and privacy background |
| `docs/LEARNING_PLAN.md` | Beginner working method, vocabulary, and review habit (no roadmap yet) |
| `docs/DEBUGGING.md` | Debugging workflow and optional exercises |
| `CONTRIBUTING.md` | Two-person branch and PR workflow |
| `AGENTS.md` | Product requirements and agent guidance |

No broken behavior has been intentionally planted. Debugging exercises run on disposable branches.

## First session together

Both run the app, trace how the fixture reaches the page, and each change one profile locally. Then read the working method in `docs/LEARNING_PLAN.md` and agree on the next roadmap together. Both collaborators (@lakerss6 and @joewahy) are beginners. There is no roadmap yet; build one small step at a time.

## Technical reference

The scaffold follows the [official Next.js manual installation guide](https://nextjs.org/docs/app/getting-started/installation). The project uses plain CSS to keep the first lesson small; styling libraries and a test runner can be introduced when needed.

## Starter verification

Verified during setup: clean `npm ci`, TypeScript checking, production build, and an HTTP smoke check returning 200 with the demo label and all three fictional profiles. Browser interaction and visual QA were not performed. The temporary verification server was stopped; use `npm run dev` to work locally. GitHub Actions is configured but has not run remotely.
