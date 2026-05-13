import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Payload signed into the `x-nt-selection` header forwarded by `src/proxy.ts`.
 *
 * `experienceVariants` maps the Ninetailed Experience id → selected variant index
 * (0 = baseline). `profileId` is the same value as the `ntaid` cookie so RSC
 * can render audience-targeted content without re-deriving identity.
 *
 * `exp` is a short TTL — the header is only meaningful for one request anyway,
 * but we still verify it to harden against replay if anyone ever extracts it.
 */
export type NtSelectionPayload = {
  v: 1;
  /** Same as `NextRequest.nextUrl.pathname` when the token was minted. */
  pathname: string;
  profileId: string;
  experienceVariants: Record<string, number>;
  audienceIds?: string[];
  exp: number;
};

export function signSelection(payload: NtSelectionPayload, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifySelection(
  token: string | null | undefined,
  secret: string | null | undefined,
  /** Forwarded pathname from `NT_PROXY_PATH_HEADER`; must match the signed payload. */
  proxyPathname: string | null | undefined,
): NtSelectionPayload | null {
  if (!token || !secret) return null;
  const dot = token.indexOf('.');
  if (dot === -1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!body || !sig) return null;

  const expectedSig = createHmac('sha256', secret).update(body).digest('base64url');
  const sigBuf = Buffer.from(sig, 'utf8');
  const expBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const json = Buffer.from(body, 'base64url').toString('utf8');
    const payload = JSON.parse(json) as Partial<NtSelectionPayload>;
    if (
      payload.v !== 1 ||
      typeof payload.pathname !== 'string' ||
      !payload.pathname ||
      typeof payload.profileId !== 'string' ||
      typeof payload.exp !== 'number' ||
      payload.exp < Date.now() ||
      typeof payload.experienceVariants !== 'object' ||
      payload.experienceVariants == null
    ) {
      return null;
    }
    if (!proxyPathname || payload.pathname !== proxyPathname) {
      return null;
    }
    const cleanVariants: Record<string, number> = {};
    for (const [k, v] of Object.entries(payload.experienceVariants)) {
      if (typeof k === 'string' && typeof v === 'number' && Number.isInteger(v) && v >= 0) {
        cleanVariants[k] = v;
      }
    }
    return {
      v: 1,
      pathname: payload.pathname,
      profileId: payload.profileId,
      experienceVariants: cleanVariants,
      audienceIds: Array.isArray(payload.audienceIds)
        ? payload.audienceIds.filter((a): a is string => typeof a === 'string')
        : undefined,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}
