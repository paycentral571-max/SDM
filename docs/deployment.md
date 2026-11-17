# Deployment gate

Do not deploy this scaffold as a security service. Before deployment, configure an identity provider with administrator MFA, implement token verification and role guards, and verify organization isolation on every query. Apply `database/migrations/001_initial.sql` to a dedicated PostgreSQL database with a restricted application role. Use HTTPS and private storage, enforce upload limits and scanning, rotate secrets, and configure FCM/APNs credentials outside source control.

Required environment values are described in `.env.example`. `NEXT_PUBLIC_API_URL` is public browser configuration; database URLs, token secrets, storage credentials, and push credentials remain server-side. Add `WEB_ORIGIN` for allowed browser origins. Never use example secrets in a running environment.

The release gate includes tests for MFA/session expiry, cross-organization reads and writes, invitation expiry and replay, consent revocation, upload validation and scanning, private download access, rate limits, audit coverage, and device disconnection. No production security review has been completed.
# Supabase Postgres setup

1. Create a Supabase organization and project for Secure Device Monitor.
2. In the project dashboard, open **Connect** and copy the PostgreSQL connection URI for the API server. Use the direct connection when the runtime supports IPv6; use Supabase's session pooler URI for IPv4-only hosts. Keep the database password private.
3. Put the URI in the API runtime's `DATABASE_URL` secret. Do not expose it through `NEXT_PUBLIC_*`, Expo public variables, source control, browser code, or client apps. Remote database connections must use TLS.
4. Apply schema changes using `pnpm --filter @sdm/api db:migrate` with a migration/deployment identity. Keep application credentials separate and least-privileged; do not run the API as the database owner or Supabase service role. The runner serializes migrations with a Postgres advisory lock and records applied SQL files in `public.sdm_schema_migrations`.
5. Start the API and confirm `GET /health/ready` returns `{ "status": "ready", "database": "connected" }`.

The API currently establishes a TypeORM PostgreSQL connection from `DATABASE_URL` and disables schema synchronization. Feature modules still need repositories and routes before the application can use the schema for authentication, device enrollment, consent, evidence, or monitoring. A connected database alone does not make those product flows operational.
