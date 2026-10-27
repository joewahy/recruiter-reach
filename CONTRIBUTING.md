# Working together

Read AGENTS.md and docs/LEARNING_PLAN.md first. New to Git, issues, or web apps? Start with docs/FOUNDATIONS.md. The collaborators are @lakerss6 and @joewahy. Each person both implements and reviews; rotate responsibilities.

## One issue, one branch, one small PR

1. Agree which issue you own and read its dependencies.
2. Start from `main`: `git switch main && git pull`.
3. Create a descriptive branch, such as `feat/name-search` or `fix/filter-reset`.
4. Make a small change, run the relevant checks, and inspect `git diff` and `git status` before committing.
5. Open a PR explaining behavior, verification, and what you learned. Your partner reviews it.
6. Resolve feedback and merge according to your team's agreed workflow. Pull the updated integration branch before starting the next task.

Never both edit the same shared file without coordinating. Agree on types and exports together before splitting work. Ask before adding dependencies or changing a shared contract.

## Review checklist

- Can the reviewer explain the change without the author narrating every line?
- Does the feature meet the issue's acceptance criteria and demo labeling rules?
- Are errors, empty input, repeated clicks, and keyboard access handled where relevant?
- Did the author run typecheck/build and any tests relevant to changed behavior?
- Are there no secrets, real contact data, generated build output, or accidental unrelated changes?
- Can both people reproduce the reported behavior?

Record bugs in an issue with reproduction steps, expected/actual behavior, environment, and evidence. Avoid secrets or real personal details in logs and screenshots. Do not fix an unreported bug by hiding its error message.

## Suggested pairing rhythm

Start each task with a 15-minute contract discussion. Implement separately where possible, swap reviews, and end with a short demo and one lesson each. Ask for hints before asking an agent to implement an entire learning task.
