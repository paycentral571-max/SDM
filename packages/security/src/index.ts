/** Policy limits shared with clients; the API must independently enforce them. */
export const MAX_EVIDENCE_BYTES = 50 * 1024 * 1024;
export const ADMIN_ROLES = ['owner', 'admin'] as const;
export const EVIDENCE_DOWNLOAD_TTL_SECONDS = 60;

export type AdminRole = (typeof ADMIN_ROLES)[number];
