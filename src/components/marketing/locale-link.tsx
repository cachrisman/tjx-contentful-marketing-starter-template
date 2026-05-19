import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import { appendTimelineParamsToHref, pagePathWithUrlParameters, withLocalePath } from '@/lib/routing';

export function LocaleLink({
  locale,
  href,
  className,
  timelineDisplayParams,
  children,
  ...rest
}: {
  locale: Locale;
  href: string;
  className?: string;
  /** App-owned display params (`ctf_release`, `ctf_timestamp`) from layout or Timeline context. */
  timelineDisplayParams?: Record<string, string>;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Link>, 'href'>) {
  const localized = href.startsWith('/')
    ? withLocalePath(locale, href === '/' ? '' : href)
    : withLocalePath(locale, href);
  const full = appendTimelineParamsToHref(localized, timelineDisplayParams);

  return (
    <Link href={full} className={className} {...rest}>
      {children}
    </Link>
  );
}

export function LocalePageLink({
  locale,
  slug,
  urlParameters,
  className,
  timelineDisplayParams,
  children,
  ...rest
}: {
  locale: Locale;
  slug?: string | null;
  /** Optional query string from Contentful (e.g. `foo=1` or `?foo=1`). */
  urlParameters?: string | null;
  className?: string;
  timelineDisplayParams?: Record<string, string>;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Link>, 'href'>) {
  return (
    <Link
      href={pagePathWithUrlParameters(locale, slug, urlParameters, timelineDisplayParams)}
      className={className}
      {...rest}
    >
      {children}
    </Link>
  );
}
