import { normalizeSlug } from '@/lib/slug-normalize';
import { isLocale } from '@/lib/i18n/config';

/** Resolves the page slug used for the ESR allowlist (`home` for `/{locale}`). */
export function slugForPersonalizationPath(pathname: string): string | null {
  const segs = pathname.split('/').filter(Boolean);
  if (segs.length === 1 && isLocale(segs[0])) return 'home';
  if (segs.length >= 2 && isLocale(segs[0])) {
    return normalizeSlug(segs[1]);
  }
  return null;
}

/**
 * Whether `src/proxy.ts` may run Ninetailed for this **slug** (from
 * `matchHeroRoute` / `slugForPersonalizationPath`).
 *
 * - **Unset or `*`** — wildcard: every hero-shaped route (`/{locale}`,
 *   `/{locale}/{slug}`) is evaluated (still subject to `matchHeroRoute` and
 *   prefetch/RSC skips in `proxy-hero`).
 * - **Comma list** — e.g. `home,about-us` restricts to those slugs only.
 * - A list entry of `*` anywhere enables wildcard for the whole value.
 */
export function isPersonalizationSlug(slug: string | null): boolean {
  if (slug == null) return false;
  const raw = process.env.NINETAILED_ESR_SLUGS?.trim();
  if (!raw || raw === '*') {
    return true;
  }
  const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length === 0 || parts.includes('*')) {
    return true;
  }
  return new Set(parts).has(slug);
}
