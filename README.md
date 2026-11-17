# Secure Device Monitor

Consent-based device security monitoring platform scaffold.

Run the dashboard with `pnpm install` followed by `pnpm dev:web`. The current dashboard shows explicit unavailable states because authentication and live API data are not wired yet. Do not use the scaffold for real monitoring or evidence storage.

Run the website with `pnpm --filter @sdm/web dev --hostname 127.0.0.1 --port 3107`. The dashboard supports a development demo preview with clearly labeled sample data. Set `ENABLE_DEMO_PREVIEW=false` to disable it. Real sign-in and dashboard data require the API routes listed in `docs/api-documentation.md`.

The API and mobile packages are module scaffolds. The initial database migration is in `database/migrations/001_initial.sql`; it has not been applied to a database. Authentication, enrollment, consent actions, uploads, and monitoring endpoints are not implemented yet.

See `docs/architecture.md`, `docs/api-documentation.md`, `docs/security-policy.md`, `docs/platform-limitations.md`, and `docs/implementation-plan.md` for the system boundaries and next increments. `docs/deployment.md` records the release gate.
