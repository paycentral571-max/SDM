# Incremental implementation plan

1. **Foundation (current):** workspace, dashboard visual system with unavailable states, initial PostgreSQL migration, shared contracts, API/mobile module boundaries, environment template, and security constraints. These are scaffolds; the dashboard has no authenticated data path yet.
2. **Identity:** Supabase/Auth equivalent integration, MFA enrollment/challenge, refresh rotation, RBAC guards, organization membership APIs.
3. **Device lifecycle:** invitation issuance/acceptance/revocation, device inventory/detail APIs, consent ledger, disconnect handling.
4. **Signals:** supported OS diagnostics and user-initiated events only; notification fan-out through FCM/APNs; incident/report aggregation.
5. **Evidence:** presigned private uploads, validation/scanning, consent-linked history, signed downloads.
6. **Assurance:** migration tests, authorization matrix tests, upload abuse tests, invitation expiry/replay tests, rate-limit tests, and deployment runbooks.

No live operational figures or supported monitoring events are shown yet. Deployment is deferred until the identity, authorization, consent, evidence, and security verification work is complete.
