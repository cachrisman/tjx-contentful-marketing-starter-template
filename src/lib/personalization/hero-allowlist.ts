import { isLocale } from '@/lib/i18n/config';
import { normalizeSlug } from '@/lib/slug-normalize';

/**
 * Decide whether a request's pathname renders a personalised hero (Phase 3.2.5).
 *
 * The allowlist is intentionally narrow to avoid generating profile events on
 * pages that don't show a hero (e.g. `/careers`, `/api/...`, asset paths).
 * Today the only personalised surfaces are:
 *   - `/{locale}`         → home page
 *   - `/{locale}/{slug}`  → marketing landings
 *
 * Anything else returns `null`; the proxy treats `null` as a baseline passthrough.
 */
export type HeroRouteMatch = {
  locale: string;
  slug: string;
};

export function matchHeroRoute(pathname: string): HeroRouteMatch | null {
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico'
  ) {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) {
    return null;
  }

  const [locale, rawSlug] = segments;
  if (!isLocale(locale)) {
    return null;
  }

  if (segments.length === 1) {
    return { locale, slug: 'home' };
  }
  if (segments.length === 2) {
    const slug = normalizeSlug(rawSlug);
    if (slug == null) return null;
    return { locale, slug };
  }
  return null;
}
