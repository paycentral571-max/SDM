import type { Alert, Approval, Audit, Device, Evidence, Overview, Report, Resource, User } from './types';
export const demoDevices: Device[] = [
  { id:'demo-01', name:'Field Pixel 9', os:'Android 15', model:'Pixel 9 Pro', registeredAt:'2026-11-05T12:00:00Z', lastConnection:'2026-11-13T14:42:00Z', status:'protected', consent:'active', owner:'Maya Chen' },
  { id:'demo-02', name:'Executive iPhone', os:'iOS 18', model:'iPhone 16 Pro', registeredAt:'2026-11-02T12:00:00Z', lastConnection:'2026-11-13T13:20:00Z', status:'needs_review', consent:'active', owner:'Owen Brooks' },
  { id:'demo-03', name:'Studio Galaxy', os:'Android 14', model:'Galaxy S24', registeredAt:'2026-10-21T12:00:00Z', lastConnection:'2026-11-12T16:05:00Z', status:'offline', consent:'active', owner:'Priya Shah' },
  { id:'demo-04', name:'Research iPhone', os:'iOS 17', model:'iPhone 15', registeredAt:'2026-10-18T12:00:00Z', lastConnection:'2026-11-13T12:20:00Z', status:'protected', consent:'active', owner:'Elliot James' },
  { id:'demo-05', name:'Support Pixel', os:'Android 15', model:'Pixel 8', registeredAt:'2026-10-14T12:00:00Z', lastConnection:'2026-11-11T09:10:00Z', status:'offline', consent:'revoked', owner:'Ari Morgan' },
];
export const demoAlerts: Alert[] = [
  { id:'alert-01', title:'Authentication review requested', device:'Executive iPhone', severity:'high', occurredAt:'2026-11-13T14:18:00Z', status:'open' },
  { id:'alert-02', title:'Device diagnostic needs attention', device:'Studio Galaxy', severity:'medium', occurredAt:'2026-11-12T16:05:00Z', status:'open' },
  { id:'alert-03', title:'Owner reported suspicious activity', device:'Field Pixel 9', severity:'critical', occurredAt:'2026-11-11T10:30:00Z', status:'resolved' },
];
export const demoApprovals: Approval[] = [
  { id:'approval-01', device:'New iPhone', owner:'Jordan Lee', requestedAt:'2026-11-13T12:00:00Z', purposes:['Device diagnostics','Notifications'], status:'pending' },
  { id:'approval-02', device:'New Pixel', owner:'Sam Rivera', requestedAt:'2026-11-12T18:00:00Z', purposes:['Device diagnostics'], status:'pending' },
];
export const demoEvidence: Evidence[] = [{ id:'evidence-01', name:'owner-selected-log.pdf', device:'Field Pixel 9', uploader:'Maya Chen', uploadedAt:'2026-11-12T10:00:00Z', size:'1.2 MB', scanStatus:'clean' }];
export const demoReports: Report[] = [{ id:'report-01', title:'October security summary', period:'Oct 1–31, 2026', createdAt:'2026-11-01T10:00:00Z', status:'ready' }];
export const demoUsers: User[] = [{ id:'user-01', name:'Alex Carter', email:'alex@example.test', role:'Administrator', status:'active' },{ id:'user-02', name:'Maya Chen', email:'maya@example.test', role:'Device owner', status:'active' }];
export const demoAudit: Audit[] = [{ id:'audit-01', actor:'Alex Carter', action:'Invitation created', resource:'Device invitation', outcome:'success', occurredAt:'2026-11-13T12:00:00Z' },{ id:'audit-02', actor:'Maya Chen', action:'Evidence submitted', resource:'owner-selected-log.pdf', outcome:'success', occurredAt:'2026-11-12T10:00:00Z' }];
export const demoOverview: Overview = { devices:demoDevices.length, connected:3, alerts:demoAlerts.filter(a=>a.status==='open').length, approvals:demoApprovals.length, evidence:demoEvidence.length, events:demoAlerts, recentDevices:demoDevices.slice(0,4) };
export const demoCollections: Partial<Record<Resource, object[]>> = { devices:demoDevices, alerts:demoAlerts, approvals:demoApprovals, evidence:demoEvidence, reports:demoReports, users:demoUsers, audit:demoAudit };
