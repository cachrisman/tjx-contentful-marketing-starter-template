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
  extraParams?: Record<string, string>,
) {
  const base = pagePath(locale, slug);
  const url = new URL(base, 'https://local.invalid');

  const raw = (urlParameters ?? '').trim();
  if (raw) {
    const cmsParams = new URLSearchParams(raw.startsWith('?') ? raw.slice(1) : raw);
    for (const [key, value] of cmsParams.entries()) {
      url.searchParams.set(key, value);
    }
  }

  if (extraParams) {
    for (const [key, value] of Object.entries(extraParams)) {
      if (value) {
        url.searchParams.set(key, value);
      }
    }
  }

  const q = url.search;
  return q ? `${url.pathname}${q}` : url.pathname;
}

/** Merge timeline display params into an existing localized href. */
export function appendTimelineParamsToHref(
  href: string,
  extraParams?: Record<string, string>,
): string {
  if (!extraParams || Object.keys(extraParams).length === 0) {
    return href;
  }
  const url = new URL(href, 'https://local.invalid');
  for (const [key, value] of Object.entries(extraParams)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }
  return `${url.pathname}${url.search}${url.hash}`;
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
