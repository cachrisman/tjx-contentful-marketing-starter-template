import { NextResponse } from 'next/server';

import { defaultLocale, isLocale } from '@/lib/i18n/config';

export function middleware(request: { nextUrl: URL }) {
  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.nextUrl));
  }

  const first = pathname.split('/').filter(Boolean)[0];
  if (first && !isLocale(first) && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
