# API documentation (draft contract)

All operational endpoints require `Authorization: Bearer <short-lived-access-token>` and an organization membership. The server derives organization and user identity from the verified token and membership, never a client-provided `organization_id`. Error bodies use `{ "code": string, "message": string }`; unauthorized and forbidden responses are `401` and `403` respectively. This is a design contract, not an implemented endpoint list. The dashboard expects `POST /auth/login` to return `{ accessToken, expiresIn }` and `GET /auth/me` to return an administrator role before the session is accepted.

| Method | Path | Request | Response |
| --- | --- | --- | --- |
| POST | `/device-invitations` | `{ "invitedEmail"?: string, "requestedPurposes": string[], "expiresInHours": number }` | `{ "id": string, "url": string, "expiresAt": string }` |
| POST | `/device-invitations/:token/accept` | `{ "deviceName": string, "platform": "android" \| "ios", "installationId": string, "approvedPurposes": string[] }` | `{ "deviceId": string, "consents": object[] }` |
| GET | `/devices?query=&status=&page=&limit=` | none | `{ "items": Device[], "total": number, "page": number, "pageSize": number }` |
| GET | `/dashboard/overview` | none | `{ "devices": number, "connected": number, "alerts": number, "approvals": number, "evidence": number, "events": Alert[], "recentDevices": Device[] }` |
| GET | `/device-invitations/pending` | none | `{ "items": Approval[], "total": number }` |
| GET | `/devices/:id` | none | `Device` or `404` within the current organization |
| POST | `/devices/:id/revoke` | `{ "reason"?: string }` | `204` |
| POST | `/devices/:id/consents/:purpose/revoke` | none | `204` |
| GET | `/security-events?cursor=` | none | `{ "items": SecurityEvent[], "nextCursor": string \| null }` |
| POST | `/evidence/upload-requests` | `{ "deviceId": string, "consentId": string, "fileName": string, "contentType": string, "size": number }` | `{ "uploadUrl": string, "objectId": string, "expiresAt": string }` |
| GET | `/evidence/:id/download` | none | `{ "downloadUrl": string, "expiresAt": string }` |

The dashboard also reads `GET /security-events`, `GET /reports`, `GET /users`, `GET /audit-logs`, and `GET /settings` with optional `query`, `status`, `page`, and `limit` parameters where appropriate. The current NestJS modules do not implement these routes yet. The web app proxies these requests through same-origin routes, keeps the access token in an HTTP-only cookie, verifies administrator membership with `/auth/me`, and forwards the token server-side.

Invitation acceptance must validate token hash, expiration, one-time use, organization identity, and owner approval in one transaction. Evidence completion must verify actual object size and type, uploader consent, malware scan result, and organization membership before any download. Every sensitive mutation and download writes an audit record.

The mobile app sends a random installation identifier stored in SecureStore during invitation acceptance. Treat it only as a device-installation hint: bind the registration to the authenticated user and validated invitation, and never use this client value as an identity or authorization factor.
