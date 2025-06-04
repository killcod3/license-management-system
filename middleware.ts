import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Admin routes protection
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.type !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // User routes protection
  if (pathname.startsWith('/user') && pathname !== '/user/login') {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/user/login', request.url));
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.type !== 'user') {
      return NextResponse.redirect(new URL('/user/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*'],
};