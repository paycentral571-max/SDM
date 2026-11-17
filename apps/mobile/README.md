# Secure Device Monitor Mobile

Expo and React Native application for Android and iOS. It uses the existing workspace and `EXPO_PUBLIC_API_URL` from the repository environment configuration.

## Run

From the repository root:

```sh
pnpm --filter @sdm/mobile start
pnpm --filter @sdm/mobile typecheck
```

Set `EXPO_PUBLIC_API_URL` to a reachable NestJS API URL before starting. For a physical phone, `localhost` points to the phone itself; use a development machine address reachable on the same network or a secure tunnel. Production traffic must use HTTPS.

## Implemented client flows

- Welcome, sign in, account creation, profile, privacy and terms screens.
- Deep link and QR invitation parsing, invitation review and explicit purpose approval.
- Random app-installation identifier persisted in SecureStore and sent at acceptance; the backend must bind registration to the authenticated account and must not treat this value as an authentication factor.
- SecureStore access/refresh token persistence, a single-flight refresh request, and retry after a `401`.
- Device dashboard with Expo device, app, OS and battery diagnostics, sync/loading/error states, and offline messaging.
- Individual consent controls with official OS permission prompts for camera, selected media, foreground location and notifications.
- Visible camera preview, one-time foreground location sharing, owner-submitted security reports, and user-selected photo/document upload through a signed URL flow.
- Device disconnect and account deletion actions.

These are client implementations against the contract in `docs/api-documentation.md`. They are not end-to-end features until the NestJS routes and storage/identity services exist. In particular, routes for `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/me`, `/auth/logout`, `/auth/account`, `/devices/me`, invitation lookup/acceptance, device consent/revocation/location, notification registration, security event submission, and evidence upload request/completion are currently absent from the API modules.

## Verification status

See [`docs/phase-3-mobile-report.md`](../../docs/phase-3-mobile-report.md) for the exact TypeScript and platform bundle results, the backend gap, and native device testing limitations. A successful JavaScript bundle export does not verify native permissions, hardware, navigation interaction, or API behavior.
