# Secure Device Monitor architecture

## Monorepo

- `apps/web`: Next.js administrator dashboard. It should consume the API through typed clients; no production statistic is owned by the UI.
- `apps/api`: NestJS boundary for authentication, organization-scoped authorization, devices, consent, evidence, notifications, reports, and audit logs.
- `apps/mobile`: Expo client. Camera, media, location, and notifications are opt-in and initiated from visible user actions.
- `packages/shared-types`: shared transport types and enums.
- `packages/validation`: input constraints shared by clients and the API.
- `packages/security`: security policy constants shared by the workspace.

## Data model

The first migration is `database/migrations/001_initial.sql`. It defines `organizations`, `users`, `memberships`, `devices`, `device_invitations`, `consents`, `security_events`, `evidence_objects`, `reports`, `notifications`, `audit_logs`, and `refresh_tokens`, with foreign keys and lookup indexes. Every organization-owned query must scope by the authenticated principal and role. Database constraints alone do not provide tenant isolation; API authorization and restricted database privileges are required before operational use.

## Security decisions

Access tokens are short-lived and refresh tokens are rotated, hashed at rest, and revoked on reuse. Invitation tokens are one-time, scoped, and expire quickly. Evidence uses private object storage with content-type and size validation, malware scanning, signed short-lived download URLs, and an audit entry for every read. MFA is required for administrators. Rate limits apply to login, invitation, upload, and token endpoints.

The platform does not implement hidden surveillance, silent camera/microphone access, gallery scraping, OS permission bypasses, or unsupported background monitoring.
