export type Resource = 'overview' | 'devices' | 'alerts' | 'approvals' | 'evidence' | 'reports' | 'users' | 'audit' | 'settings';
export interface Device { id: string; name: string; os: string; model: string; registeredAt: string; lastConnection: string | null; status: 'protected' | 'needs_review' | 'offline' | 'pending' | 'revoked'; consent: 'active' | 'pending' | 'revoked'; owner: string; }
export interface Alert { id: string; title: string; device: string; severity: 'critical' | 'high' | 'medium' | 'low'; occurredAt: string; status: 'open' | 'resolved'; }
export interface Approval { id: string; device: string; owner: string; requestedAt: string; purposes: string[]; status: string; }
export interface Evidence { id: string; name: string; device: string; uploader: string; uploadedAt: string; size: string; scanStatus: string; }
export interface Report { id: string; title: string; period: string; createdAt: string; status: string; }
export interface User { id: string; name: string; email: string; role: string; status: string; }
export interface Audit { id: string; actor: string; action: string; resource: string; outcome: string; occurredAt: string; }
export interface Overview { devices: number; connected: number; alerts: number; approvals: number; evidence: number; events: Alert[]; recentDevices: Device[]; }
export interface PageResult<T> { items: T[]; total: number; page: number; pageSize: number; demo?: boolean; }
