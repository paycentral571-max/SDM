import { NextRequest, NextResponse } from 'next/server';
import { apiFetch, demoEnabled, isAdministrator } from '../../../lib/server-api';

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (!origin || !host) return false;
  try { const parsed = new URL(origin); return parsed.host === host && (process.env.NODE_ENV !== 'production' || parsed.protocol === 'https:'); }
  catch { return false; }
}
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ message:'Invalid origin' }, { status:403 });
  const body = await request.json().catch(() => null) as { demo?: boolean; email?: string; password?: string; code?: string } | null;
  if (body?.demo) {
    if (!demoEnabled) return NextResponse.json({ message:'Demo preview is unavailable' }, { status:403 });
    const response = NextResponse.json({ demo:true });
    response.cookies.set('sdm_demo','1',{ httpOnly:true,sameSite:'lax',path:'/',maxAge:3600 });
    return response;
  }
  if (!body?.email || !body.password || !body.code) return NextResponse.json({ message:'Email, password and MFA code are required' }, { status:400 });
  try {
    const auth = await apiFetch('/auth/login','', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:'' }, body:JSON.stringify({ email:body.email, password:body.password, code:body.code }) });
    if (!auth.ok) return NextResponse.json({ message:'Sign in failed or MFA was not accepted' }, { status:auth.status === 429 ? 429 : 401 });
    const payload = await auth.json() as { accessToken?: string; expiresIn?: number };
    if (!payload.accessToken || !(await isAdministrator(payload.accessToken))) return NextResponse.json({ message:'Administrator access is required' }, { status:403 });
    const response = NextResponse.json({ demo:false });
    response.cookies.set('sdm_access',payload.accessToken,{ httpOnly:true,secure:process.env.NODE_ENV === 'production',sameSite:'lax',path:'/',maxAge:Math.min(payload.expiresIn ?? 900,900) });
    return response;
  } catch { return NextResponse.json({ message:'Authentication service is unavailable' }, { status:503 }); }
}
export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ message:'Invalid origin' }, { status:403 });
  const response = NextResponse.json({ ok:true });
  response.cookies.delete('sdm_access'); response.cookies.delete('sdm_demo');
  return response;
}
