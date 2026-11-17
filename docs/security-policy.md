# Security policy

Secure Device Monitor requires informed owner consent for registration and each sensitive capability. The app must show the organization, purpose, and requested access before the owner approves. Revocation must stop future collection and invalidate access on the server. Camera testing, media selection, and location sharing require explicit user action and platform permission.

Administrator access requires MFA, short-lived access tokens, rotating refresh tokens, server-side role checks, and organization-scoped queries. Invitation tokens must be one-time, hashed at rest, and expire. Evidence belongs in private object storage with size and type validation, scanning, short-lived downloads, and audit records. Logs must not contain secrets, raw tokens, or evidence contents.

The current repository is a scaffold. These controls are requirements for implementation and release, not a claim that they are active. See [`deployment.md`](deployment.md) for the release gate and [`platform-limitations.md`](platform-limitations.md) for supported capability boundaries.
