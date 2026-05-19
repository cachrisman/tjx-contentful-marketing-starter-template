import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

import { defaultLocale, isLocale } from '@/lib/i18n/config';
import { signPreviewToken } from '@/lib/contentful/preview-token';
import {
  deleteTimelineCookie,
  parseTimelineToken,
  setTimelineCookie,
  TIMELINE_RELEASE_PARAM,
  TIMELINE_TIMESTAMP_PARAM,
  TIMELINE_COOKIE_MAX_AGE_SEC,
  validateRelease,
  validateTimestamp,
  type TimelineContext,
} from '@/lib/contentful/timeline';
import { normalizeSlug } from '@/lib/slug-normalize';

/**
 * Enables Next.js Draft Mode and redirects to the requested page (optionally with signed `cf_pt`
 * when `CONTENTFUL_PREVIEW_SECRET` is set — used by `src/proxy.ts` for iframe preview).
 *
 * **Security:** By default requires `?secret=` matching `CONTENTFUL_PREVIEW_SECRET` (Contentful
 * preview URL). Set `CONTENTFUL_POC_PREVIEW_TOGGLE=1` to allow unauthenticated enable for demos
 * (gear menu); keep off in production. Timeline minting requires the real preview secret.
 */
function allowUnsealedDraftEnable(): boolean {
  return process.env.CONTENTFUL_POC_PREVIEW_TOGGLE === '1';
}

function resolveTimelineFromSearchParams(
  searchParams: URLSearchParams,
): { context: TimelineContext; hadTimelineParam: boolean } {
  const timelineParam = searchParams.get('timeline');
  const hadTimelineParam = timelineParam !== null;

  if (timelineParam !== null) {
    const trimmed = timelineParam.trim();
    if (trimmed === '' || trimmed.toLowerCase() === 'current') {
      return { context: {}, hadTimelineParam: true };
    }
    const fromToken = parseTimelineToken(trimmed);
    return { context: fromToken, hadTimelineParam: true };
  }

  const release =
    validateRelease(searchParams.get('release') ?? searchParams.get('releaseId') ?? undefined) ??
    undefined;
  const timestamp = validateTimestamp(searchParams.get('timestamp') ?? undefined) ?? undefined;

  return {
    context: { ...(release ? { release } : {}), ...(timestamp ? { timestamp } : {}) },
    hadTimelineParam: false,
  };
}

function appendDisplayParams(path: string, ctx: TimelineContext): string {
  const url = new URL(path, 'https://preview.local');
  if (ctx.release) url.searchParams.set(TIMELINE_RELEASE_PARAM, ctx.release);
  if (ctx.timestamp) url.searchParams.set(TIMELINE_TIMESTAMP_PARAM, ctx.timestamp);
  const q = url.search;
  return q ? `${url.pathname}${q}` : url.pathname;
}

function pathWithCfPt(path: string, cfPt: string): string {
  const url = new URL(path, 'https://preview.local');
  url.searchParams.set('cf_pt', cfPt);
  return `${url.pathname}${url.search}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams } = url;
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');
  const localeParam = searchParams.get('locale');
  const locale =
    localeParam != null && isLocale(localeParam) ? localeParam : defaultLocale;

  const expected = process.env.CONTENTFUL_PREVIEW_SECRET;
  const secretOk = expected != null && expected !== '' && secret === expected;
  if (!secretOk && !allowUnsealedDraftEnable()) {
    return new Response('Invalid secret', { status: 401 });
  }

  const hasTimelineQuery =
    searchParams.has('timeline') ||
    searchParams.has('release') ||
    searchParams.has('releaseId') ||
    searchParams.has('timestamp');

  if (!secretOk && hasTimelineQuery) {
    return new Response('Timeline preview requires CONTENTFUL_PREVIEW_SECRET', { status: 401 });
  }

  const { context: timelineContext, hadTimelineParam } =
    resolveTimelineFromSearchParams(searchParams);

  const draft = await draftMode();
  draft.enable();

  const previewSecret = process.env.CONTENTFUL_PREVIEW_SECRET;
  const slugNorm = slug ? normalizeSlug(slug) : null;
  const slugKey = !slugNorm || slugNorm === 'home' ? 'home' : slugNorm;
  let path = slugKey === 'home' ? `/${locale}` : `/${locale}/${slugKey}`;

  const hasActiveTimeline =
    timelineContext.release != null || timelineContext.timestamp != null;

  if (hasActiveTimeline) {
    path = appendDisplayParams(path, timelineContext);
  }

  const redirectPath =
    previewSecret != null && previewSecret !== ''
      ? pathWithCfPt(
          path,
          signPreviewToken(
            {
              locale,
              slug: slugKey,
              exp: Date.now() + TIMELINE_COOKIE_MAX_AGE_SEC * 1000,
              ...(timelineContext.release ? { release: timelineContext.release } : {}),
              ...(timelineContext.timestamp ? { timestamp: timelineContext.timestamp } : {}),
            },
            previewSecret,
          ),
        )
      : path;

  const res = NextResponse.redirect(new URL(redirectPath, url.origin));

  if (previewSecret && secretOk) {
    if (hasActiveTimeline) {
      setTimelineCookie(res, timelineContext, previewSecret);
    } else if (hadTimelineParam) {
      // `timeline=current`, invalid token, or empty parsed values — drop stale session.
      deleteTimelineCookie(res);
    }
  }

  return res;
}
