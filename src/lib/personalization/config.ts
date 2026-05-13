/**
 * Centralised env / cookie / header constants for the Ninetailed integration.
 *
 * Keep names stable — they are referenced from both client (`use client`)
 * components and the proxy. Header names are HTTP-lowercased.
 */

import { NINETAILED_ANONYMOUS_ID_COOKIE } from '@ninetailed/experience.js-shared';

/** Anonymous profile id cookie name from the shared SDK constant (Phase 1.D). */
export const NT_ANONYMOUS_ID_COOKIE = NINETAILED_ANONYMOUS_ID_COOKIE;

/**
 * Sentinel set by `src/proxy.ts` ONLY when it actually performed the initial
 * Experience `page` event for an allowlisted hero request. Read by the client
 * `TrackPages` component to skip exactly one initial `page()` call (Phase 1.D).
 *
 * Non-HttpOnly so the browser can read it for the skip handshake. `SameSite=Lax`,
 * short `Max-Age`. `Secure` is added on HTTPS by the proxy.
 */
export const NT_INITIAL_PAGE_HANDLED_COOKIE = 'nt_initial_page_handled';

/**
 * Internal signed selection header forwarded by `src/proxy.ts` via
 * `NextResponse.next/rewrite({ request: { headers } })` so the same-request
 * RSC `headers()` read can render the variant in the first HTML (Phase 3.3).
 *
 * The value is `<base64url(JSON)>.<base64url(HMAC-SHA256(secret, body))>` —
 * the same shape used elsewhere for `cf_pt` (`signPreviewToken`). Never trust
 * a client-sent value; the proxy strips it from the incoming request before
 * setting its own.
 */
export const NT_SELECTION_HEADER = 'x-nt-selection';

/**
 * Request pathname as seen by `src/proxy.ts`, forwarded only on the mutated
 * request (never trust inbound). Used with {@link NT_SELECTION_HEADER} so a
 * signed token cannot be replayed across routes within the TTL window.
 */
export const NT_PROXY_PATH_HEADER = 'x-nt-proxy-path';

/**
 * Short-lived mirror of {@link NT_PROXY_PATH_HEADER} for follow-up `cookies()`
 * reads when the internal header is absent. **HttpOnly** — path is not needed in
 * JS; verification still requires a valid signed selection token.
 */
export const NT_PROXY_PATH_COOKIE = 'nt_proxy_path';

/**
 * Optional `HttpOnly` selection cookie set in addition to the request header,
 * so follow-up RSC reads via `cookies()` can recover the same selection
 * without another Experience API round-trip (Phase 3.3).
 */
export const NT_SELECTION_COOKIE = 'nt_selection';

/** Default edge budget for the Experience API call inside `src/proxy.ts`. */
export const DEFAULT_PROXY_TIMEOUT_MS = 500;

export function readProxyTimeoutMs(): number {
  const raw = process.env.NINETAILED_PROXY_TIMEOUT_MS;
  if (!raw) return DEFAULT_PROXY_TIMEOUT_MS;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 && n <= 5_000 ? n : DEFAULT_PROXY_TIMEOUT_MS;
}

export function readExperienceApiUrl(): string {
  return process.env.NINETAILED_API_URL?.trim() || 'https://experience.ninetailed.co';
}

export function readPublicClientId(): string | undefined {
  const v = process.env.NEXT_PUBLIC_NINETAILED_CLIENT_ID?.trim();
  return v || undefined;
}

export function readPublicEnvironment(): string | undefined {
  const v = process.env.NEXT_PUBLIC_NINETAILED_ENVIRONMENT?.trim();
  return v || undefined;
}

export function readSelectionSecret(): string | undefined {
  const v = process.env.NINETAILED_SELECTION_SECRET?.trim();
  return v || undefined;
}
