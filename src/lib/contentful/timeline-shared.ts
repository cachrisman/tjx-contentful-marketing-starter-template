/**
 * Browser-safe Timeline preview types and helpers (no `next/headers` / Node-only APIs).
 * Server code should import from `@/lib/contentful/timeline` instead.
 */

export const TIMELINE_RELEASE_PARAM = 'ctf_release';
export const TIMELINE_TIMESTAMP_PARAM = 'ctf_timestamp';

export type TimelineContext = {
  release?: string;
  timestamp?: string;
};

const RELEASE_RE = /^[a-zA-Z0-9_-]{1,64}$/;

/** RFC 3339 / ISO 8601 date-time (with or without fractional seconds). */
const TIMESTAMP_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

export function validateRelease(value: string | null | undefined): string | undefined {
  if (value == null || value === '') return undefined;
  const trimmed = value.trim();
  return RELEASE_RE.test(trimmed) ? trimmed : undefined;
}

export function validateTimestamp(value: string | null | undefined): string | undefined {
  if (value == null || value === '') return undefined;
  const trimmed = value.trim();
  if (!TIMESTAMP_RE.test(trimmed)) return undefined;
  const ms = Date.parse(trimmed);
  if (Number.isNaN(ms)) return undefined;
  return trimmed;
}

export function timelineContextFromParts(
  release: string | null | undefined,
  timestamp: string | null | undefined,
): TimelineContext | null {
  const r = validateRelease(release ?? undefined);
  const t = validateTimestamp(timestamp ?? undefined);
  if (!r && !t) return null;
  return { ...(r ? { release: r } : {}), ...(t ? { timestamp: t } : {}) };
}

export function hasTimelineContext(ctx: TimelineContext | null | undefined): ctx is TimelineContext {
  return ctx != null && (ctx.release != null || ctx.timestamp != null);
}

export function timelineDisplayParams(
  ctx: TimelineContext | null | undefined,
): Record<string, string> | undefined {
  if (!hasTimelineContext(ctx)) return undefined;
  const params: Record<string, string> = {};
  if (ctx.release) params[TIMELINE_RELEASE_PARAM] = ctx.release;
  if (ctx.timestamp) params[TIMELINE_TIMESTAMP_PARAM] = ctx.timestamp;
  return Object.keys(params).length > 0 ? params : undefined;
}
