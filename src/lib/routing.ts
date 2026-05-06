import type { Locale } from '@/lib/i18n/config';
import { normalizeSlug } from '@/lib/slug-normalize';

/** Public URL path for a Page slug and locale (home slug → locale root). */
export function pagePath(locale: Locale, slug?: string | null) {
  const s = normalizeSlug(slug ?? null);
  if (!s || s === 'home') {
    return `/${locale}`;
  }
  return `/${locale}/${s}`;
}

export function withLocalePath(locale: Locale, path: string) {
  if (path === '/' || path === '') {
    return `/${locale}`;
  }
  const p = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${p}`;
}

/** Path relative to locale root for Page slug (used with LocaleLink / withLocalePath). */
export function hrefForPageSlug(slug?: string | null) {
  const s = normalizeSlug(slug ?? null);
  if (!s || s === 'home') return '/';
  return `/${s}`;
}
