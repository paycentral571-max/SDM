import { NextRequest, NextResponse } from 'next/server';
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === '/login' || path.startsWith('/api/') || path.startsWith('/_next/')) return NextResponse.next();
  const authorized = Boolean(request.cookies.get('sdm_access')) || (process.env.NODE_ENV !== 'production' && process.env.ENABLE_DEMO_PREVIEW !== 'false' && request.cookies.get('sdm_demo')?.value === '1');
  if (!authorized) return NextResponse.redirect(new URL('/login',request.url));
  return NextResponse.next();
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
