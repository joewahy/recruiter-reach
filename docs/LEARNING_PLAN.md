# Beginner working method

There is no learning roadmap right now. The previous plan was removed; what replaces it will be agreed in a separate issue. Only the minimal starter is implemented. Real data providers and live mail remain a later, separately discussed phase.

Both collaborators, @lakerss6 and @joewahy, are beginners. Alternate implementation and review duties so neither person is confined to frontend or backend.

New to Git, issues, or how a web app works? Read [FOUNDATIONS.md](FOUNDATIONS.md) first.

## How to work through a task

Read the task together, then work on one acceptance criterion at a time. A checkbox is done when you can demonstrate it, not merely when the code compiles.

1. Read the starting files and explain their current behavior out loud.
2. Make one small change. Run the app and inspect the result.
3. Run typecheck; read the first error before changing more code.
4. Ask your partner to review and explain the change back to you.
5. Write one learning note and commit a small, working step.

Ask an agent for an explanation or a hint first; ask for a full implementation only when you deliberately want to hand off that task. You do not need to understand authentication, database migrations, or job queues to begin.

Vocabulary: a **component** renders part of the UI; **props** are inputs to a component; **state** is changing application data; a **type** describes a value's expected shape; an **API endpoint** handles a network request; **persistence** keeps data after a reload or restart; a **migration** changes database structure; **authentication** identifies the user, while **authorization** decides what that user can access; **idempotency** means retrying an operation does not repeat its effect.

## Review habit

When a piece of work is finished: the author demos the acceptance criteria, the reviewer reproduces one edge case, and both record a short learning note. Types/build passing is necessary but does not demonstrate product behavior.
