export type DeviceStatus = 'protected' | 'needs_review' | 'offline' | 'pending' | 'revoked';
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export interface Device { id: string; name: string; ownerId: string; platform: 'android' | 'ios'; osVersion: string; status: DeviceStatus; lastConnectedAt: string | null; }
export interface ConsentRecord { id: string; deviceId: string; userId: string; purpose: string; granted: boolean; grantedAt: string | null; revokedAt: string | null; }
