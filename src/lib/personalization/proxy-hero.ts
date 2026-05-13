import { randomUUID } from 'node:crypto';
import type { NextRequest } from 'next/server';

import {
  buildPageEvent,
  NinetailedApiClient,
} from '@ninetailed/experience.js-shared';

import {
  NT_ANONYMOUS_ID_COOKIE,
  NT_INITIAL_PAGE_HANDLED_COOKIE,
  NT_PROXY_PATH_COOKIE,
  NT_PROXY_PATH_HEADER,
  NT_SELECTION_COOKIE,
  NT_SELECTION_HEADER,
  readExperienceApiUrl,
  readProxyTimeoutMs,
  readPublicClientId,
  readPublicEnvironment,
  readSelectionSecret,
} from '@/lib/personalization/config';
import { matchHeroRoute } from '@/lib/personalization/hero-allowlist';
import { isPersonalizationSlug } from '@/lib/personalization/proxy-route';
import { signSelection } from '@/lib/personalization/selection-header';

/**
 * Phase 3 helper — runs inside `src/proxy.ts` for allowlisted hero requests.
 *
 * Uses `NinetailedApiClient` + `buildPageEvent` from `@ninetailed/experience.js-shared`
 * so request/response shapes stay aligned with the pinned SDK (review gate).
 */
export type ProxyHeroResult = {
  requestHeadersToSet: Record<string, string>;
  cookiesToSet: Array<{
    name: string;
    value: string;
    options: {
      path: string;
      sameSite: 'lax';
      httpOnly?: boolean;
      secure?: boolean;
      maxAge: number;
    };
  }>;
};

function shouldSkipPersonalization(request: NextRequest): boolean {
  if (request.method !== 'GET') return true;
  const url = request.nextUrl;
  if (url.pathname.startsWith('/_next')) return true;
  if (url.pathname.startsWith('/api')) return true;

  const h = request.headers;
  if (h.get('next-router-prefetch')) return true;
  if (h.get('next-router-segment-prefetch')) return true;
  const secPurpose = h.get('sec-purpose') ?? h.get('Sec-Purpose');
  if (secPurpose?.toLowerCase().includes('prefetch')) return true;
  if (h.get('purpose') === 'prefetch') return true;
  if (h.get('x-purpose') === 'prefetch') return true;
  if (h.get('next-router-state-tree')) {
    return true;
  }
  const accept = h.get('accept') ?? '';
  if (!accept.includes('text/html') && !accept.includes('*/*') && accept !== '') {
    return true;
  }
  return false;
}

function readAnonymousCookie(request: NextRequest): string | undefined {
  return request.cookies.get(NT_ANONYMOUS_ID_COOKIE)?.value || undefined;
}

function sentinelClearCookie(isSecure: boolean): ProxyHeroResult['cookiesToSet'][0] {
  return {
    name: NT_INITIAL_PAGE_HANDLED_COOKIE,
    value: '',
    options: {
      path: '/',
      sameSite: 'lax',
      secure: isSecure,
      maxAge: 0,
    },
  };
}

export async function runProxyHero(request: NextRequest): Promise<ProxyHeroResult | null> {
  if (shouldSkipPersonalization(request)) return null;

  const route = matchHeroRoute(request.nextUrl.pathname);
  if (!route || !isPersonalizationSlug(route.slug)) return null;

  const clientId = readPublicClientId();
  const secret = readSelectionSecret();
  if (!clientId || !secret) {
    return null;
  }

  const environment = readPublicEnvironment();
  const timeoutMs = readProxyTimeoutMs();
  const anonymousId = readAnonymousCookie(request) ?? randomUUID();
  const isSecure = request.nextUrl.protocol === 'https:';

  const url = request.nextUrl.toString();
  const pathname = request.nextUrl.pathname;
  const pathLocale = route.locale;

  const pageEvent = buildPageEvent({
    messageId: randomUUID(),
    timestamp: Date.now(),
    ctx: {
      url,
      referrer: request.headers.get('referer') ?? '',
      locale: pathLocale,
      userAgent: request.headers.get('user-agent') ?? '',
      document: { title: '' },
    },
    properties: {
      path: pathname,
      query: Object.fromEntries(request.nextUrl.searchParams.entries()),
      referrer: request.headers.get('referer') ?? '',
      search: request.nextUrl.search,
      title: '',
      url,
    },
  });

  const api = new NinetailedApiClient({
    clientId,
    environment: environment || undefined,
    preview: false,
    url: readExperienceApiUrl(),
  });

  let result: Awaited<ReturnType<NinetailedApiClient['upsertProfile']>> | undefined;
  try {
    result = await api.upsertProfile(
      { profileId: anonymousId, events: [pageEvent] },
      {
        timeout: timeoutMs,
        locale: pathLocale,
      },
    );
  } catch {
    return {
      requestHeadersToSet: {},
      cookiesToSet: [sentinelClearCookie(isSecure)],
    };
  }

  if (!result?.profile?.id) {
    return {
      requestHeadersToSet: {},
      cookiesToSet: [sentinelClearCookie(isSecure)],
    };
  }

  const profileId = result.profile.id;
  const experienceVariants: Record<string, number> = {};
  for (const e of result.experiences ?? []) {
    if (typeof e.experienceId === 'string' && typeof e.variantIndex === 'number') {
      experienceVariants[e.experienceId] = e.variantIndex;
    }
  }
  const audienceIds = Array.isArray(result.profile.audiences) ? result.profile.audiences : [];

  const exp = Date.now() + 60_000;
  const selectionToken = signSelection(
    { v: 1, pathname, profileId, experienceVariants, audienceIds, exp },
    secret,
  );

  return {
    requestHeadersToSet: {
      [NT_SELECTION_HEADER]: selectionToken,
      [NT_PROXY_PATH_HEADER]: pathname,
    },
    cookiesToSet: [
      {
        name: NT_ANONYMOUS_ID_COOKIE,
        value: profileId,
        options: {
          path: '/',
          sameSite: 'lax',
          secure: isSecure,
          maxAge: 60 * 60 * 24 * 365,
        },
      },
      {
        name: NT_INITIAL_PAGE_HANDLED_COOKIE,
        value: '1',
        options: {
          path: '/',
          sameSite: 'lax',
          secure: isSecure,
          maxAge: 60,
        },
      },
      {
        name: NT_SELECTION_COOKIE,
        value: selectionToken,
        options: {
          path: '/',
          sameSite: 'lax',
          httpOnly: true,
          secure: isSecure,
          maxAge: 60,
        },
      },
      {
        name: NT_PROXY_PATH_COOKIE,
        value: pathname,
        options: {
          path: '/',
          sameSite: 'lax',
          httpOnly: true,
          secure: isSecure,
          maxAge: 60,
        },
      },
    ],
  };
}
