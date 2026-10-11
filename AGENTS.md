# Mock Interview Platform

## Product

Build an individual coding interview practice platform. A signed-in user chooses a 45, 60, or 90 minute session and receives exactly three unique DSA problems: one easy, one medium, and one hard. The assignment and deadline are fixed server-side. Users submit JavaScript solutions, see server-evaluated results and a deterministic score, and can view reference answers after a session is completed or expires.

## Stack and boundaries

- `web/` is the React UI built with Next.js App Router, JavaScript, and CSS modules/global CSS. Use server components for static shells and client components only for interactive UI (forms, editor, timer, navigation).
- `api/` is a separate Express/Node.js API. It owns authentication, authorization, validation, question selection, session lifecycle, evaluation orchestration, and scoring.
- MongoDB is the source of truth. Mongoose models and indexes belong in `api/src/models/`.
- Never move protected evaluation logic into Next.js client code. Hidden tests and reference solutions must not appear in active-session API responses.
- Submitted code is untrusted. Send it only to the configured Judge0 API from Express; never execute it in the app process. Keep Judge0 credentials server-side and apply resource limits.
- Use HttpOnly, SameSite cookies for authentication. Verify ownership for every session and submission operation.

## Product behavior

- Durations are exactly 45, 60, and 90 minutes. Server timestamps are authoritative; a browser timer is display-only.
- Randomly select one eligible problem at each difficulty, without duplicates. Persist problem IDs and session start/deadline so refreshes do not reroll or reset the clock.
- Session states are `active`, `completed`, or `expired`. Finalize on explicit finish or deadline. Score is one third per problem when all hidden tests pass.
- Reference answers, explanations, and review-only tests are returned only for finalized sessions.
- Support email/password and Google OAuth. Passwords must be hashed; do not log credentials, auth cookies, secrets, or full submitted source.
- The question library covers arrays, strings, maps/sets, lists, stacks/queues, trees/tries, graphs, heaps, sorting/searching, recursion/backtracking, dynamic programming, greedy algorithms, and bit manipulation. Preserve source/license attribution for imported content.

## UI direction

- Create a polished, modern, minimal interface with a quiet neutral palette, one restrained accent, strong type hierarchy, generous spacing, and clear focus states.
- Provide authentication, dashboard/session history, interview setup, a distraction-free coding workspace, and completed-session review.
- Keep timer, current difficulty, submission status, and score clear. Make layouts responsive and keyboard accessible; do not rely on color alone for state.
- Include loading, empty, error, expired, and unavailable-integration states. Do not imply code evaluation works when Judge0 is unconfigured.

## Engineering conventions

- Inspect current code and package scripts before changes. Keep route handlers thin; put domain behavior in services and validation at API boundaries.
- Use consistent JSON response/error shapes. Never return stack traces or internal provider credentials.
- Validate state transitions and request ownership server-side. Make submission retries idempotent where feasible.
- Keep secrets in environment variables. Maintain `.env.example` with placeholders only. Do not commit `.env`, build output, or `node_modules`.
- Keep the sample question seed repeatable. Never overwrite customized problem records during seeding.
- Document local setup, database requirements, OAuth setup, and Judge0 configuration in `README.md`.

## Verification

- Run the documented lint/build checks after changes.
- Verify auth ownership, fixed assignments, authoritative expiry, answer-key redaction, score calculation, and evaluator failure states.
- Review the full flow at desktop and narrow viewports. Report integrations that require user-provided credentials or external services.
