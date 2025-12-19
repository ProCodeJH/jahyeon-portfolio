# Sentry Setup

This repository includes optional Sentry scaffolding for both client and server.

## Client
- Set `VITE_SENTRY_DSN` in Vercel (or your deployment provider) to enable Sentry in the browser.
- `client/src/lib/sentry.ts` initializes Sentry automatically when `VITE_SENTRY_DSN` is present.
- It's recommended to set `VITE_COMMIT_SHA` in your build to capture `release` metadata.

## Server
- Set `SENTRY_DSN` in your deployment environment to enable server-side error collection.
- `server/_core/sentry.ts` initializes Sentry early when the process starts.
- Optionally set `COMMIT_SHA` for release metadata.

## Notes
- No DSNs are committed to the repo. Add secrets in Vercel or GitHub Secrets (for Actions) as needed.
- After setting secrets, test by throwing a test error and verifying Sentry appears in your Sentry project.
