import { cookies } from 'next/headers';

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
export const demoEnabled = process.env.NODE_ENV !== 'production' && process.env.ENABLE_DEMO_PREVIEW !== 'false';

export async function session() {
  const jar = await cookies();
  return { token: jar.get('sdm_access')?.value, demo: demoEnabled && jar.get('sdm_demo')?.value === '1' };
}

export async function apiFetch(path: string, token: string, init?: RequestInit) {
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, ...init?.headers },
    cache: 'no-store', signal: AbortSignal.timeout(10000),
  });
}

export async function isAdministrator(token: string) {
  const response = await apiFetch('/auth/me', token);
  if (!response.ok) return false;
  const user = await response.json() as { role?: string; roles?: string[] };
  return user.role === 'admin' || user.role === 'owner' || user.roles?.some(role => role === 'admin' || role === 'owner') === true;
}
