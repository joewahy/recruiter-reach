# Learn to debug deliberately

## A repeatable process

1. Reproduce the problem with the smallest input; write down expected and actual behavior.
2. Identify the layer: rendering, client state, network, server rule, or storage.
3. Form one hypothesis and inspect evidence. Use the terminal for Server Component logs; browser DevTools for client logs and network requests.
4. Change one thing, reproduce again, and explain why it worked.
5. For a meaningful behavioral bug, add a regression test that fails before the fix and passes after it. Do not add tests that merely copy the implementation.
6. Ask your partner to reproduce the fix without hints.

## Starter troubleshooting

| Symptom | What to check |
| --- | --- |
| `next: command not found` | Run `npm ci` in the folder containing package.json; check Node version |
| Port 3000 occupied | Use the port printed by Next, or `npm run dev -- --port 3001` |
| Import error | Check filename case, exported symbol, and the `@/*` alias |
| CSS appears missing | Confirm globals.css is imported by layout.tsx and inspect the matched CSS rule |
| Production start fails | Run `npm run build` before `npm start`; read the first build error |
| A change disappeared after reload | Starter fixtures are read-only; persistence is RR-06, not implemented yet |
| No logs in browser | page.tsx is a Server Component; inspect the dev-server terminal |

## Optional exercises on a disposable branch

These are drills, not existing bugs and not tasks to merge broken code.

- **After milestone 1:** temporarily misspell a property access. Read the TypeScript error, locate its source, and restore it. Explain why static types caught it before runtime.
- **After milestone 2:** reproduce a whitespace-only query and a role + location combination. If matching is wrong, inspect each predicate before changing state code.
- **After milestone 3:** corrupt only the app's demo-storage key in DevTools. The app should recover gracefully. Then simulate a failed lookup and double-click retry; ensure one active request per person.
- **After milestone 4:** put `=1+1` in a note and export it. Inspect the raw CSV; spreadsheet formula text must be neutralized and quoted safely.
- **After milestone 5:** approve a draft, edit its recipient, and try delivery. Approval must no longer authorize it. Capture this as a domain regression test.
- **After milestone 6:** queue an approved simulated send, then simulate a reply before dispatch. It must stop. Retry the same job and ensure no second simulated send occurs.

Keep a brief `Hypothesis → Evidence → Fix → Prevention` note in bug reports. Do not log real contact details, tokens, or full mailbox content.
