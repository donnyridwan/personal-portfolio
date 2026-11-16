// Lapisan pertama: /admin/* dan /api/admin/* wajib login. Tiap Server Action/route tetap mengecek sendiri.
import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE_NAME, isValidToken } from './lib/token';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === '/admin/login') return NextResponse.next();
  if (await isValidToken(req.cookies.get(COOKIE_NAME)?.value)) return NextResponse.next();
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Belum login' }, { status: 401 });
  }
  return NextResponse.redirect(new URL('/admin/login', req.url));
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
