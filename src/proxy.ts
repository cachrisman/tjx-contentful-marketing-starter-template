import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { CONTENTFUL_PREVIEW_HEADER } from '@/lib/contentful/preview-request';
import { verifyPreviewToken } from '@/lib/contentful/preview-token';
import { defaultLocale, isLocale } from '@/lib/i18n/config';
import { NT_PROXY_PATH_HEADER, NT_SELECTION_HEADER } from '@/lib/personalization/config';
import { runProxyHero, type ProxyHeroResult } from '@/lib/personalization/proxy-hero';
import { normalizeSlug } from '@/lib/slug-normalize';

function applyHeroResult(response: NextResponse, hero: ProxyHeroResult | null) {
  if (!hero) return response;
  for (const cookie of hero.cookiesToSet) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(CONTENTFUL_PREVIEW_HEADER);
  // Never trust a client-sent selection header — only the proxy may set it.
  requestHeaders.delete(NT_SELECTION_HEADER);
  requestHeaders.delete(NT_PROXY_PATH_HEADER);

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
        // Preview entry via validated `cf_pt` only: skip Ninetailed proxy here so
        // Contentful iframe + draft tokens stay simple. For variant QA in the
        // Personalization app, use a non-`cf_pt` preview session or production-like URL.
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

  // Phase 3 — Ninetailed hybrid hero personalization. Always defensive: any
  // failure here returns `null` and the baseline path below renders the
  // baseline hero unchanged.
  const hero = await runProxyHero(request);
  if (hero) {
    for (const [name, value] of Object.entries(hero.requestHeadersToSet)) {
      requestHeaders.set(name, value);
    }
  }

  const passthrough = NextResponse.next({
    request: { headers: requestHeaders },
  });
  return applyHeroResult(passthrough, hero);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
