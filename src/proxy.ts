import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { CONTENTFUL_PREVIEW_HEADER } from '@/lib/contentful/preview-request';
import { verifyPreviewToken } from '@/lib/contentful/preview-token';
import { defaultLocale, isLocale } from '@/lib/i18n/config';
import { normalizeSlug } from '@/lib/slug-normalize';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(CONTENTFUL_PREVIEW_HEADER);

  const secret = process.env.CONTENTFUL_PREVIEW_SECRET;
  const cfPt = request.nextUrl.searchParams.get('cf_pt');
  if (secret && cfPt) {
    const verified = verifyPreviewToken(cfPt, secret);
    const segments = pathname.split('/').filter(Boolean);
    if (verified && verified.exp > Date.now() && segments.length >= 1) {
      const loc = segments[0];
      const rawSlug = segments[1];
      const slug = rawSlug === undefined ? 'home' : normalizeSlug(rawSlug);
      const verifiedSlug = normalizeSlug(verified.slug);
      if (
        isLocale(loc) &&
        verified.locale === loc &&
        slug != null &&
        verifiedSlug != null &&
        verifiedSlug === slug
      ) {
        const url = request.nextUrl.clone();
        url.searchParams.delete('cf_pt');
        requestHeaders.set(CONTENTFUL_PREVIEW_HEADER, '1');
        return NextResponse.rewrite(url, {
          request: { headers: requestHeaders },
        });
      }
    }
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.nextUrl));
  }

  const pathSegments = pathname.split('/').filter(Boolean);
  if (!cfPt && pathSegments.length >= 2 && isLocale(pathSegments[0])) {
    const rawSlugSeg = pathSegments[1];
    const norm = normalizeSlug(rawSlugSeg);
    if (norm === null) {
      return new NextResponse(null, { status: 404 });
    }
    if (norm !== rawSlugSeg) {
      const url = request.nextUrl.clone();
      url.pathname = `/${pathSegments[0]}/${norm}`;
      return NextResponse.redirect(url, 308);
    }
  }

  const first = pathname.split('/').filter(Boolean)[0];
  if (first && !isLocale(first) && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.nextUrl));
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
