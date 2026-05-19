import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { CONTENTFUL_PREVIEW_HEADER } from '@/lib/contentful/preview-request';
import { verifyPreviewToken, type PreviewTokenPayload } from '@/lib/contentful/preview-token';
import {
  getTimelineContextFromRequest,
  hasTimelineContext,
  isReconcilableHtmlNavigation,
  reconciledTimelineUrl,
  timelineContextFromPreviewToken,
  TIMELINE_RELEASE_HEADER,
  TIMELINE_TIMESTAMP_HEADER,
  urlHasTimelineDisplayParams,
  urlTimelineDisplayMatches,
  type TimelineContext,
} from '@/lib/contentful/timeline-proxy';
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

function applyTimelineHeaders(headers: Headers, ctx: TimelineContext): void {
  if (ctx.release) {
    headers.set(TIMELINE_RELEASE_HEADER, ctx.release);
  }
  if (ctx.timestamp) {
    headers.set(TIMELINE_TIMESTAMP_HEADER, ctx.timestamp);
  }
}

function resolveTrustedTimelineContext(
  request: NextRequest,
  cfPtPayload: PreviewTokenPayload | null,
  secret: string | undefined,
): TimelineContext | null {
  const fromCookie = getTimelineContextFromRequest(request, secret);
  if (fromCookie && hasTimelineContext(fromCookie)) {
    return fromCookie;
  }

  if (cfPtPayload && cfPtPayload.exp > Date.now()) {
    const fromToken = timelineContextFromPreviewToken(cfPtPayload);
    if (fromToken && hasTimelineContext(fromToken)) {
      return fromToken;
    }
  }

  return null;
}

function maybeTimelineReconcileRedirect(
  request: NextRequest,
  trusted: TimelineContext | null,
): NextResponse | null {
  if (!isReconcilableHtmlNavigation(request)) {
    return null;
  }

  const { nextUrl } = request;

  if (trusted && hasTimelineContext(trusted)) {
    if (urlTimelineDisplayMatches(nextUrl, trusted)) {
      return null;
    }
    const corrected = reconciledTimelineUrl(nextUrl, trusted);
    if (corrected) {
      return NextResponse.redirect(corrected, 307);
    }
    return null;
  }

  if (urlHasTimelineDisplayParams(nextUrl)) {
    const stripped = reconciledTimelineUrl(nextUrl, null);
    if (stripped) {
      return NextResponse.redirect(stripped, 307);
    }
  }

  return null;
}

function validateCfPtPath(
  request: NextRequest,
  verified: PreviewTokenPayload,
): { locale: string; slugKey: string } | null {
  const segments = request.nextUrl.pathname.split('/').filter(Boolean);
  if (segments.length < 1) return null;

  const loc = segments[0];
  const rawSlug = segments[1];
  const slug = rawSlug === undefined ? 'home' : normalizeSlug(rawSlug);
  const verifiedSlug = normalizeSlug(verified.slug);

  if (
    !isLocale(loc) ||
    verified.locale !== loc ||
    slug == null ||
    verifiedSlug == null ||
    verifiedSlug !== slug
  ) {
    return null;
  }

  return { locale: loc, slugKey: verified.slug };
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(CONTENTFUL_PREVIEW_HEADER);
  requestHeaders.delete(TIMELINE_RELEASE_HEADER);
  requestHeaders.delete(TIMELINE_TIMESTAMP_HEADER);
  // Never trust a client-sent selection header — only the proxy may set it.
  requestHeaders.delete(NT_SELECTION_HEADER);
  requestHeaders.delete(NT_PROXY_PATH_HEADER);

  const secret = process.env.CONTENTFUL_PREVIEW_SECRET;
  const cfPt = request.nextUrl.searchParams.get('cf_pt');

  let cfPtPayload: PreviewTokenPayload | null = null;
  let cfPtPathValid: { locale: string; slugKey: string } | null = null;

  if (secret && cfPt) {
    const verified = verifyPreviewToken(cfPt, secret);
    if (verified && verified.exp > Date.now()) {
      cfPtPathValid = validateCfPtPath(request, verified);
      if (cfPtPathValid) {
        cfPtPayload = verified;
      }
    }
  }

  const trustedTimeline = resolveTrustedTimelineContext(request, cfPtPayload, secret);
  if (trustedTimeline && hasTimelineContext(trustedTimeline)) {
    applyTimelineHeaders(requestHeaders, trustedTimeline);
  }

  if (cfPtPayload && cfPtPathValid) {
    const url = request.nextUrl.clone();
    url.searchParams.delete('cf_pt');
    requestHeaders.set(CONTENTFUL_PREVIEW_HEADER, '1');

    const reconcile = maybeTimelineReconcileRedirect(request, trustedTimeline);
    if (reconcile) {
      return reconcile;
    }

    return NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
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
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(url, 308);
  }

  const reconcile = maybeTimelineReconcileRedirect(request, trustedTimeline);
  if (reconcile) {
    return reconcile;
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
