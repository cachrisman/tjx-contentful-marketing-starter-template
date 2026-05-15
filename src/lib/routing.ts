import { isLocale, type Locale } from '@/lib/i18n/config';
import { normalizeSlug } from '@/lib/slug-normalize';

/**
 * Parse `/{locale}` or `/{locale}/{slug}` for client-side links (e.g. draft toggle).
 * Returns `slugKey` `home` for the locale root.
 */
export function localeSlugKeyFromPathname(pathname: string | null): { locale: Locale; slugKey: string } | null {
  if (!pathname) return null;
  const seg = pathname.split('/').filter(Boolean);
  if (seg.length < 1 || !isLocale(seg[0])) return null;
  const locale = seg[0];
  if (seg.length < 2) return { locale, slugKey: 'home' };
  const n = normalizeSlug(seg[1]);
  return { locale, slugKey: !n || n === 'home' ? 'home' : n };
}

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
