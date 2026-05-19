/**
 * Server-only Timeline preview — signed cookies, proxy helpers, request context.
 *
 * GraphQL (confirmed against generated `TimelineFilterInput` in this space):
 *   `@timeline(where: { release_lte?: String, timestamp_lte?: DateTime })` on the operation.
 *
 * Token parsing (`@contentful/timeline-preview`):
 *   `parseTimelinePreviewToken` → `{ releaseId?: string; timestamp?: string }` (raw segments;
 *   timestamps may omit milliseconds, e.g. `2025-11-29T08:46:15Z`).
 */
import 'server-only';

import { parseTimelinePreviewToken } from '@contentful/timeline-preview';
import { cookies, headers } from 'next/headers';
import type { NextResponse } from 'next/server';

import {
  signSignedToken,
  verifySignedToken,
  type SignedTimelineCookiePayload,
} from '@/lib/contentful/signed-token';
import {
  TIMELINE_RELEASE_PARAM,
  TIMELINE_TIMESTAMP_PARAM,
  timelineContextFromParts,
  validateRelease,
  validateTimestamp,
  type TimelineContext,
} from '@/lib/contentful/timeline-shared';

export {
  TIMELINE_RELEASE_PARAM,
  TIMELINE_TIMESTAMP_PARAM,
  hasTimelineContext,
  timelineDisplayParams,
  timelineContextFromParts,
  validateRelease,
  validateTimestamp,
  type TimelineContext,
} from '@/lib/contentful/timeline-shared';

export const TIMELINE_RELEASE_HEADER = 'x-cf-timeline-release';
export const TIMELINE_TIMESTAMP_HEADER = 'x-cf-timeline-timestamp';
export const TIMELINE_COOKIE = 'ctf_tl';

/** 15 minutes — matches `cf_pt` first-hop horizon; re-mint on each `/api/draft/enable`. */
export const TIMELINE_COOKIE_MAX_AGE_SEC = 15 * 60;

export const TIMELINE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
  path: '/',
};

export function parseTimelineToken(token: string | null | undefined): TimelineContext {
  if (token == null || token.trim() === '') {
    return {};
  }
  try {
    const parsed = parseTimelinePreviewToken(token.trim());
    const release = validateRelease(parsed.releaseId);
    const timestamp = validateTimestamp(parsed.timestamp);
    return { ...(release ? { release } : {}), ...(timestamp ? { timestamp } : {}) };
  } catch {
    return {};
  }
}

export function signTimelineCookie(payload: SignedTimelineCookiePayload, secret: string): string {
  return signSignedToken(payload, secret);
}

export function verifyTimelineCookie(
  value: string,
  secret: string,
): SignedTimelineCookiePayload | null {
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
    exp: payload.exp,
    ...(release ? { release } : {}),
    ...(timestamp ? { timestamp } : {}),
  };
}

function isTimelineCookiePayload(value: unknown): value is SignedTimelineCookiePayload {
  if (value == null || typeof value !== 'object') return false;
  const p = value as Record<string, unknown>;
  if (typeof p.exp !== 'number') return false;
  if (p.release !== undefined && typeof p.release !== 'string') return false;
  if (p.timestamp !== undefined && typeof p.timestamp !== 'string') return false;
  return true;
}

export function deleteTimelineCookie(res: NextResponse): void {
  res.cookies.set(TIMELINE_COOKIE, '', { ...TIMELINE_COOKIE_OPTIONS, maxAge: 0 });
}

export function setTimelineCookie(
  res: NextResponse,
  ctx: TimelineContext,
  secret: string,
): void {
  const exp = Date.now() + TIMELINE_COOKIE_MAX_AGE_SEC * 1000;
  res.cookies.set(
    TIMELINE_COOKIE,
    signTimelineCookie({ ...ctx, exp }, secret),
    { ...TIMELINE_COOKIE_OPTIONS, maxAge: TIMELINE_COOKIE_MAX_AGE_SEC },
  );
}

export async function getTimelineContextFromSignedCookie(): Promise<TimelineContext | null> {
  const secret = process.env.CONTENTFUL_PREVIEW_SECRET;
  if (!secret) return null;

  const c = await cookies();
  const raw = c.get(TIMELINE_COOKIE)?.value;
  if (!raw) return null;

  const verified = verifyTimelineCookie(raw, secret);
  if (!verified) return null;

  return {
    ...(verified.release ? { release: verified.release } : {}),
    ...(verified.timestamp ? { timestamp: verified.timestamp } : {}),
  };
}

export async function getTimelineContextFromTrustedHeaders(): Promise<TimelineContext | null> {
  const h = await headers();
  return timelineContextFromParts(
    h.get(TIMELINE_RELEASE_HEADER),
    h.get(TIMELINE_TIMESTAMP_HEADER),
  );
}

export type GetTimelineContextOptions = {
  /**
   * When true, read `x-cf-timeline-*` headers set by `src/proxy.ts` after stripping client
   * spoofing. Use only for layout/page RSC behind the proxy — never for `/api/*` routes.
   */
  trustProxyHeaders?: boolean;
};

/**
 * Resolves active Timeline context for server rendering / GraphQL.
 * Defaults to signed-cookie verification only so `/api/*` handlers cannot be fooled by
 * client-sent `x-cf-timeline-*` headers.
 */
/**
 * Signed cookie is authoritative when present; proxy headers are a first-hop fallback only
 * (e.g. before the browser stores `ctf_tl`, when `cf_pt` still carries timeline trust).
 */
export async function getTimelineContext(
  options: GetTimelineContextOptions = {},
): Promise<TimelineContext | null> {
  const { trustProxyHeaders = false } = options;

  const fromCookie = await getTimelineContextFromSignedCookie();
  if (fromCookie) return fromCookie;

  if (trustProxyHeaders) {
    return getTimelineContextFromTrustedHeaders();
  }

  return null;
}
