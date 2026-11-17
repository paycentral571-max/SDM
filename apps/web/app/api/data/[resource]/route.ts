import { NextRequest, NextResponse } from 'next/server';
import { demoCollections, demoDevices, demoOverview } from '../../../../lib/demo';
import { apiFetch, isAdministrator, session } from '../../../../lib/server-api';
import type { Resource } from '../../../../lib/types';

const paths: Record<Resource,string> = { overview:'/dashboard/overview', devices:'/devices', alerts:'/security-events', approvals:'/device-invitations/pending', evidence:'/evidence', reports:'/reports', users:'/users', audit:'/audit-logs', settings:'/settings' };
export async function GET(request: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  if (!(resource in paths)) return NextResponse.json({ message:'Unknown resource' }, { status:404 });
  const key = resource as Resource;
  const { token, demo } = await session();
  if (demo) {
    if (key === 'overview') return NextResponse.json({ ...demoOverview, demo:true });
    if (key === 'settings') return NextResponse.json({ organization:'Demo workspace', notificationEmail:true, sessionMinutes:15, demo:true });
    const id = request.nextUrl.searchParams.get('id');
    if (key === 'devices' && id) { const device = demoDevices.find(item => item.id === id); return device ? NextResponse.json({ ...device, demo:true }) : NextResponse.json({ message:'Device not found' }, { status:404 }); }
    const query = (request.nextUrl.searchParams.get('query') ?? '').toLowerCase().trim();
    const status = request.nextUrl.searchParams.get('status') ?? '';
    const page = Math.max(1,Number(request.nextUrl.searchParams.get('page')) || 1);
    const pageSize = 8;
    const items = (demoCollections[key] ?? []).filter(item => {
      const record = item as Record<string,unknown>;
      return (!query || Object.values(record).some(value => String(value).toLowerCase().includes(query))) && (!status || record.status === status || record.severity === status || record.scanStatus === status);
    });
    return NextResponse.json({ items:items.slice((page-1)*pageSize,page*pageSize), total:items.length, page, pageSize, demo:true });
  }
  if (!token) return NextResponse.json({ message:'Sign in required' }, { status:401 });
  try {
    if (!(await isAdministrator(token))) return NextResponse.json({ message:'Administrator access is required' }, { status:403 });
    const upstream = new URL(paths[key], process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001');
    const id = request.nextUrl.searchParams.get('id');
    if (key === 'devices' && id) upstream.pathname += `/${encodeURIComponent(id)}`;
    for (const [name,value] of request.nextUrl.searchParams) if (name !== 'id' && ['query','status','page','limit','cursor'].includes(name)) upstream.searchParams.set(name,value);
    const result = await apiFetch(`${upstream.pathname}${upstream.search}`,token);
    const payload = await result.json().catch(() => ({ message:'API returned an invalid response' }));
    return NextResponse.json(payload,{ status:result.status,headers:{ 'Cache-Control':'no-store' } });
  } catch { return NextResponse.json({ message:'Backend API is unavailable' }, { status:503 }); }
}
