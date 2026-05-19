/**
 * Proxy-safe Timeline helpers (no `server-only`, no `next/headers`).
 * Used by `src/proxy.ts` at the edge.
 */
import { verifySignedToken, type SignedTimelineCookiePayload } from '@/lib/contentful/signed-token';
import {
  TIMELINE_RELEASE_PARAM,
  TIMELINE_TIMESTAMP_PARAM,
  hasTimelineContext,
  timelineContextFromParts,
  validateRelease,
  validateTimestamp,
  type TimelineContext,
} from '@/lib/contentful/timeline-shared';

export { hasTimelineContext, type TimelineContext } from '@/lib/contentful/timeline-shared';

export const TIMELINE_RELEASE_HEADER = 'x-cf-timeline-release';
export const TIMELINE_TIMESTAMP_HEADER = 'x-cf-timeline-timestamp';
export const TIMELINE_COOKIE = 'ctf_tl';

function isTimelineCookiePayload(value: unknown): value is SignedTimelineCookiePayload {
  if (value == null || typeof value !== 'object') return false;
  const p = value as Record<string, unknown>;
  if (typeof p.exp !== 'number') return false;
  if (p.release !== undefined && typeof p.release !== 'string') return false;
  if (p.timestamp !== undefined && typeof p.timestamp !== 'string') return false;
  return true;
}

function verifyTimelineCookieValue(value: string, secret: string): TimelineContext | null {
  const payload = verifySignedToken(value, secret, isTimelineCookiePayload);
  if (!payload || payload.exp <= Date.now()) {
    return null;
  }
  const release = validateRelease(payload.release);
  const timestamp = validateTimestamp(payload.timestamp);
  if (!release && !timestamp) {
    return null;
  }
  return {
    ...(release ? { release } : {}),
    ...(timestamp ? { timestamp } : {}),
  };
}

/** Read signed timeline cookie from an incoming Request (proxy). */
export function getTimelineContextFromRequest(
  request: { cookies: { get: (name: string) => { value: string } | undefined } },
  secret: string | undefined,
): TimelineContext | null {
  if (!secret) return null;
  const raw = request.cookies.get(TIMELINE_COOKIE)?.value;
  if (!raw) return null;
  return verifyTimelineCookieValue(raw, secret);
}

export function timelineContextFromPreviewToken(
  payload: { release?: string; timestamp?: string } | null | undefined,
): TimelineContext | null {
  if (!payload) return null;
  return timelineContextFromParts(payload.release, payload.timestamp);
}

export function urlHasTimelineDisplayParams(url: URL): boolean {
  return (
    url.searchParams.has(TIMELINE_RELEASE_PARAM) || url.searchParams.has(TIMELINE_TIMESTAMP_PARAM)
  );
}

export function urlTimelineDisplayMatches(url: URL, ctx: TimelineContext): boolean {
  const urlRelease = url.searchParams.get(TIMELINE_RELEASE_PARAM);
  const urlTimestamp = url.searchParams.get(TIMELINE_TIMESTAMP_PARAM);
  return (ctx.release ?? null) === urlRelease && (ctx.timestamp ?? null) === urlTimestamp;
}

export function reconciledTimelineUrl(url: URL, trusted: TimelineContext | null): URL | null {
  const next = new URL(url.toString());
  const before = next.search;

  next.searchParams.delete(TIMELINE_RELEASE_PARAM);
  next.searchParams.delete(TIMELINE_TIMESTAMP_PARAM);

  if (trusted && hasTimelineContext(trusted)) {
    if (trusted.release) next.searchParams.set(TIMELINE_RELEASE_PARAM, trusted.release);
    if (trusted.timestamp) next.searchParams.set(TIMELINE_TIMESTAMP_PARAM, trusted.timestamp);
  }

  return next.search !== before ? next : null;
}

export function isReconcilableHtmlNavigation(request: {
  method: string;
  nextUrl: URL;
  headers: Headers;
}): boolean {
  if (request.method !== 'GET') return false;
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) return false;
  const accept = request.headers.get('accept') ?? '';
  return accept.includes('text/html');
}
