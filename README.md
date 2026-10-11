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

## Deploying to Vercel

This repository contains two applications. Create two Vercel projects from the same GitHub repository, setting the project root directory to `api` for the Express API and `web` for the Next.js app. Vercel can deploy the Express application directly; each project gets its own deployment URL.

Deploy the API with these environment variables:

- `MONGODB_URI`: a reachable MongoDB connection string with network access enabled for Vercel.
- `SESSION_SECRET`: a strong, unique random secret stored only in Vercel's environment settings.
- `WEB_ORIGIN`: the exact production origin of the Next.js project, such as `https://stillpoint.vercel.app`.
- `COOKIE_SECURE=true`
- `GOOGLE_CLIENT_ID`, `JUDGE0_URL`, `JUDGE0_AUTH_TOKEN`, and `JUDGE0_LANGUAGE_ID` when those integrations are configured.

For the Next.js project, set `NEXT_PUBLIC_API_ORIGIN=/api` and `API_BACKEND_ORIGIN` to the API deployment origin, without a trailing slash or `/api` suffix. Next.js then proxies `/api/*` to Express under the web origin so the HttpOnly session cookie remains first-party. Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` if Google sign-in is enabled. Keep secrets in Vercel's environment settings; never commit them or add them to `NEXT_PUBLIC_*` variables.

The API requires MongoDB at runtime. Seed the question library after MongoDB is configured with `npm run seed` using the same `MONGODB_URI`. Judge0 is optional, but solution evaluation reports unavailable until it is configured.

## Checks

- `npm test` runs the API domain tests.
- `npm run lint` checks the React app and API JavaScript.
- `npm run build` verifies the production Next.js build.
- `npm run smoke --workspace api` exercises auth, assignment, access control, evaluation-unavailable handling, and answer review against a running local API/database.

## Current question content

The repository currently seeds 17 original starter problems so the interview flow can run locally. This is not yet the planned 150+ question bank. Expand it only with vetted content whose reuse terms are clear, and preserve each source, license, and attribution in problem metadata.

## Security notes

Passwords use bcrypt hashes and login sessions use signed HttpOnly cookies stored in MongoDB. Hidden tests and reference solutions are excluded from active-session API responses. User code is sent to Judge0 only from the Express API; it is never run inside this application. Use HTTPS and secure cookie settings when deploying.
