import type { Device } from '@sdm/shared-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
export async function listDevices(accessToken: string): Promise<Device[]> {
  const response = await fetch(`${API_URL}/devices`, { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' });
  if (!response.ok) throw new Error('Unable to load devices');
  return response.json() as Promise<Device[]>;
}
