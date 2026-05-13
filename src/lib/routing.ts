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

/** Appends a query string from Contentful `urlParameters` (with or without leading `?`). */
export function pagePathWithUrlParameters(
  locale: Locale,
  slug?: string | null,
  urlParameters?: string | null,
) {
  const base = pagePath(locale, slug);
  const raw = (urlParameters ?? '').trim();
  if (!raw) {
    return base;
  }
  const q = raw.startsWith('?') ? raw.slice(1) : raw;
  return base.includes('?') ? `${base}&${q}` : `${base}?${q}`;
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
