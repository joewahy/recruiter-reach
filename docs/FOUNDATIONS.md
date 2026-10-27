# Foundations

Background for the learning milestones. Skim it now and come back when an issue mentions a term you do not know. Product rules live in `AGENTS.md`; the milestone order lives in `docs/LEARNING_PLAN.md`.

## 1. Git and GitHub

**Git** records snapshots of your project on your computer. **GitHub** hosts a shared copy so two people can work on it.

| Term | Meaning |
| --- | --- |
| Repository | The project folder plus its full history |
| Commit | A saved snapshot with a message |
| Branch | A separate line of work; `main` is the shared, working version |
| Push / pull | Send your commits to GitHub / bring others' commits to you |
| Pull request (PR) | A request to merge your branch into `main`, with room for review |
| Merge conflict | Two people changed the same lines; you choose what to keep |

Daily loop:

```sh
git switch main && git pull          # start from the latest shared code
git switch -c feat/rr-03-name-search # one branch per issue
git status                           # see what changed
git add <files> && git commit -m "Add name search"
git push -u origin feat/rr-03-name-search
```

Then open a PR on GitHub. Your partner reviews it, you fix feedback, and it is merged. Pull `main` again before the next task. Commit small, working steps. Read `git diff` before you commit.

### Using issues

- One issue is one small task with a clear "done" checklist. Split anything that would take more than a couple of sessions.
- One assignee per issue. If two people are needed, make two issues.
- Put `Closes #12` in the PR description. Merging then closes the issue and links the two.
- Discuss the task in the issue comments so the reasoning stays with the work. Write `Blocked by #8` when you are waiting on another issue.
- Labels describe the type (`bug`, `feature`, `docs`, `blocked`). Milestones group issues into a goal and show percent complete.
- The `RR-xx` names in `docs/issues/` are local planning IDs. GitHub assigns its own numbers when an issue is published.

## 2. How a web app works

- A **browser** (the client) asks a **server** for a page. The request and the answer follow **HTTP**.
- A **URL** can carry state after a `?`, like `/search?role=recruiter&q=ana`. These are **query parameters**. RR-04 keeps filters here so a link can be shared.
- **JSON** is the plain-text format programs use to exchange data, like `{"id": "p1", "name": "Ana"}`.
- An **API endpoint** is a server address that receives a request and returns data instead of a page. RR-05 builds one.
- **localStorage** keeps small data in one browser on one computer. It is not secure and not shared between people. It is fine for synthetic demo data (RR-06), never for real private data.
- A **cookie** is data the browser sends with each request. Login sessions normally use cookies (RR-12).
- An **environment variable** holds configuration or a secret outside the code, usually in a `.env` file. `.gitignore` already excludes `.env*`. Never commit keys, tokens, or passwords.

### What Next.js does here

- **Routes are folders.** `src/app/page.tsx` is the home page. A folder like `src/app/search/page.tsx` would become `/search`.
- **`layout.tsx`** wraps pages with shared HTML and metadata.
- **Server Components** (the default) run on the server and send finished HTML. They can read server-only data, and `console.log` appears in the terminal running `npm run dev`.
- **Client Components** start with `"use client"` and run in the browser. Use them for clicks, typing, and state. Their logs appear in browser DevTools.
- Rule of thumb: keep things on the server unless the page must react to the user.
- **Fixtures** (`src/features/contacts/demo-people.ts`) are invented example data standing in for a real database.

## 3. TypeScript basics

TypeScript adds **types** to JavaScript so many mistakes are caught before the app runs.

```ts
type PersonSummary = {
  id: string;
  role: "recruiter" | "hiring_manager"; // a union: only these two values are allowed
};
```

- `PersonSummary` in `src/features/contacts/types.ts` is the shared contract for a profile. Changing it affects every file that uses it, so agree on changes together.
- `"strict": true` in `tsconfig.json` turns on the strictest checks. Keep it on.
- `import { x } from "@/features/..."` starts at `src/`. The `@` alias is set in `tsconfig.json`.
- Run `npm run typecheck`. Read the **first** error only; later ones are often caused by it. The message names a file and line.
- Avoid `any` and silencing errors with `as`. They hide the exact problems types exist to find.

## 4. Testing

CI currently runs `npm run typecheck` and `npm run build` only. There is no test runner yet. `AGENTS.md` proposes Vitest; decide together before the first issue that needs one.

Write a test when the code:

- Contains logic that can be wrong in non-obvious ways (filter combinations, CSV escaping, sequence timing).
- Fixes a bug. Make the test fail first, then fix, so the bug cannot quietly return. This is a **regression test**.
- Could expose data, charge money, or send a message. Approval and stop rules in RR-10 and RR-11 are the clearest examples.

Skip tests for layout, styling, wording, and throwaway experiments. A passing build proves the code compiles, not that the feature works. Demo the acceptance criteria by hand too.

## 5. The core ideas, in plain language

- **Person**: a public profile of a recruiter or hiring manager. It exists whether or not you saved it.
- **Contact**: a person you saved to your own workspace, with your notes and tags.
- **Opportunity**: a job you are pursuing. Its status is separate from any contact's status.
- **Sequence**: an ordered set of message drafts with delays, such as an intro and two follow-ups.
- **Enrollment**: one contact taking part in one sequence.
- **Approval**: your explicit yes to one exact message (recipient, sender, subject, body). Editing any of those cancels it. Approving a sequence never approves its messages.
- **Demo**: invented data and simulated events. Demo mode never contacts a real person or a paid service, and buttons say "Simulate".

Three states are kept apart on purpose, because they answer different questions:

| State | Question it answers | Example values |
| --- | --- | --- |
| Enrollment | Is this sequence still running? | active, paused, stopped |
| Approval | Did the user say yes to this message? | draft, awaiting_approval, approved |
| Delivery | What happened when we tried to send? | queued, accepted, delivered, failed |

A message can be approved yet not delivered. A reply stops the enrollment even if a message is already approved. Full rules are in sections 6 and 7 of `AGENTS.md`.

## 6. Privacy and email law (read before real data or sending)

Not needed for the demo, essential before Milestone 3 (real contact data) or 4 (real sending). This is orientation, not legal advice.

- Contacting people at work can still be regulated. Examples: CAN-SPAM (US), GDPR (EU and UK), CASL (Canada). Rules vary by where the sender and recipient are.
- Typical requirements include honest sender identity, a working way to opt out, and honoring opt-outs promptly.
- Public does not mean free to scrape or resell. Use permitted provider APIs and keep a record of where each piece of data came from.
- Collect and keep only what you need. Support removal requests, and keep suppressed addresses suppressed.
- Never put real contact details, message bodies, or tokens in logs, screenshots, issues, or commits.

## 7. Tooling setup

- **Node.js 22.13 or newer** (see `engines` in `package.json`). Check with `node --version`. A version manager such as nvm or fnm makes switching easy.
- **`npm ci`** installs exactly what `package-lock.json` lists, so both developers match. Use `npm install <package>` only when you deliberately add a dependency, and ask your partner first.
- **Editor:** any editor with TypeScript support. VS Code underlines type errors as you type.
- **Browser DevTools** (right-click, Inspect): Console for client logs, Network for requests, Application for localStorage, Elements for CSS.
- Stuck? See `docs/DEBUGGING.md`.
