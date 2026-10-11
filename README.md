# Mock Interview Platform

A timed DSA practice platform built with a Next.js App Router client and a separate Express/MongoDB API.

## Requirements

- Node.js 20+
- MongoDB (local or hosted)
- Judge0 CE endpoint for code evaluation (optional for UI development; submissions report that evaluation is unavailable until configured)
- Google OAuth credentials for Google sign-in (email/password works without them)

## Setup

1. Copy `api/.env.example` to `api/.env` and configure `MONGODB_URI`, `SESSION_SECRET`, and `WEB_ORIGIN`.
2. Copy `web/.env.example` to `web/.env.local`. For Google sign-in, use the same Google OAuth client ID in both the web and API env files.
3. Configure `JUDGE0_URL` and optional `JUDGE0_AUTH_TOKEN` to enable JavaScript evaluation.
4. Install dependencies from the project root with `npm install`.
5. Seed the built-in starter problems with `npm run seed`.
6. Start both services with `npm run dev`.

The web app runs at http://localhost:3000 and the API at http://localhost:4000. `npm run build` builds the Next.js app. The seed command is repeatable and does not overwrite existing problem documents.

## Checks

- `npm test` runs the API domain tests.
- `npm run lint` checks the React app and API JavaScript.
- `npm run build` verifies the production Next.js build.
- `npm run smoke --workspace api` exercises auth, assignment, access control, evaluation-unavailable handling, and answer review against a running local API/database.

## Current question content

The repository currently seeds 17 original starter problems so the interview flow can run locally. This is not yet the planned 150+ question bank. Expand it only with vetted content whose reuse terms are clear, and preserve each source, license, and attribution in problem metadata.

## Security notes

Passwords use bcrypt hashes and login sessions use signed HttpOnly cookies stored in MongoDB. Hidden tests and reference solutions are excluded from active-session API responses. User code is sent to Judge0 only from the Express API; it is never run inside this application. Use HTTPS and secure cookie settings when deploying.
